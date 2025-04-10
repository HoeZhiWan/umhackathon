"use client";

import { useState, useRef, useEffect } from 'react';
import { Message, GeminiMessage, FunctionResult } from '../types/chat';
import { getMerchantSuggestions } from '../gemini/suggestion-generator';

interface UseChatProps {
  initialMerchantId: string;
  onAddDataWindow?: (type: 'chart' | 'graph' | 'stats', title?: string) => string | undefined;
}

export function useChat({ initialMerchantId, onAddDataWindow }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [merchantId, setMerchantId] = useState(initialMerchantId || "abc123"); // Default merchant
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMerchantIdRef = useRef(merchantId);
  const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);
  const processedResultsRef = useRef<Set<string>>(new Set());
  
  // Update to use function from the suggestion module
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(
    getMerchantSuggestions(merchantId)
  );

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
    // Reset conversation history and get new merchant-specific suggestions
    setConversationHistory([]);
    setSuggestedPrompts(getMerchantSuggestions(newMerchantId));
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
    await sendMessage(inputValue);
  };

  // Separate the message sending logic into its own function
  const sendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the API route with conversation history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.text, 
          merchantId,
          history: conversationHistory // Send the current conversation history
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();

      console.log('API Response data:', data);
      
      // Add bot message from API response with the raw data
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || "I don't have a response for that.",
        sender: 'bot',
        timestamp: new Date(data.timestamp || Date.now()),
        _rawData: data // Store the full response data
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update conversation history from the response
      if (data.history) {
        setConversationHistory(data.history);
      }
      
      // Update suggested prompts from the response if available
      if (data.suggestedPrompts && Array.isArray(data.suggestedPrompts)) {
        setSuggestedPrompts(data.suggestedPrompts);
      }
      
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

  // Handle suggestion clicks - now uses the sendMessage function
  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  // Process function results that require client-side execution
  useEffect(() => {
    const handleClientActions = (message: any) => {
      if (message.functionResults && Array.isArray(message.functionResults)) {
        message.functionResults.forEach((result: FunctionResult) => {
          // Use the server-generated ID if available, otherwise create a fallback
          const resultId = result.id || 
                          `fallback-${result.window_type || ''}-${result.clientAction?.params?.title || ''}-${Date.now()}`;
          
          // Skip if we've already processed this result
          if (processedResultsRef.current.has(resultId)) {
            return;
          }
          
          if (result.clientAction) {
            // Process the client action based on its type
            switch (result.clientAction.type) {
              case "ADD_DATA_WINDOW":
                if (onAddDataWindow && result.clientAction.params) {
                  const { visualization_type, title } = result.clientAction.params;
                  onAddDataWindow(
                    visualization_type, 
                    title
                  );
                  
                  // Mark this result as processed
                  processedResultsRef.current.add(resultId);
                  console.log("Processed result ID:", resultId);
                }
                break;
              // Add additional action types here as needed
              default:
                console.log("Unknown client action type:", result.clientAction.type);
            }
          }
        });
      }
    };

    // Apply this to the latest message if it exists
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.sender === 'bot' && latestMessage._rawData) {
        handleClientActions(latestMessage._rawData);
      }
    }
  }, [messages, onAddDataWindow]);

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    handleSubmit,
    messagesEndRef,
    suggestedPrompts,
    handleSuggestionClick
  };
}
