"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getMerchantSuggestions } from '../gemini/suggestion-generator';

interface SuggestionsContextType {
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
  resetToDefault: (merchantId: string) => void;
}

const SuggestionsContext = createContext<SuggestionsContextType | undefined>(undefined);

export function SuggestionsProvider({ children, initialMerchantId = "abc123" }: { children: ReactNode, initialMerchantId?: string }) {
  const [suggestions, setSuggestions] = useState<string[]>(
    getMerchantSuggestions(initialMerchantId)
  );

  const resetToDefault = (merchantId: string) => {
    setSuggestions(getMerchantSuggestions(merchantId));
  };

  return (
    <SuggestionsContext.Provider value={{ suggestions, setSuggestions, resetToDefault }}>
      {children}
    </SuggestionsContext.Provider>
  );
}

export function useSuggestions() {
  const context = useContext(SuggestionsContext);
  if (context === undefined) {
    throw new Error("useSuggestions must be used within a SuggestionsProvider");
  }
  return context;
}
