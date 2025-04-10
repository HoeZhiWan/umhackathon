"use client";

import { motion } from 'motion/react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isNewConversation?: boolean;
  isLoading: boolean;
}

export default function SuggestionChips({
  suggestions,
  onSuggestionClick,
  isNewConversation = false,
  isLoading
}: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0 || isLoading) return null;

  // Use different styling for new conversation vs ongoing
  const chipStyle = isNewConversation
    ? {
        backgroundColor: "var(--secondary)",
        color: "var(--light)",
        border: "1px solid var(--primary)"
      }
    : {
        backgroundColor: "var(--light)",
        color: "var(--primary)",
        border: "1px solid var(--secondary)"
      };

  return (
    <div className={`my-3 flex flex-wrap gap-2 ${isNewConversation ? 'mt-6' : 'mt-3'}`}>
      {isNewConversation && (
        <div className="w-full mb-2 text-sm">
          <span>Try asking:</span>
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
          <span style={chipStyle} className="px-3 py-1.5 rounded-full block">
            {suggestion}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
