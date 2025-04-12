import { NextRequest, NextResponse } from 'next/server';
import { storeImage } from '@/app/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(e => {
      console.error('Failed to parse JSON body', e);
      return {};
    });
    
    const { imageData } = body;
    
    if (!imageData) {
      return NextResponse.json({ 
        success: false, 
        error: 'No image data provided' 
      }, { status: 400 });
    }
    
    const { success, url, error } = await storeImage(imageData);
    
    if (!success || !url) {
      return NextResponse.json({ 
        success: false, 
        error: error?.message || 'Failed to store image' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      url
    });
  } catch (error) {
    console.error('Error storing image:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to store image',
      details: (error as Error).message
    }, { status: 500 });
  }
}