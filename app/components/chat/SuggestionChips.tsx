"use client";

import { motion } from 'motion/react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isNewConversation?: boolean;
  isLoading: boolean;
  language?: string;
}

export default function SuggestionChips({
  suggestions,
  onSuggestionClick,
  isNewConversation = false,
  isLoading,
  language = 'en'
}: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0 || isLoading) return null;

  // Use different styling for new conversation vs ongoing
  const chipStyle = isNewConversation
    ? {
        backgroundColor: "var(--foreground)",
        color: "var(--light)",
        border: "1px solid var(--secondary)"
      }
    : {
        backgroundColor: "var(--foreground)",
        color: "var(--light)",
        border: "1px solid var(--secondary)"
      };

  // Get language-specific "Try asking" text
  const getTryAskingText = () => {
    switch (language) {
      case 'ms':
        return 'Cuba tanya:';
      case 'zh':
        return '尝试提问:';
      case 'ta':
        return 'கேட்க முயற்சிக்கவும்:';
      default:
        return 'Try asking:';
    }
  };
  
  // Add language-specific font adjustments
  const getLanguageStyles = () => {
    switch (language) {
      case 'zh':
        return { 
          fontSize: '0.95rem',
          lineHeight: '1.5'
        };
      case 'ta':
        return { 
          fontSize: '0.9rem',
          lineHeight: '1.6'
        };
      default:
        return {};
    }
  };

  return (
    <div className={`my-3 flex flex-wrap gap-2 ${isNewConversation ? 'mt-6' : 'mt-3'}`}>
      {isNewConversation && (
        <div className="w-full mb-2 text-sm">
          <span>{getTryAskingText()}</span>
        </div>
      )}
      
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }} // Stagger effect
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.1)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-1.5 rounded-full text-sm transition-colors hover:opacity-80 cursor-pointer"
          disabled={isLoading}
        >
          <span 
            style={{
              ...chipStyle,
              ...getLanguageStyles()
            }} 
            className="px-3 py-1.5 rounded-full block"
          >
            {suggestion}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
