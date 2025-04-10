import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

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

export async function topSellingItemsWeek(merchantId: string): Promise<{ 
  topSellingItem: string | null;
  error: Error | null;
}> {
  const startDate = '2023-12-25T00:00';
  const endDate = '2023-12-31T23:59';
  try {
    const { data:orders, error:errorOrder } = await supabase
    .from('transaction_data')
    .select('order_id')
    .eq('merchant_id', merchantId)
    .gte('order_time', startDate)
    .lte('order_time', endDate)


    if (errorOrder) {
      console.error('SQL query error:', errorOrder);
      return {topSellingItem:null, error:errorOrder };
    }

    const orderIds = orders.map(order => order.order_id);

    if (orderIds.length === 0) {
      console.log('No orders found in this week.');
      return { topSellingItem:null, error:errorOrder};
    }
    
    // Query transaction_items
    const { data: items, error:errorItem} = await supabase
    .from('transaction_items')
    .select('item_id')
    .in('order_id', orderIds)
    .eq('merchant_id', merchantId);
    

    if (errorItem) {
      console.error('SQL query error:', errorItem);
      return { topSellingItem:null,  error:errorItem };
    }

    // Count occurrences of each item_id
    const countMap: Record<string, { count: number; itemId: string }> = {};

    for (const item of items) {
      const id = item.item_id;
      if (countMap[id]) {
        countMap[id].count += 1;
      } else {
        countMap[id] = { count: 1, itemId: id };
      }
    }

    // Find the mode (most frequently occurring item_id)
    let modeId: string | null = null;
    let modeCount = 0;

    for (const [id, { count, itemId }] of Object.entries(countMap)) {
      if (count > modeCount) {
        modeId = id;
        modeCount = count;
      }
    }

    // Get item name
    const { data: modeName, error: itemInfoError } = await supabase
      .from("items")
      .select("item_name")
      .eq("item_id", modeId)
      .limit(1)

    return { topSellingItem: modeName && modeName.length > 0 ? modeName[0].item_name : null, error: null };
    
  } catch (error) {
    console.error('Failed to execute SQL query:', error);
    return { topSellingItem:null, error: error as Error };
  }
}

export async function topSellingItemsMonth(merchantId: string): Promise<{ 
  topSellingItem: string | null;
  error: Error | null;
}> {
  const startDate = '2023-12-01T00:00';
  const endDate = '2023-12-31T23:59';
  try {
    const { data:orders, error:errorOrder } = await supabase
    .from('transaction_data')
    .select('order_id')
    .eq('merchant_id', merchantId)
    .gte('order_time', startDate)
    .lte('order_time', endDate)


    if (errorOrder) {
      console.error('SQL query error:', errorOrder);
      return {topSellingItem:null, error:errorOrder };
    }

    const orderIds = orders.map(order => order.order_id);

    if (orderIds.length === 0) {
      console.log('No orders found in this week.');
      return { topSellingItem:null, error:errorOrder};
    }
    
    // Query transaction_items
    const { data: items, error:errorItem} = await supabase
    .from('transaction_items')
    .select('item_id')
    .in('order_id', orderIds)
    .eq('merchant_id', merchantId);
    

    if (errorItem) {
      console.error('SQL query error:', errorItem);
      return { topSellingItem:null,  error:errorItem };
    }

    // Count occurrences of each item_id
    const countMap: Record<string, { count: number; itemId: string }> = {};

    for (const item of items) {
      const id = item.item_id;
      if (countMap[id]) {
        countMap[id].count += 1;
      } else {
        countMap[id] = { count: 1, itemId: id };
      }
    }

    // Find the mode (most frequently occurring item_id)
    let modeId: string | null = null;
    let modeCount = 0;

    for (const [id, { count, itemId }] of Object.entries(countMap)) {
      if (count > modeCount) {
        modeId = id;
        modeCount = count;
      }
    }

    // Get item name
    const { data: modeName, error: itemInfoError } = await supabase
      .from("items")
      .select("item_name")
      .eq("item_id", modeId)
      .limit(1)

    return { topSellingItem: modeName && modeName.length > 0 ? modeName[0].item_name : null, error: null };
    
  } catch (error) {
    console.error('Failed to execute SQL query:', error);
    return { topSellingItem:null, error: error as Error };
  }
  //hheheh
}
