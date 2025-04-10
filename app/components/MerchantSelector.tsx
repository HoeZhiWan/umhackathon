'use client';

import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useMerchant } from '../contexts/MerchantContext';

// Merchant data
export const merchants = [
  { id: "0c2d7", name: "Fried Chicken Express" },
  { id: "0c5d8", name: "Burger Joint" },
  { id: "0c6e4", name: "Sandwich Express" },
  { id: "0e1b3", name: "Chicken Shack" }
];

// Define props interface for the component
interface MerchantSelectorProps {
  currentMerchantId?: string;
  onMerchantChange?: Dispatch<SetStateAction<string>>;
}

export default function MerchantSelector({ currentMerchantId, onMerchantChange }: MerchantSelectorProps = {}) {
  // Use context if available, otherwise use props
  const context = useMerchant();
  
  // Determine which merchant ID and setter to use (props or context)
  const merchantId = currentMerchantId !== undefined ? currentMerchantId : context.merchantId;
  const setMerchantId = onMerchantChange || context.setMerchantId;
  
  const handleMerchantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const selectedMerchant = merchants.find(m => m.id === selectedId);
    
    if (selectedMerchant) {
      // Update ID with the setter we determined
      setMerchantId(selectedMerchant.id);
      
      // If we're using context, also update the name
      if (!onMerchantChange && context.setMerchantName) {
        context.setMerchantName(selectedMerchant.name);
      }
      
      // Also update the server-side store via API call
      fetch('/api/set-merchant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId: selectedMerchant.id,
          merchantName: selectedMerchant.name
        }),
      });
    }
  };
  
  return (
    <div className="flex items-center">
      <label htmlFor="merchant-selector" className="mr-2 text-sm font-medium"
        style={{ color: "var(--foreground)" }}>
        Current Merchant:
      </label>
      <select
        id="merchant-selector"
        value={merchantId}
        onChange={handleMerchantChange}
        className="rounded-md p-1.5 text-sm border"
        style={{ 
          backgroundColor: "var(--light)",
          color: "var(--dark)",
          borderColor: "var(--secondary)"
        }}
      >
        {merchants.map(merchant => (
          <option key={merchant.id} value={merchant.id}>
            {merchant.name}
          </option>
        ))}
      </select>
    </div>
  );
}
