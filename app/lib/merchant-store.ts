// filepath: c:\Users\BreakableTime\Documents\Code Project\umhackathon\app\lib\merchant-store.ts
// Merchant store using cookies rather than global variables
import { cookies } from 'next/headers';

const MERCHANT_ID_COOKIE = 'merchant_id';
const MERCHANT_NAME_COOKIE = 'merchant_name';

// Default merchant values
const DEFAULT_MERCHANT_ID = '0c2d7';
const DEFAULT_MERCHANT_NAME = 'Fried Chicken Express';

export async function setCurrentMerchant(merchantId: string, merchantName: string) {
  // In server components, we use the cookies() function
  try {
    const cookieStore = await cookies();
    cookieStore.set(MERCHANT_ID_COOKIE, merchantId, {
      path: '/',
      httpOnly: false, // Make it accessible to client-side JS
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    cookieStore.set(MERCHANT_NAME_COOKIE, merchantName, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7
    });
  } catch (e) {
    // Handle client-side cookie setting if needed
    if (typeof document !== 'undefined') {
      document.cookie = `${MERCHANT_ID_COOKIE}=${merchantId};path=/;max-age=${60*60*24*7}`;
      document.cookie = `${MERCHANT_NAME_COOKIE}=${merchantName};path=/;max-age=${60*60*24*7}`;
    }
  }
}

export async function getCurrentMerchant() {
  let merchantId = DEFAULT_MERCHANT_ID;
  let merchantName = DEFAULT_MERCHANT_NAME;
  
  try {
    // Try to get from cookies API (server-side)
    const cookieStore = await cookies();
    merchantId = cookieStore.get(MERCHANT_ID_COOKIE)?.value || DEFAULT_MERCHANT_ID;
    merchantName = cookieStore.get(MERCHANT_NAME_COOKIE)?.value || DEFAULT_MERCHANT_NAME;
  } catch (e) {
    // Handle client-side cookie reading if needed
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === MERCHANT_ID_COOKIE) merchantId = value;
        if (name === MERCHANT_NAME_COOKIE) merchantName = value;
      }
    }
  }
  
  return {
    merchantId,
    merchantName
  };
}