import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

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
      console.log('No orders found in this month.');
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

export async function bestSellingTime(merchantId: string): Promise<{ 
  bestSellingTime: string | null; 
  error: Error | null; 
}> {
  const startDate = '2023-12-01T00:00:00';
  const endDate = '2023-12-31T23:59:59';

  try {
    // Fetch transaction data for the merchant within the specified date range
    const { data: transactions, error: transactionError } = await supabase
      .from('transaction_data')
      .select('order_id, order_time')
      .eq('merchant_id', merchantId)
      .gte('order_time', startDate)
      .lte('order_time', endDate);

    if (transactionError) {
      console.error('Error fetching transaction data:', transactionError);
      return { bestSellingTime: null, error: transactionError };
    }

    if (!transactions || transactions.length === 0) {
      console.log('No transactions found for the specified period.');
      return { bestSellingTime: null, error: null };
    }

    // Fetch transaction items and merge with transaction data
    const orderIds = transactions.map(transaction => transaction.order_id);
    const { data: items, error: itemsError } = await supabase
      .from('transaction_items')
      .select('order_id, item_id')
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error fetching transaction items:', itemsError);
      return { bestSellingTime: null, error: itemsError };
    }

    // Merge transactions with items
    const mergedData = transactions.map(transaction => ({
      ...transaction,
      item_id: items.find(item => item.order_id === transaction.order_id)?.item_id || null,
    }));

    // Extract the hour from order_time and count occurrences
    const hourCounts: Record<string, number> = {};
    mergedData.forEach(data => {
      const orderHour = new Date(data.order_time).getHours();
      const hourKey = `${orderHour.toString().padStart(2, '0')}:00:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });

    // Find the hour with the highest count
    const bestHour = Object.entries(hourCounts).reduce((max, current) => 
      current[1] > max[1] ? current : max, ['', 0]
    )[0];

    return { bestSellingTime: bestHour || null, error: null };
  } catch (error) {
    console.error('Failed to calculate best selling time:', error);
    return { bestSellingTime: null, error: error as Error };
  }
}

export async function bestSellingDay(merchantId: string): Promise<{ 
  bestSellingDay: string | null; 
  error: Error | null; 
}> {
  const startDate = '2023-12-01T00:00:00';
  const endDate = '2023-12-31T23:59:59';

  try {
    // Fetch transaction data for the merchant within the specified date range
    const { data: transactions, error: transactionError } = await supabase
      .from('transaction_data')
      .select('order_time, order_value')
      .eq('merchant_id', merchantId)
      .gte('order_time', startDate)
      .lte('order_time', endDate);

    if (transactionError) {
      console.error('Error fetching transaction data:', transactionError);
      return { bestSellingDay: null, error: transactionError };
    }

    if (!transactions || transactions.length === 0) {
      console.log('No transactions found for the specified period.');
      return { bestSellingDay: null, error: null };
    }

    // Aggregate daily order values
    const dailyOrderCounts: Record<string, number> = {};
    transactions.forEach(transaction => {
      const orderDate = new Date(transaction.order_time).toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
      dailyOrderCounts[orderDate] = (dailyOrderCounts[orderDate] || 0) + transaction.order_value;
    });

    // Find the day with the highest total order value
    let bestDay: string | null = null;
    let maxOrderValue = 0;

    for (const [date, totalOrderValue] of Object.entries(dailyOrderCounts)) {
      if (totalOrderValue > maxOrderValue) {
        bestDay = date;
        maxOrderValue = totalOrderValue;
      }
    }

    return { bestSellingDay: bestDay, error: null };
  } catch (error) {
    console.error('Failed to calculate best selling day:', error);
    return { bestSellingDay: null, error: error as Error };
  }
}