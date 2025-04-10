"use client";

import { useState, useRef, useEffect } from 'react';
import { Message, GeminiMessage, FunctionResult } from '../types/chat';
import { getMerchantSuggestions } from '../gemini/suggestion-generator';
import { merchants } from '../components/MerchantSelector';
import { useLanguage } from '../contexts/LanguageContext';

interface UseChatProps {
  initialMerchantId: string;
  onAddDataWindow?: (type: 'chart' | 'graph' | 'stats', title?: string, providedId?: string) => string | undefined;
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
  
  // Use the language context
  const { language, languageName } = useLanguage();
  const prevLanguageRef = useRef(language);
  
  // Update to use function from the suggestion module with language
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(
    getMerchantSuggestions(merchantId, language)
  );

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle merchant change
  const handleMerchantChange = (newMerchantId: string) => {
    setMerchantId(newMerchantId);
    
    // Find the merchant name from the ID
    const merchantName = merchants.find(m => m.id === newMerchantId)?.name || newMerchantId;
    
    // Add a system message about the merchant change with the name instead of ID
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: `Switched to ${merchantName}`,
      sender: 'system',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, systemMessage]);
    
    // Reset conversation history and get new merchant-specific suggestions with current language
    setConversationHistory([]);
    setSuggestedPrompts(getMerchantSuggestions(newMerchantId, language));
  };

  // When merchantId changes externally
  useEffect(() => {
    if (initialMerchantId && initialMerchantId !== prevMerchantIdRef.current) {
      prevMerchantIdRef.current = initialMerchantId;
      handleMerchantChange(initialMerchantId);
    }
  }, [initialMerchantId]);
  
  // Handle language changes
  useEffect(() => {
    if (language !== prevLanguageRef.current) {
      prevLanguageRef.current = language;
      
      // Add a system message about the language change
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: `Switched to ${languageName}`,
        sender: 'system',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, systemMessage]);
      
      // If there are existing messages, add a note that future responses will be in the new language
      if (messages.length > 0) {
        const noteMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `I'll respond in ${languageName} from now on.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, noteMessage]);
      }
      
      // Update suggestions for the new language
      setSuggestedPrompts(getMerchantSuggestions(merchantId, language));
    }
  }, [language, languageName, merchantId, messages.length]);

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
      // Call the API route with conversation history and language
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.text, 
          merchantId,
          language: language,  // Pass the current language to the API
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
      if (!message.functionResults || !Array.isArray(message.functionResults)) return;
      
      console.log('Processing function results:', message.functionResults);
      
      message.functionResults.forEach((result: FunctionResult) => {
        // Only process results that have clientAction
        if (!result.clientAction) return;
        
        // Generate a stable ID that we can use consistently
        const stableId = result.clientAction.params?.id || result.id;
        
        // Skip if no ID is available
        if (!stableId) {
          console.log('Skipping result without ID:', result);
          return;
        }
        
        // Skip if we've already processed this result
        if (processedResultsRef.current.has(stableId)) {
          console.log('Already processed result ID:', stableId);
          return;
        }
        
        // Process the client action based on its type
        switch (result.clientAction.type) {
          case "ADD_DATA_WINDOW":
            if (onAddDataWindow && result.clientAction.params) {
              const { visualization_type, title, id } = result.clientAction.params;
              
              // Only proceed if we have an ID
              if (id) {
                console.log('Adding data window with ID:', id);
                onAddDataWindow(
                  visualization_type, 
                  title,
                  id // Pass the ID provided from the API response
                );
                
                // Mark this result as processed using the stable ID
                processedResultsRef.current.add(stableId);
              } else {
                console.log('Skipping data window without ID');
              }
            }
            break;
          // Add additional action types here as needed
          default:
            console.log("Unknown client action type:", result.clientAction.type);
        }
      });
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
    handleSuggestionClick,
    language // Add language to the returned values
  };
}
