"use client"

import { useState } from 'react';

// Define the list of available merchants
const AVAILABLE_MERCHANTS = [
  { id: "abc123", name: "Laksa" },
  { id: "def456", name: "Hokkien Mee" },
  { id: "hij789", name: "Curry Mee" },
  { id: "klm012", name: "Gulai Ayam" },
];

type MerchantSelectorProps = {
  currentMerchantId: string;
  onMerchantChange: (merchantId: string) => void;
};

export default function MerchantSelector({ 
  currentMerchantId, 
  onMerchantChange 
}: MerchantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Find the current merchant name
  const currentMerchant = AVAILABLE_MERCHANTS.find(m => m.id === currentMerchantId) || AVAILABLE_MERCHANTS[0];
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        <span>Merchant: {currentMerchant.name}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-black/[.08] dark:border-white/[.145] z-10">
          <div className="py-1">
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-black/[.08] dark:border-white/[.145]">
              Switch Merchant
            </div>
            {AVAILABLE_MERCHANTS.map(merchant => (
              <button
                key={merchant.id}
                onClick={() => {
                  onMerchantChange(merchant.id);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  merchant.id === currentMerchantId ? 'bg-gray-100 dark:bg-gray-700 font-medium' : ''
                }`}
              >
                {merchant.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
