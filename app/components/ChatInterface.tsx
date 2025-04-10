"use client";

import { useChat } from '../hooks/useChat';
import ChatMessage from './chat/ChatMessage';
import LoadingIndicator from './chat/LoadingIndicator';
import EmptyState from './chat/EmptyState';
import ChatInput from './chat/ChatInput';
import SuggestionChips from './chat/SuggestionChips';
import { Message } from '../types/chat';

interface ChatInterfaceProps {
  merchantId: string;
  onAddDataWindow?: (type: 'chart' | 'graph' | 'stats', title?: string) => string | undefined;
}

export default function ChatInterface({ merchantId, onAddDataWindow }: ChatInterfaceProps) {
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSubmit,
    messagesEndRef,
    suggestedPrompts,
    handleSuggestionClick
  } = useChat({ initialMerchantId: merchantId, onAddDataWindow });

  const isNewConversation = messages.length === 0;

  return (
    <div className="flex flex-col w-full h-full rounded-lg overflow-hidden" style={{ backgroundColor: "var(--color-window)" }}>
      <div className="flex-1 p-4 overflow-y-auto" style={{ backgroundColor: "var(--color-window)", color: "var(--foreground)" }}>
        {isNewConversation ? (
          <>
            <EmptyState />
            <SuggestionChips
              suggestions={suggestedPrompts}
              onSuggestionClick={handleSuggestionClick}
              isNewConversation={true}
              isLoading={isLoading}
            />
          </>
        ) : (
          <>
            {messages.map((message: Message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && <LoadingIndicator />}
            
            {!isLoading && (
              <SuggestionChips
                suggestions={suggestedPrompts}
                onSuggestionClick={handleSuggestionClick}
                isNewConversation={false}
                isLoading={isLoading}
              />
            )}
          </>
        )}
        
        <div ref={messagesEndRef}></div>
      </div>
      
      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
