import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get the highest order_value from the transaction_data table along with its order_id
 * @returns The highest order_value, order_id or null if not found
 */
export async function getHighestOrderValue(): Promise<{ 
  value: number | null; 
  orderId: string | null;
  error: Error | null 
}> {
  try {
    const { data, error } = await supabase
      .from('transaction_data')
      .select('order_value, order_id')
      .order('order_value', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('SQL query error:', error);
      return { value: null, orderId: null, error };
    }
    
    return {
      value: data ? data.order_value : null,
      orderId: data ? data.order_id : null,
      error: null
    };
  } catch (error) {
    console.error('Failed to execute SQL query:', error);
    return { value: null, orderId: null, error: error as Error };
  }
}
