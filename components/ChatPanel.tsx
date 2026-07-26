'use client';

import { useState, RefObject } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, ModuleName } from '@/types';
import sampleMessages from '@/data/sample-messages.json';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onUseSample: () => void;
  onAdvanceModule: () => void;
  showNextModule: boolean;
  nextModuleName: ModuleName | null;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatPanel({ 
  messages, 
  isLoading, 
  onSendMessage, 
  onUseSample, 
  onAdvanceModule,
  showNextModule,
  nextModuleName,
  messagesEndRef 
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showSamples, setShowSamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div
          className={`max-w-[90%] rounded-lg px-3 py-2 ${
            isUser
              ? 'bg-blue-600 text-white text-sm'
              : message.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-200 text-sm'
              : message.type === 'processing'
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm'
              : 'bg-white text-gray-900 border border-gray-200 text-sm'
          }`}
        >
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
              </span>
            </div>
          )}
          
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {message.type === 'processing' && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-yellow-600">Processing...</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-[400px] flex-shrink-0 bg-gray-50 border-l border-gray-200 flex flex-col h-full min-h-0 py-3">
      {/* Header */}
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Assistant</h2>
            <p className="text-[10px] text-gray-500">Guided intake with real backend (requirement intake stage).</p>
          </div>
          <div className="flex gap-1">
            <button className="px-2 py-0.5 text-[10px] font-medium bg-green-500 text-white rounded">
              Guided
            </button>
            <button className="px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              QA
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map(renderMessage)}
        
        {/* Next Module Button - appears when all required fields are filled */}
        {showNextModule && nextModuleName && !isLoading && (
          <div className="flex justify-center my-3">
            <button
              onClick={onAdvanceModule}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium text-sm shadow-md hover:shadow-lg transition-all"
            >
              Continue to {nextModuleName}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
            <span className="text-xs italic">Assistant is thinking</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Reply to the guided question..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            rows={2}
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button type="button" className="text-xs text-gray-500 hover:text-gray-700">Demo</button>
              <button type="button" className="text-xs text-green-600 font-medium">Real</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Reference selection required</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSamples(!showSamples)}
                  className="px-2 py-1 text-[10px] text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Use samples
                </button>
                
                {showSamples && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowSamples(false)} 
                    />
                    <div className="absolute bottom-full right-0 mb-1 w-[360px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                      <div className="p-2 border-b border-gray-200">
                        <p className="text-xs font-medium text-gray-700">Select a sample message:</p>
                      </div>
                      <div className="p-1">
                        {sampleMessages.samples.map((sample, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setInput(sample);
                              setShowSamples(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors"
                          >
                            {sample}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
