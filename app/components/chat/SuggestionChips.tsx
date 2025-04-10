"use client";

import { useTransition, animated } from 'react-spring';

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
        backgroundColor: "var(--light)",
        color: "var(--primary)",
        border: "1px solid var(--secondary)"
      }
    : {
        backgroundColor: "var(--light)",
        color: "var(--primary)",
        border: "1px solid var(--secondary)"
      };

  // Add animations for suggestions
  const transitions = useTransition(suggestions, {
    from: { opacity: 0, transform: 'translateY(10px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    trail: 100 // Stagger effect
  });

  return (
    <div className={`my-3 flex flex-wrap gap-2 ${isNewConversation ? 'mt-6' : 'mt-3'}`}>
      {isNewConversation && (
        <div className="w-full mb-2 text-sm">
          <span>Try asking:</span>
        </div>
      )}
      
      {transitions((style, suggestion, _, index) => (
        <animated.button
          key={index}
          style={style}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 py-1.5 rounded-full text-sm transition-colors hover:opacity-80"
          disabled={isLoading}
        >
          <span style={chipStyle} className="px-3 py-1.5 rounded-full block">
            {suggestion}
          </span>
        </animated.button>
      ))}
    </div>
  );
}
