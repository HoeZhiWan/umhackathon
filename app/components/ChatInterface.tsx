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
  onAddDataWindow?: (type: 'chart' | 'graph' | 'stats', title?: string, providedId?: string) => string | undefined;
  onAddMenuItemWindow?: (itemName: string, cuisineTag: string, description?: string, imageData?: string, providedId?: string) => string | undefined;
}

export default function ChatInterface({ merchantId, onAddDataWindow, onAddMenuItemWindow }: ChatInterfaceProps) {
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSubmit,
    messagesEndRef,
    suggestedPrompts,
    handleSuggestionClick,
    language
  } = useChat({ initialMerchantId: merchantId, onAddDataWindow, onAddMenuItemWindow });

  const isNewConversation = messages.length === 0;

  return (
    <div className="flex flex-col w-full h-full rounded-none overflow-hidden" style={{ backgroundColor: "var(--light)" }}>
      <div 
        className="flex-1 p-4 overflow-y-auto relative shadow-inner" 
        style={{ backgroundColor: "var(--light)", color: "var(--light)" }}
      >
        {isNewConversation ? (
          <>
            <EmptyState />
            <SuggestionChips
              suggestions={suggestedPrompts}
              onSuggestionClick={handleSuggestionClick}
              isNewConversation={true}
              isLoading={isLoading}
              language={language}
            />
          </>
        ) : (
          <>
            <div className="space-y-4">
              {messages.map((message: Message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
            
            {isLoading && <LoadingIndicator />}
            
            {!isLoading && (
              <SuggestionChips
                suggestions={suggestedPrompts}
                onSuggestionClick={handleSuggestionClick}
                isNewConversation={false}
                isLoading={isLoading}
                language={language}
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
