// filepath: c:\Users\BreakableTime\Documents\Code Project\umhackathon\app\contexts\MerchantContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MerchantContextType {
  merchantId: string;
  merchantName: string;
  setMerchantId: (id: string) => void;
  setMerchantName: (name: string) => void;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [merchantId, setMerchantId] = useState<string>('0c2d7');
  const [merchantName, setMerchantName] = useState<string>('Fried Chicken Express');
  
  return (
    <MerchantContext.Provider value={{ merchantId, merchantName, setMerchantId, setMerchantName }}>
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchant = (): MerchantContextType => {
  const context = useContext(MerchantContext);
  if (context === undefined) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
};