"use client";

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
}

export default function ChatInterface({ merchantId: initialMerchantId }: { merchantId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [merchantId, setMerchantId] = useState(initialMerchantId || "abc123"); // Default merchant
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMerchantIdRef = useRef(merchantId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle merchant change
  const handleMerchantChange = (newMerchantId: string) => {
    setMerchantId(newMerchantId);
    // Add a system message about the merchant change
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: `Switched to ${newMerchantId.replace('_', ' ')}`,
      sender: 'system',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  // When merchantId changes externally
  useEffect(() => {
    if (initialMerchantId && initialMerchantId !== prevMerchantIdRef.current) {
      prevMerchantIdRef.current = initialMerchantId;
      handleMerchantChange(initialMerchantId);
    }
  }, [initialMerchantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.text, 
          merchantId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();
      
      // Add bot message from API response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        sender: 'bot',
        timestamp: new Date(data.timestamp || Date.now()),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl h-[600px] border border-black/[.08] dark:border-white/[.145] rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-black/[.08] dark:border-white/[.145]">
        <div className="flex justify-between items-center">
          <h2 className="font-medium">Chat Assistant</h2>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Start a conversation by typing a message below.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 ${message.sender === 'user' ? 'ml-auto text-right' : 'mr-auto'}`}
            >
              <div 
                className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-blue-500 text-white rounded-tr-none' 
                    : message.sender === 'system'
                      ? 'bg-gray-300 dark:bg-gray-700 italic'
                      : 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
                }`}
              >
                {message.text}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
        
        <div ref={messagesEndRef}></div>
      </div>
      
      <form onSubmit={handleSubmit} className="border-t border-black/[.08] dark:border-white/[.145] p-4 bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-black/[.08] dark:border-white/[.145] rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
