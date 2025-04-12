import { supabase } from '../actions/sql';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'generated-food-items';

export async function storeImage(imageData: string): Promise<{ success: boolean; url?: string; error?: Error }> {
  try {
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    if (!base64Data || base64Data.length === 0) {
      throw new Error('Empty base64 data');
    }
    
    const filename = `${uuidv4()}.png`;
    const binaryData = Buffer.from(base64Data, 'base64');

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, binaryData, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Failed to store image in Supabase Storage:', error);
    return {
      success: false,
      error: error as Error
    };
  }
}

export async function storeImageFromGemini(imageData: string | null): Promise<{ success: boolean; url?: string; error?: Error }> {
  if (!imageData) {
    return {
      success: false,
      error: new Error('No image data provided')
    };
  }
  
  try {
    return await storeImage(imageData);
  } catch (error) {
    console.error('Direct server-side image storage failed:', error);
    return {
      success: false,
      error: error as Error
    };
  }
}

export async function cleanupOldImages(olderThanDays: number = 7): Promise<{ success: boolean; error?: Error }> {
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list();

    if (error) {
      throw error;
    }
    
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - olderThanDays));

    const oldFiles = files?.filter(file => {
      const createdAt = new Date(file.created_at);
      return createdAt < cutoffDate;
    }) || [];
    
    if (oldFiles.length > 0) {
      const filePaths = oldFiles.map(file => file.name);
      
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) {
        throw deleteError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to clean up old images:', error);
    return {
      success: false,
      error: error as Error
    };
  }
}