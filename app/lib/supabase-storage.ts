import { supabase } from '../actions/sql';
import { v4 as uuidv4 } from 'uuid';

// Supabase bucket name
const BUCKET_NAME = 'generated-food-items';

// Store image in Supabase Storage
export async function storeImage(imageData: string): Promise<{ success: boolean; url?: string; error?: Error }> {
  try {
    console.log('🚀 Starting image upload to Supabase...');

    // Extract the base64 data (remove the data:image/... prefix if present)
    console.log('📝 Processing image data, length:', imageData?.length || 0);
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    console.log('📏 Base64 data length after processing:', base64Data?.length || 0);
    if (!base64Data || base64Data.length === 0) {
      throw new Error('Empty base64 data');
    }
    
    // Generate a unique filename
    const filename = `${uuidv4()}.png`;
    console.log('📄 Generated filename for upload:', filename);
    
    // Convert base64 to binary data
    const binaryData = Buffer.from(base64Data, 'base64');
    console.log('📦 Converted to binary data, size:', binaryData.length, 'bytes');

    // Upload to Supabase Storage
    console.log('☁️ Uploading to Supabase storage...');
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, binaryData, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Error storing image in Supabase:', error);
      throw error;
    }

    console.log('✅ Upload successful:', data?.path);

    // Get public URL
    console.log('🔗 Generating public URL...');
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);
    
    console.log('🌐 Public URL generated:', urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('❌ Failed to store image in Supabase Storage:', error);
    return {
      success: false,
      error: error as Error
    };
  }
}

// Direct server-side function to store image from Gemini response
export async function storeImageFromGemini(imageData: string | null): Promise<{ success: boolean; url?: string; error?: Error }> {
  if (!imageData) {
    console.log('⚠️ No image data received from Gemini');
    return {
      success: false,
      error: new Error('No image data provided')
    };
  }
  
  try {
    console.log('🔄 Direct server-side image storage started');
    return await storeImage(imageData);
  } catch (error) {
    console.error('❌ Direct server-side image storage failed:', error);
    return {
      success: false,
      error: error as Error
    };
  }
}

// Clean up old images (can be used in a scheduled function)
export async function cleanupOldImages(olderThanDays: number = 7): Promise<{ success: boolean; error?: Error }> {
  try {
    console.log('🧹 Starting cleanup of old images...');
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list();

    if (error) {
      console.error('❌ Error listing files:', error);
      throw error;
    }

    console.log('📋 Found total files:', files?.length || 0);
    
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - olderThanDays));
    console.log('📅 Cutoff date for deletion:', cutoffDate);

    // Filter files older than the cutoff date
    const oldFiles = files?.filter(file => {
      const createdAt = new Date(file.created_at);
      return createdAt < cutoffDate;
    }) || [];
    
    console.log('🗑️ Files to delete:', oldFiles.length);

    // Delete old files
    if (oldFiles.length > 0) {
      const filePaths = oldFiles.map(file => file.name);
      console.log('🗑️ Deleting files:', filePaths);
      
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) {
        console.error('❌ Error deleting old files:', deleteError);
        throw deleteError;
      }

      console.log(`✅ Deleted ${oldFiles.length} old files`);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Failed to clean up old images:', error);
    return {
      success: false,
      error: error as Error
    };
  }
}