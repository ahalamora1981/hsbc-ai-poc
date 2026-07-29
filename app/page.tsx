'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { CampaignState, ChatMessage, ModuleName, FieldStatus, ReferenceUseCase, Module, FieldDefinition } from '@/types';
import { fieldDefinitions, moduleOrder, getFieldsByModule, getRequiredFields, getActionableFields, isFieldRelevant } from '@/data/field-definitions';
import { referenceUseCases as fullReferenceUseCases, toDisplayUseCase, flattenUseCaseValues, getUseCaseChannels, heuristicRank } from '@/lib/reference-matching';
import ChatPanel from '@/components/ChatPanel';
import FormPanel from '@/components/FormPanel';
import ModuleSidebar from '@/components/ModuleSidebar';
import StepperHeader from '@/components/StepperHeader';
import { orgUsers, deriveFieldsFromUser, lookupUserByName, lookupOwnerHierarchy } from '@/lib/org-directory';

// Statuses that represent an explicit user decision and must never be
// silently overwritten by ownership auto-population.
const OWNER_PROTECTED_STATUSES: FieldStatus[] = ['user-input', 'confirmed', 'modified'];

// Merge auto-derived field values into state without clobbering user edits.
function applyDerivedFields(
  prev: CampaignState,
  derived: Record<string, string>,
  status: FieldStatus = 'ai-prefill'
): CampaignState {
  const values = { ...prev.values };
  const statuses = { ...prev.statuses };
  const channels = [...prev.channels];
  for (const [field, value] of Object.entries(derived)) {
    if (OWNER_PROTECTED_STATUSES.includes(statuses[field])) continue;
    values[field] = value;
    statuses[field] = status;
    if (field === 'channel' && !channels.includes(value)) channels.push(value);
  }
  return { ...prev, values, statuses, channels };
}

// BR-01: high-risk messages must support dual vendor. When high_risk_flag
// becomes "Yes", ensure support_dual_vendor is "Yes" unless the user has
// explicitly set it otherwise.
function enforceHighRiskDualVendor(next: CampaignState): CampaignState {
  if (String(next.values['high_risk_flag']) !== 'Yes') return next;
  const dvStatus = next.statuses['support_dual_vendor'];
  if (String(next.values['support_dual_vendor']) === 'Yes') return next;
  if (OWNER_PROTECTED_STATUSES.includes(dvStatus)) return next;
  return {
    ...next,
    values: { ...next.values, support_dual_vendor: 'Yes' },
    statuses: { ...next.statuses, support_dual_vendor: 'ai-prefill' },
  };
}

const initialState: CampaignState = {
  modules: moduleOrder.map(name => ({
    name,
    fields: getFieldsByModule(name),
  })),
  currentModule: 'Basic Info',
  channels: [],
  values: {},
  statuses: {},
};

