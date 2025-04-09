"use client";

import { useState } from 'react';

const merchants = [
  { id: "abc123", name: "ABC Store" },
  { id: "xyz456", name: "XYZ Market" },
  { id: "shop789", name: "Shop 789" },
  { id: "store_101", name: "Store 101" }
];

interface MerchantSelectorProps {
  currentMerchantId: string;
  onMerchantChange: (merchantId: string) => void;
  compact?: boolean;
}

export default function MerchantSelector({ 
  currentMerchantId, 
  onMerchantChange,
  compact = false 
}: MerchantSelectorProps) {
  // Find the current merchant name
  const currentMerchant = merchants.find(m => m.id === currentMerchantId);
  
  return (
    <select
      value={currentMerchantId}
      onChange={(e) => onMerchantChange(e.target.value)}
      className={`border border-black/[.08] dark:border-white/[.145] rounded-md bg-white dark:bg-gray-800 p-2 ${
        compact ? 'text-xs' : 'text-sm'
      }`}
      style={compact ? { maxWidth: '120px' } : undefined}
    >
      {merchants.map((merchant) => (
        <option key={merchant.id} value={merchant.id}>
          {merchant.name}
        </option>
      ))}
    </select>
  );
}
