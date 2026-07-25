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
    status: name === 'Basic Info' ? 'in-progress' : 'waiting',
    missingCount: getRequiredFields(name).length,
    pendingCount: 0,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Update module status when form state changes
  useEffect(() => {
    setFormState(prev => ({
      ...prev,
      modules: prev.modules.map(module => {
        const requiredFields = getRequiredFields(module.name);
        const filledRequired = requiredFields.filter(f => 
          prev.values[f.name] !== undefined && prev.values[f.name] !== ''
        );
        const missingCount = requiredFields.length - filledRequired.length;
        
        let status: Module['status'] = 'waiting';
        if (module.name === prev.currentModule) {
          status = 'in-progress';
        } else if (missingCount === 0 && prev.modules.findIndex(m => m.name === module.name) < prev.modules.findIndex(m => m.name === prev.currentModule)) {
          status = 'complete';
        }

        return {
          ...module,
          status,
          missingCount,
        };
      }),
    }));
  }, [formState.values, formState.currentModule]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
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
        id: (Date.now() + 1).toString(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Handle function call
      if (data.functionCall) {
        handleFunctionCall(data.functionCall);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
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
        handleAdvanceModule(args.message as string);
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

  const handleAdvanceModule = useCallback((message: string) => {
    setFormState(prev => {
      const currentIndex = moduleOrder.indexOf(prev.currentModule);
      const nextModule = moduleOrder[currentIndex + 1];
      
      if (!nextModule) return prev;

      return {
        ...prev,
        currentModule: nextModule,
        modules: prev.modules.map(m => 
          m.name === prev.currentModule ? { ...m, status: 'complete' } :
          m.name === nextModule ? { ...m, status: 'in-progress' } :
          m
        ),
      };
    });

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: message,
      timestamp: new Date(),
      type: 'text',
    }]);
  }, []);

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
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ 已套用參考 Use Case: ${useCase.name}\n\n已預填充以下欄位：\n${updates.map(u => `• ${u.field_name}: ${u.value}`).join('\n')}\n\n請確認或修改這些值，我會繼續引導您完成其他欄位。`,
      timestamp: new Date(),
      type: 'text',
    }]);
  }, [handleBatchUpdate]);

  const handleStartFresh = useCallback(() => {
    setShowReferences(false);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `好的，我們從頭開始。\n\n請告訴我您的 campaign 需求，我會引導您逐步填寫所有必要欄位。\n\n首先，請選擇您需要的 delivery channels（SMS、EMAIL、PUSH、LETTER）：`,
      timestamp: new Date(),
      type: 'text',
    }]);
  }, []);

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
      id: Date.now().toString(),
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
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ 需求已理解！找到 ${matches.length} 個相關的歷史 Use Case：\n\n${matchText}\n\n請選擇一個作為參考，或點擊「開始新 Use Case」從頭開始。`,
      timestamp: new Date(),
      type: 'text',
    }]);
  }, []);

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
          />
        </div>
      </div>
      
      {/* Right side: Chat Panel - full height */}
      <ChatPanel
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onUseSample={handleUseSample}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
}
