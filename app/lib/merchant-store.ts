import { cookies } from 'next/headers';

const MERCHANT_ID_COOKIE = 'merchant_id';
const MERCHANT_NAME_COOKIE = 'merchant_name';

const DEFAULT_MERCHANT_ID = '0c2d7';
const DEFAULT_MERCHANT_NAME = 'Fried Chicken Express';

export async function setCurrentMerchant(merchantId: string, merchantName: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(MERCHANT_ID_COOKIE, merchantId, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7
    });
    cookieStore.set(MERCHANT_NAME_COOKIE, merchantName, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7
    });
  } catch (e) {
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
    const cookieStore = await cookies();
    merchantId = cookieStore.get(MERCHANT_ID_COOKIE)?.value || DEFAULT_MERCHANT_ID;
    merchantName = cookieStore.get(MERCHANT_NAME_COOKIE)?.value || DEFAULT_MERCHANT_NAME;
  } catch (e) {
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