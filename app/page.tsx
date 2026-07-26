'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { CampaignState, ChatMessage, ModuleName, FieldStatus, ReferenceUseCase, Module, FieldDefinition } from '@/types';
import { fieldDefinitions, moduleOrder, getFieldsByModule, getRequiredFields, isFieldRelevant } from '@/data/field-definitions';
import mockUseCases from '@/data/mock-use-cases.json';
import historicalStats from '@/data/historical-stats.json';
import ChatPanel from '@/components/ChatPanel';
import FormPanel from '@/components/FormPanel';
import ModuleSidebar from '@/components/ModuleSidebar';
import StepperHeader from '@/components/StepperHeader';

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
  }, [messages, formState]);

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
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [fieldName]: value },
      statuses: { ...prev.statuses, [fieldName]: source },
      channels: fieldName === 'channel' 
        ? [...new Set([...prev.channels, value])]
        : prev.channels,
    }));
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

      return {
        ...prev,
        values: newValues,
        statuses: newStatuses,
        channels: newChannels,
      };
    });
  }, []);

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
    const useCase = mockUseCases.find(uc => uc.id === useCaseId);
    if (!useCase) return;

    // Pre-fill fields from reference
    const updates = Object.entries(useCase.values).map(([key, value]) => ({
      field_name: key,
      value: String(value),
      source: 'reference-prefill' as FieldStatus,
    }));

    handleBatchUpdate(updates);

    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'assistant',
      content: `✅ 已套用參考 Use Case: ${useCase.name}\n\n已預填充以下欄位：\n${updates.map(u => `• ${u.field_name}: ${u.value}`).join('\n')}\n\n請確認或修改這些值，我會繼續引導您完成其他欄位。`,
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
      "我需要為 FPS 轉賬成功通知設置 Push 和 SMS，市場是 HK",
      "要發送信用卡交易通知，high risk，需要 dual channel",
      "設置 eStatement 通知，用 Email 和 Letter",
    ];
    const sample = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    handleSendMessage(sample);
  }, [handleSendMessage]);

  // Simulate initial matching when user first sends a requirement
  const handleFirstRequirement = useCallback(async (requirement: string) => {
    // Show processing message
    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'assistant',
      content: '🔍 正在分析您的 requirement...\n• 提取業務信號\n• 搜索匹配的歷史 use case',
      timestamp: new Date(),
      type: 'processing',
    }]);

    // Simulate matching (in real app, this would call the LLM)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create mock matches
    const matches: ReferenceUseCase[] = mockUseCases.slice(0, 3).map((uc, i) => ({
      ...uc,
      similarity: i === 0 ? 92 : i === 1 ? 78 : 65,
      isBestMatch: i === 0,
    }));

    setReferenceUseCases(matches);
    setShowReferences(true);

    // Show matches in chat
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
          const requiredFields = getRequiredFields(formState.currentModule);
          return requiredFields.every(f => 
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
