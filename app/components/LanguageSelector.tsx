'use client';

import React from 'react';
import { useLanguage, LANGUAGES } from '../contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = event.target.value;
    setLanguage(selectedCode);
  };
  
  return (
    <div className="flex items-center">
      <label htmlFor="language-selector" className="mr-2 text-sm font-medium"
        style={{ color: "var(--foreground)" }}>
        Language:
      </label>
      <select
        id="language-selector"
        value={language}
        onChange={handleLanguageChange}
        className="rounded-2xl p-1.5 text-sm border font-medium"
        style={{ 
          backgroundColor: "var(--light)",
          color: "var(--dark)",
          borderColor: "var(--secondary)"
        }}
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}