"use client"

import { useState, FormEvent, useRef, useEffect } from 'react';

// Define the list of available merchants for name lookup
const AVAILABLE_MERCHANTS = [
  { id: "abc123", name: "Laksa" },
  { id: "def456", name: "Hokkien Mee" },
  { id: "hij789", name: "Curry Mee" },
  { id: "klm012", name: "Gulai Ayam" },
];
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type ChatInterfaceProps = {
  merchantId: string;
};

export default function ChatInterface({ merchantId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMerchantIdRef = useRef(merchantId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle merchant change
  useEffect(() => {
    if (prevMerchantIdRef.current !== merchantId) {
      // Find merchant name
      const merchantName = AVAILABLE_MERCHANTS.find(m => m.id === merchantId)?.name || "Unknown";
      
      // Add a system message about the merchant change
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: `Switched to ${merchantName}.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      prevMerchantIdRef.current = merchantId;
    }
  }, [merchantId]);

  // Generate dummy response
  const generateDummyResponse = (question: string): string => {
    // Find current merchant name
    const merchantName = AVAILABLE_MERCHANTS.find(m => m.id === merchantId)?.name || "Unknown";
    
    const merchantSpecificResponses: Record<string, string[]> = {
      "abc123": [
        `You asked: "${question}" - This is a specific response for Merchant ${merchantName}.`,
      ],
      "def456": [
        `You asked: "${question}" - This is a specific response for Merchant ${merchantName}.`,
      ],
      "hij789": [
        `You asked: "${question}" - This is a specific response for Merchant ${merchantName}.`,
      ],
      "klm012": [
        `You asked: "${question}" - This is a specific response for Merchant ${merchantName}.`,
      ],
    };
    
    const genericResponses = [
      `You asked: "${question}" - In the future, I'll provide a real answer based on ${merchantName}'s data.`,
      `This is a placeholder response for your ${merchantName} account.`,
      `In a real implementation, this would use ${merchantName}'s data from an API.`
    ];
    
    // Get merchant-specific responses or fall back to generic ones
    const responses = merchantSpecificResponses[merchantId] || genericResponses;
    return responses[Math.floor(Math.random() * responses.length)];
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
        <h2 className="font-medium">Merchant Chat</h2>
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
