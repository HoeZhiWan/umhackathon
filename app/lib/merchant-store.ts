// filepath: c:\Users\BreakableTime\Documents\Code Project\umhackathon\app\lib\merchant-store.ts
// Simple server-side store for merchant data
// This is used by server components and API routes that can't use React context

// Storage for merchant information
let currentMerchantId = '0c2d7';
let currentMerchantName = 'Fried Chicken Express';

export function setCurrentMerchant(merchantId: string, merchantName: string) {
  currentMerchantId = merchantId;
  currentMerchantName = merchantName;
}

export function getCurrentMerchant() {
  return {
    merchantId: currentMerchantId,
    merchantName: currentMerchantName
  };
}