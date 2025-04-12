import { NextRequest, NextResponse } from 'next/server';
import { storeImage } from '@/app/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Images API: Received request');
    
    // Get the base64 image from the request
    const body = await request.json().catch(e => {
      console.error('❌ Images API: Failed to parse JSON body', e);
      return {};
    });
    
    const { imageData } = body;
    
    if (!imageData) {
      console.error('❌ Images API: No image data provided');
      return NextResponse.json({ 
        success: false, 
        error: 'No image data provided' 
      }, { status: 400 });
    }
    
    console.log(`📊 Images API: Received image data of length ${imageData.length}`);
    
    // Store the image in Supabase Storage
    console.log('🔄 Images API: Calling storeImage...');
    const { success, url, error } = await storeImage(imageData);
    
    if (!success || !url) {
      console.error('❌ Images API: Storage failed', error);
      return NextResponse.json({ 
        success: false, 
        error: error?.message || 'Failed to store image' 
      }, { status: 500 });
    }
    
    // Return the public URL to the image
    console.log('✅ Images API: Successfully stored image', url);
    return NextResponse.json({
      success: true,
      url
    });
  } catch (error) {
    console.error('❌ Images API: Unexpected error', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to store image',
      details: (error as Error).message
    }, { status: 500 });
  }
}