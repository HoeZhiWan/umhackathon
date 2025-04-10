// filepath: c:\Users\BreakableTime\Documents\Code Project\umhackathon\app\api\set-merchant\route.ts
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
    
    // Update the server-side store
    setCurrentMerchant(merchantId, merchantName);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting merchant:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set merchant' },
      { status: 500 }
    );
  }
}