'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
];

interface LanguageContextType {
  language: string;
  languageName: string;
  setLanguage: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en');
  
  const setLanguage = (code: string) => {
    const validLanguage = LANGUAGES.find(lang => lang.code === code);
    if (validLanguage) {
      setLanguageState(code);
    }
  };
  
  const languageName = LANGUAGES.find(lang => lang.code === language)?.name || 'English';
  
  return (
    <LanguageContext.Provider value={{ language, languageName, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};