export default function Home() {
  const [formState, setFormState] = useState<CampaignState>(initialState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [referenceUseCases, setReferenceUseCases] = useState<ReferenceUseCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showReferences, setShowReferences] = useState(true);
  const [scrollToModule, setScrollToModule] = useState<ModuleName | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounter = useRef(0);

  // Initialize welcome message
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `👋 歡迎使用 Campaign Configuration AI Assistant！

請描述您的 campaign requirement，我會幫您：
1. 智能提取關鍵信息
2. 匹配歷史 use case 作為參考
3. 引導您完成所有必要欄位

例如：「我需要為 FPS 轉賬成功通知設置 Push 和 SMS 通知，市場是 HK」`,
      timestamp: new Date(),
      type: 'text',
    }]);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const generateMessageId = useCallback(() => {
    messageCounter.current += 1;
    return `msg-${Date.now()}-${messageCounter.current}`;
  }, []);

  // Tracks whether the initial reference-matching pass has run.
  const hasMatchedRef = useRef(false);

  // AI-driven reference matching against the CSV-derived use cases.
  // Calls /api/match (LLM scoring); falls back to a local heuristic on failure.
  const runReferenceMatching = useCallback(async (requirement: string) => {
    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'assistant',
      content: '🔍 正在分析您的 requirement...\n• 提取業務信號\n• 搜索匹配的歷史 use case',
      timestamp: new Date(),
      type: 'processing',
    }]);

    let scored: Array<{ use_case_id: string; score: number }> = [];
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement }),
      });
      const data = await res.json();
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        scored = data.matches;
      }
    } catch (error) {
      console.error('Match request failed, using heuristic fallback:', error);
    }

    // Fallback to deterministic heuristic ranking when the LLM is unavailable.
    if (scored.length === 0) {
      scored = heuristicRank(requirement);
    }

    // Keep the top 3 with a positive score.
    const top = scored
      .filter(s => s.score > 0)
      .slice(0, 3);

    const matches: ReferenceUseCase[] = top
      .map((s, i) => {
        const full = fullReferenceUseCases.find(uc => uc.use_case_id === s.use_case_id);
        if (!full) return null;
        return toDisplayUseCase(full, Math.round(s.score), i === 0);
      })
      .filter((m): m is ReferenceUseCase => m !== null);

    if (matches.length === 0) {
      setMessages(prev => [...prev, {
        id: generateMessageId(),
        role: 'assistant',
        content: '我沒有找到高度匹配的歷史 Use Case。我們可以從頭開始配置——請告訴我您需要的 delivery channels（SMS、EMAIL、PUSH、LETTER）。',
        timestamp: new Date(),
        type: 'text',
      }]);
      setShowReferences(false);
      return;
    }

    setReferenceUseCases(matches);
    setShowReferences(true);

    const matchText = matches.map(m =>
      `• **${m.name}** (${m.similarity}% 匹配)\n  ${m.description}\n  Channels: ${m.channels.join(', ')}`
    ).join('\n\n');

    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'assistant',
      content: `✅ 需求已理解！找到 ${matches.length} 個相關的歷史 Use Case：\n\n${matchText}\n\n請選擇一個作為參考，或點擊「開始新 Use Case」從頭開始。`,
      timestamp: new Date(),
      type: 'text',
    }]);
  }, [generateMessageId]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);

    // Auto-detect channels from user message
    const channelKeywords: Record<string, string[]> = {
      'PUSH': ['push', '推播', '推送通知'],
      'SMS': ['sms', '短訊', '短信'],
      'EMAIL': ['email', '電郵', '郵件'],
      'LETTER': ['letter', '信件', '信函'],
    };

    const lowerContent = content.toLowerCase();
    const detectedChannels: string[] = [];

    for (const [channel, keywords] of Object.entries(channelKeywords)) {
      if (keywords.some(kw => lowerContent.includes(kw))) {
        detectedChannels.push(channel);
      }
    }

    // Update channels if new ones detected
    if (detectedChannels.length > 0) {
      setFormState(prev => {
        const newChannels = [...new Set([...prev.channels, ...detectedChannels])];
        if (newChannels.length !== prev.channels.length) {
          return { ...prev, channels: newChannels };
        }
        return prev;
      });
    }

    // The first user requirement triggers AI-driven reference matching
    // instead of the field-filling chat flow.
    if (!hasMatchedRef.current) {
      hasMatchedRef.current = true;
      setIsLoading(true);
      try {
        await runReferenceMatching(content);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          formState,
          userMessage: content,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        ...data.message,
        id: generateMessageId(),
        // Clean any tool call syntax that might have leaked
        content: data.message.content
          .replace(/<｜｜DSML｜｜tool_calls>[\s\S]*<｜｜DSML｜｜\/tool_calls>/g, '')
          .replace(/<｜｜DSML｜｜tool_calls>[\s\S]*$/g, '')
          .replace(/<｜｜DSML｜｜invoke[^>]*>/g, '')
          .replace(/<｜｜DSML｜｜parameter[^>]*>/g, '')
          .replace(/<｜｜DSML｜｜\/[^>]*>/g, '')
          .replace(/\{\s*\"name\".*\}/g, '')
          .trim(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Handle function call
      if (data.functionCall) {
        handleFunctionCall(data.functionCall);
      }
      
      // Handle follow-up function call (from custom tool call format)
      if (data.followUpFunctionCall) {
        handleFunctionCall(data.followUpFunctionCall);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: generateMessageId(),
        role: 'assistant',
        content: '抱歉，處理您的請求時出現錯誤。請稍後重試。',
        timestamp: new Date(),
        type: 'error',
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, formState, runReferenceMatching, generateMessageId]);

  const handleFunctionCall = useCallback((functionCall: { name: string; arguments: Record<string, unknown> }) => {
    const { name, arguments: args } = functionCall;

    switch (name) {
      case 'update_field':
        handleFieldUpdate(args.field_name as string, args.value as string, args.source as FieldStatus);
        break;
      case 'batch_update':
        handleBatchUpdate(args.fields as Array<{ field_name: string; value: string; source: FieldStatus }>);
        break;
      case 'set_match_score':
        handleSetMatchScore(args.use_case_id as string, args.score as number);
        break;
      case 'advance_module':
        handleAdvanceModule(args.message as string, args.current_module as string | undefined, args.next_module as string | undefined, args.module as string | undefined);
        break;
      case 'show_help':
        // Help is handled inline in chat
        break;
    }
  }, [formState]);

  const handleFieldUpdate = useCallback((fieldName: string, value: string, source: FieldStatus) => {
    setFormState(prev => {
      let next: CampaignState = {
        ...prev,
        values: { ...prev.values, [fieldName]: value },
        statuses: { ...prev.statuses, [fieldName]: source },
        channels: fieldName === 'channel'
          ? [...new Set([...prev.channels, value])]
          : prev.channels,
      };
      // Auto-populate ownership hierarchy when the message owner is set.
      if (fieldName === 'message_owner') {
        next = applyDerivedFields(next, lookupOwnerHierarchy(value));
      }
      // BR-01: enforce dual vendor for high-risk messages.
      next = enforceHighRiskDualVendor(next);
      return next;
    });
  }, []);

  const handleBatchUpdate = useCallback((fields: Array<{ field_name: string; value: string; source: FieldStatus }>) => {
    setFormState(prev => {
      const newValues = { ...prev.values };
      const newStatuses = { ...prev.statuses };
      const newChannels = [...prev.channels];

      for (const field of fields) {
        newValues[field.field_name] = field.value;
        newStatuses[field.field_name] = field.source;
        if (field.field_name === 'channel' && !newChannels.includes(field.value)) {
          newChannels.push(field.value);
        }
      }

      let next: CampaignState = {
        ...prev,
        values: newValues,
        statuses: newStatuses,
        channels: newChannels,
      };

      // Auto-populate ownership hierarchy if the message owner was set in this batch.
      const ownerField = fields.find(f => f.field_name === 'message_owner');
      if (ownerField) {
        next = applyDerivedFields(next, lookupOwnerHierarchy(ownerField.value));
      }
      // BR-01: enforce dual vendor for high-risk messages.
      next = enforceHighRiskDualVendor(next);

      return next;
    });
  }, []);

  // Quick-fill the whole ownership block from the org directory dropdown.
  const handleSelectUser = useCallback((userName: string) => {
    const user = lookupUserByName(userName);
    if (!user) return;
    const derived = deriveFieldsFromUser(user);

    setFormState(prev => applyDerivedFields(
      {
        ...prev,
        values: { ...prev.values, message_owner: derived.message_owner },
        statuses: { ...prev.statuses, message_owner: 'user-input' },
      },
      derived,
    ));

    const filledList = Object.entries(derived)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'assistant',
      content: `✅ 已根據 ${user.name}（${user.grade}${user.title ? ', ' + user.title : ''}）自動填充擁有者資訊：\n\n${filledList}\n\n您可以隨時修改這些欄位。`,
      timestamp: new Date(),
      type: 'text',
    }]);
  }, [generateMessageId]);

  const handleSetMatchScore = useCallback((useCaseId: string, score: number) => {
    setReferenceUseCases(prev => 
      prev.map(uc => uc.id === useCaseId ? { ...uc, similarity: score } : uc)
    );
  }, []);

  // Detect user's language from recent messages
  const detectUserLanguage = useCallback(() => {
    const recentUserMessages = messages
      .filter(m => m.role === 'user')
      .slice(-3)
      .map(m => m.content);
    
    const hasChinese = recentUserMessages.some(content => 
      /[\u4e00-\u9fff]/.test(content)
    );
    
    return hasChinese ? 'zh' : 'en';
  }, [messages]);

  const handleAdvanceModule = useCallback((message: string, currentModule?: string, nextModule?: string, module?: string) => {
    const targetModuleName = nextModule || module || moduleOrder[moduleOrder.indexOf(formState.currentModule) + 1];
    const targetModule = targetModuleName as ModuleName;
    
    if (!targetModule || !moduleOrder.includes(targetModule)) return;

    const userLang = detectUserLanguage();

    // Update form state
    setFormState(prev => ({
      ...prev,
      currentModule: targetModule,
    }));

    // Show transition message with specific module name in user's language
    const transitionMsg = userLang === 'zh' 
      ? `正在進入 ${targetModule} 模組`
      : `Moving to ${targetModule} module`;
    
    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'assistant',
      content: transitionMsg,
      timestamp: new Date(),
      type: 'text',
    }, {
      id: generateMessageId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      type: 'processing',
    }]);

    // Call AI to get guidance for the new module
    setTimeout(async () => {
      try {
        // Get already filled fields for context
        const filledFieldsList = Object.entries(formState.values)
          .filter(([_, v]) => v !== '' && v !== undefined)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        
        const channelsList = formState.channels.length > 0 
          ? formState.channels.join(', ') 
          : 'None';
        
        const guidancePrompt = userLang === 'zh'
          ? `我剛進入 ${targetModule} 模組。

已填寫的欄位：${filledFieldsList || '無'}
已選擇的渠道：${channelsList}

請用中文引導我需要填寫哪些欄位。注意：
1. 不要詢問已經填寫過的欄位
2. 如果渠道已經選擇過，不要再次詢問
3. 只詢問尚未填寫的必要欄位
4. 一次詢問 3-5 個欄位`
          : `I just moved to the ${targetModule} module.

Already filled fields: ${filledFieldsList || 'None'}
Selected channels: ${channelsList}

Please guide me on what fields I need to fill. Note:
1. Do NOT ask for fields that are already filled
2. If channels are already selected, do NOT ask again
3. Only ask for unfilled required fields
4. Ask 3-5 fields at a time`;
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              id: generateMessageId(),
              role: 'user',
              content: guidancePrompt,
              timestamp: new Date(),
              type: 'text',
            }],
            formState: { ...formState, currentModule: targetModule },
            userMessage: guidancePrompt,
          }),
        });

        const data = await response.json();
        
        // Remove processing message and add AI guidance
        setMessages(prev => {
          const withoutProcessing = prev.filter(m => m.type !== 'processing');
          return [...withoutProcessing, {
            ...data.message,
            id: generateMessageId(),
          }];
        });
      } catch (error) {
        console.error('Failed to get module guidance:', error);
        setMessages(prev => prev.filter(m => m.type !== 'processing'));
      }
    }, 500);
  }, [formState, generateMessageId, detectUserLanguage]);

  const handleSelectReference = useCallback((useCaseId: string) => {
    const useCase = fullReferenceUseCases.find(uc => uc.use_case_id === useCaseId);
    if (!useCase) return;

    const displayName = String(useCase.values.use_case_name ?? useCase.use_case_id);
    const ucChannels = getUseCaseChannels(useCase);

    // Activate the reference use case's delivery channels so channel-driven
    // fields become visible/actionable.
    if (ucChannels.length > 0) {
      setFormState(prev => ({
        ...prev,
        channels: [...new Set([...prev.channels, ...ucChannels])],
      }));
    }

    // Pre-fill the full field set (base values + channel-rule fields) from the reference.
    const flat = flattenUseCaseValues(useCase);
    const updates = Object.entries(flat).map(([key, value]) => ({
      field_name: key,
      value: String(value),
      source: 'reference-prefill' as FieldStatus,
    }));

    handleBatchUpdate(updates);

    const preview = updates.slice(0, 12);
    const extra = updates.length - preview.length;

    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'assistant',
      content: `✅ 已套用參考 Use Case: ${displayName}\n\nChannels: ${ucChannels.join(', ') || '—'}\n\n已預填充 ${updates.length} 個欄位：\n${preview.map(u => `• ${u.field_name}: ${u.value}`).join('\n')}${extra > 0 ? `\n…以及其他 ${extra} 個欄位` : ''}\n\n請確認或修改這些值，我會繼續引導您完成其他欄位。`,
      timestamp: new Date(),
      type: 'text',
    }]);
  }, [handleBatchUpdate, generateMessageId]);

  const handleStartFresh = useCallback(() => {
    setShowReferences(false);
    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'assistant',
      content: `好的，我們從頭開始。\n\n請告訴我您的 campaign 需求，我會引導您逐步填寫所有必要欄位。\n\n首先，請選擇您需要的 delivery channels（SMS、EMAIL、PUSH、LETTER）：`,
      timestamp: new Date(),
      type: 'text',
    }]);
  }, [generateMessageId]);

  const handleFieldEdit = useCallback((fieldName: string, value: string) => {
    handleFieldUpdate(fieldName, value, 'user-input' as FieldStatus);
  }, [handleFieldUpdate]);

  const handleFieldConfirm = useCallback((fieldName: string) => {
    setFormState(prev => ({
      ...prev,
      statuses: { ...prev.statuses, [fieldName]: 'confirmed' },
    }));
  }, []);



  const handleUseSample = useCallback(() => {
    const sampleMessages = [
      "信用卡 CNP 高風險交易警示，需要 SMS 和 PUSH，市場 HK",
      "網上銀行 OTP 驗證碼，SMS 和 PUSH，high risk，需要 dual vendor",
      "企業大額付款審批提示，SMS 加 EMAIL，Commercial Banking",
    ];
    const sample = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    handleSendMessage(sample);
  }, [handleSendMessage]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left side: Stepper + Sidebar + Form */}
      <div className="flex flex-col flex-1 min-w-0">
        <StepperHeader />
        
        <div className="flex flex-1 min-h-0">
          <ModuleSidebar 
            modules={formState.modules}
            currentModule={formState.currentModule}
            onModuleClick={(module) => {
              setFormState(prev => ({ ...prev, currentModule: module }));
              setScrollToModule(module);
            }}
            formState={formState}
          />
          
          <FormPanel
            formState={formState}
            referenceUseCases={referenceUseCases}
            showReferences={showReferences}
            onFieldEdit={handleFieldEdit}
            onFieldConfirm={handleFieldConfirm}
            onSelectReference={handleSelectReference}
            onStartFresh={handleStartFresh}
            onViewReferences={() => setShowReferences(true)}
            orgUsers={orgUsers}
            onSelectUser={handleSelectUser}
            scrollToModule={scrollToModule}
            onScrollComplete={() => setScrollToModule(null)}
          />
        </div>
      </div>
      
      {/* Right side: Chat Panel - full height */}
      <ChatPanel
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onUseSample={handleUseSample}
        onAdvanceModule={() => {
          const currentIndex = moduleOrder.indexOf(formState.currentModule);
          const nextModule = moduleOrder[currentIndex + 1];
          handleAdvanceModule('', undefined, nextModule);
        }}
        showNextModule={(() => {
          const currentIndex = moduleOrder.indexOf(formState.currentModule);
          const nextModule = moduleOrder[currentIndex + 1];
          if (!nextModule) return false;
          // Use getActionableFields to check both Required and relevant Conditional fields
          const actionableFields = getActionableFields(formState.currentModule, formState.channels, formState.values);
          return actionableFields.every(f => 
            formState.values[f.name] && formState.statuses[f.name] !== 'empty'
          );
        })()}
        nextModuleName={(() => {
          const currentIndex = moduleOrder.indexOf(formState.currentModule);
          return moduleOrder[currentIndex + 1] || null;
        })()}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
