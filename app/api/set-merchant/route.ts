import { NextRequest, NextResponse } from 'next/server';
import { setCurrentMerchant } from '../../lib/merchant-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantId, merchantName } = body;
    
    if (!merchantId || !merchantName) {
      return NextResponse.json(
        { success: false, message: 'Missing merchantId or merchantName' },
        { status: 400 }
      );
    }
    
    setCurrentMerchant(merchantId, merchantName);
    
    const response = NextResponse.json({ success: true });
    
    response.cookies.set(
      'merchant_id', 
      merchantId, 
      { path: '/', httpOnly: false, maxAge: 60 * 60 * 24 * 7 }
    );
    response.cookies.set(
      'merchant_name', 
      merchantName, 
      { path: '/', httpOnly: false, maxAge: 60 * 60 * 24 * 7 }
    );
    
    return response;
  } catch (error) {
    console.error('Error setting merchant:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set merchant' },
      { status: 500 }
    );
  }
}