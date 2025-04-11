"use client";

import { useState, useRef, useEffect } from 'react';
import { Message, GeminiMessage, FunctionResult, DataWindowActionParams, LanguageSwitchActionParams } from '../types/chat';
import { getMerchantSuggestions } from '../gemini/suggestion-generator';
import { merchants } from '../components/MerchantSelector';
import { useLanguage } from '../contexts/LanguageContext';

interface UseChatProps {
  initialMerchantId: string;
  onAddDataWindow?: (type: 'chart' | 'graph' | 'stats', title?: string, providedId?: string, data?: any) => string | undefined;
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
  const { language, languageName, setLanguage } = useLanguage();
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
        const stableId = result.clientAction.params && 'id' in result.clientAction.params 
          ? (result.clientAction.params as {id?: string}).id 
          : result.id;
        
        // Skip if no ID is available and it's not a language switch action
        // (Language switch doesn't need an ID to track)
        if (!stableId && result.clientAction.type !== "SWITCH_LANGUAGE") {
          console.log('Skipping result without ID:', result);
          return;
        }
        
        // For non-language actions, skip if already processed
        if (stableId && result.clientAction.type !== "SWITCH_LANGUAGE" && 
            processedResultsRef.current.has(stableId)) {
          console.log('Already processed result ID:', stableId);
          return;
        }
        
        // Process the client action based on its type
        switch (result.clientAction.type) {
          case "ADD_DATA_WINDOW":
            if (onAddDataWindow && result.clientAction.params) {
              // Use type assertion to tell TypeScript this is a DataWindowActionParams
              const params = result.clientAction.params as DataWindowActionParams;
              const { visualization_type, title, id, data } = params;
              
              // Only proceed if we have an ID (should be guaranteed by the check above)
              if (id) {
                console.log('Adding data window with ID:', id, 'with data:', data);
                onAddDataWindow(
                  visualization_type, 
                  title,
                  id,
                  data // Pass the data from client action params
                );
                
                // Mark this result as processed using the stable ID (which equals the id)
                // TypeScript now knows stableId is defined because of the earlier check
                if (stableId) {
                  processedResultsRef.current.add(stableId);
                }
              }
            }
            break;
          case "SWITCH_LANGUAGE":
            if (result.clientAction.params) {
              // Use type assertion to tell TypeScript this is a LanguageSwitchActionParams
              const params = result.clientAction.params as LanguageSwitchActionParams;
              
              if (params.language_code) {
                console.log('Automatically switching language to:', params.language_code);
                // Use the setLanguage function from the context hook
                setLanguage(params.language_code);
              }
            }
            break;
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
  }, [messages, onAddDataWindow, setLanguage]);

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
