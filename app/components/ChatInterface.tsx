"use client"

import { useState, FormEvent, useRef, useEffect } from 'react';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate dummy response
  const generateDummyResponse = (question: string): string => {
    const dummyResponses = [
      "I'm a simple chatbot. I can't actually answer that right now.",
      "That's an interesting question! In a real implementation, I would call an API here.",
      "I'm just a dummy response for now, but this is where actual API data would appear.",
      `You asked: "${question}" - In the future, I'll provide a real answer.`,
      "Thanks for your question! This is a placeholder response.",
    ];
    
    return dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateDummyResponse(userMessage.text),
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl h-[600px] border border-black/[.08] dark:border-white/[.145] rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-black/[.08] dark:border-white/[.145]">
        <h2 className="font-medium">Chat Assistant</h2>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Ask a question to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`mb-4 ${
                message.sender === 'user' 
                  ? 'ml-auto text-right' 
                  : 'mr-auto'
              }`}
            >
              <div 
                className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-gray-100 dark:bg-gray-800 rounded-tl-none'
                }`}
              >
                {message.text}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
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
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input form */}
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
