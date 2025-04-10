import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function topSellingItemsWeek(merchantId: string): Promise<{ 
  topSellingItems: Array<{ name: string; count: number }> | null;
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
      return {topSellingItems:null, error:errorOrder };
    }

    const orderIds = orders.map(order => order.order_id);

    if (orderIds.length === 0) {
      console.log('No orders found in this week.');
      return { topSellingItems:[], error:null};
    }
    
    // Query transaction_items
    const { data: items, error:errorItem } = await supabase
    .from('transaction_items')
    .select('item_id')
    .in('order_id', orderIds)
    .eq('merchant_id', merchantId);
    

    if (errorItem) {
      console.error('SQL query error:', errorItem);
      return { topSellingItems:null, error:errorItem };
    }

    // Count occurrences of each item_id
    const countMap: Record<number, { count: number; itemId: number }> = {};

    for (const item of items) {
      // Ensure item_id is treated as a number
      const id = Number(item.item_id);
      if (countMap[id]) {
        countMap[id].count += 1;
      } else {
        countMap[id] = { count: 1, itemId: id };
      }
    }

    // Sort items by count in descending order and take top 5
    const topItems = Object.entries(countMap)
      .map(([idStr, { count }]) => ({ id: Number(idStr), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    if (topItems.length === 0) {
      return { topSellingItems: [], error: null };
    }

    // Get item names for the top items - ensure we're passing numbers
    const itemIds = topItems.map(item => item.id);
    
    console.log('Looking up items with IDs:', itemIds);
    
    const { data: itemNames, error: itemInfoError } = await supabase
      .from("items")
      .select("item_id, item_name")
      .in("item_id", itemIds);

    if (itemInfoError) {
      console.error('Error fetching item names:', itemInfoError);
      return { topSellingItems: null, error: itemInfoError };
    }
    
    console.log('Found item names:', itemNames);

    // Create result with names and counts
    const result = topItems.map(item => {
      const foundItem = itemNames.find(nameItem => Number(nameItem.item_id) === item.id);
      return {
        name: foundItem ? foundItem.item_name : `Unknown Item (${item.id})`,
        count: item.count
      };
    });

    return { topSellingItems: result, error: null };
    
  } catch (error) {
    console.error('Failed to execute SQL query:', error);
    return { topSellingItems: null, error: error as Error };
  }
}

export async function topSellingItemsMonth(merchantId: string): Promise<{ 
  topSellingItems: Array<{ name: string; count: number }> | null;
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
      return {topSellingItems:null, error:errorOrder };
    }

    const orderIds = orders.map(order => order.order_id);

    if (orderIds.length === 0) {
      console.log('No orders found in this month.');
      return { topSellingItems:[], error:null};
    }
    
    // Query transaction_items
    const { data: items, error:errorItem} = await supabase
    .from('transaction_items')
    .select('item_id')
    .in('order_id', orderIds)
    .eq('merchant_id', merchantId);
    

    if (errorItem) {
      console.error('SQL query error:', errorItem);
      return { topSellingItems:null, error:errorItem };
    }

    // Count occurrences of each item_id
    const countMap: Record<number, { count: number; itemId: number }> = {};

    for (const item of items) {
      // Ensure item_id is treated as a number
      const id = Number(item.item_id);
      if (countMap[id]) {
        countMap[id].count += 1;
      } else {
        countMap[id] = { count: 1, itemId: id };
      }
    }

    // Sort items by count in descending order and take top 5
    const topItems = Object.entries(countMap)
      .map(([idStr, { count }]) => ({ id: Number(idStr), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    if (topItems.length === 0) {
      return { topSellingItems: [], error: null };
    }

    // Get item names for the top items - ensure we're passing numbers
    const itemIds = topItems.map(item => item.id);
    
    console.log('Looking up monthly items with IDs:', itemIds);
    
    const { data: itemNames, error: itemInfoError } = await supabase
      .from("items")
      .select("item_id, item_name")
      .in("item_id", itemIds);

    if (itemInfoError) {
      console.error('Error fetching item names:', itemInfoError);
      return { topSellingItems: null, error: itemInfoError };
    }
    
    console.log('Found monthly item names:', itemNames);

    // Create result with names and counts
    const result = topItems.map(item => {
      const foundItem = itemNames.find(nameItem => Number(nameItem.item_id) === item.id);
      return {
        name: foundItem ? foundItem.item_name : `Unknown Item (${item.id})`,
        count: item.count
      };
    });

    return { topSellingItems: result, error: null };
    
  } catch (error) {
    console.error('Failed to execute SQL query:', error);
    return { topSellingItems: null, error: error as Error };
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

export async function salesByWeek(merchantId: string): Promise<{ 
  weeklySales: Array<{ week: string; totalSales: number }> | null; 
  error: Error | null; 
}> {
  const startDate = '2023-12-01T00:00:00';
  const endDate = '2023-12-31T23:59:59';

  try {
    // Fetch transaction data for the merchant within December
    const { data: transactions, error: transactionError } = await supabase
      .from('transaction_data')
      .select('order_time, order_value')
      .eq('merchant_id', merchantId)
      .gte('order_time', startDate)
      .lte('order_time', endDate);

    if (transactionError) {
      console.error('Error fetching transaction data:', transactionError);
      return { weeklySales: null, error: transactionError };
    }

    if (!transactions || transactions.length === 0) {
      console.log('No transactions found for the specified period.');
      return { weeklySales: [], error: null };
    }

    // Aggregate data by week
    const weeklySalesMap: Record<string, number> = {};
    const baseDate = new Date('2023-12-05T00:00:00'); // Base date for weekly aggregation

    transactions.forEach(transaction => {
      const orderDate = new Date(transaction.order_time);
      const diffInDays = Math.floor((orderDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(diffInDays / 7); // Calculate the week number relative to the base date
      const weekStart = new Date(baseDate);
      weekStart.setDate(baseDate.getDate() + weekNumber * 7); // Calculate the start of the week
      weekStart.setHours(0, 0, 0, 0); // Reset time to midnight
      const weekKey = weekStart.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      weeklySalesMap[weekKey] = (weeklySalesMap[weekKey] || 0) + transaction.order_value;
    });

    // Convert the weekly sales map to an array
    const weeklySales = Object.entries(weeklySalesMap).map(([week, totalSales]) => ({
      week,
      totalSales,
    }));

    // Sort by week (ascending)
    weeklySales.sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

    return { weeklySales, error: null };
  } catch (error) {
    console.error('Failed to calculate sales by week:', error);
    return { weeklySales: null, error: error as Error };
  }
}

export async function suggestItemsToSell(merchantId: string): Promise<{ 
  suggestions: Array<{ cuisineTag: string; keyword: string }> | null; 
  error: Error | null; 
}> {
  try {
    // Fetch items for the merchant
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('item_id, cuisine_tag')
      .eq('merchant_id', merchantId);

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
      return { suggestions: null, error: itemsError };
    }

    if (!items || items.length === 0) {
      console.log('No items found for the merchant.');
      return { suggestions: [], error: null };
    }

    // Extract unique cuisine tags from the items
    const merchantCuisineTags = Array.from(new Set(items.map(item => item.cuisine_tag).filter(tag => tag)));

    if (merchantCuisineTags.length === 0) {
      console.log('No cuisine tags found for the merchant.');
      return { suggestions: [], error: null };
    }

    // Fetch keywords for the cuisine tags from max_viewed_keyword_by_tag
    const { data: keywords, error: keywordsError } = await supabase
      .from('max_viewed_keyword_by_tag')
      .select('cuisine_tag, keyword')
      .in('cuisine_tag', merchantCuisineTags);

    if (keywordsError) {
      console.error('Error fetching keywords:', keywordsError);
      return { suggestions: null, error: keywordsError };
    }

    if (!keywords || keywords.length === 0) {
      console.log('No matching keywords found for the cuisine tags.');
      return { suggestions: [], error: null };
    }

    // Map cuisine tags to their corresponding keywords
    const suggestions = merchantCuisineTags.map(tag => {
      const matchedKeyword = keywords.find(keyword => keyword.cuisine_tag === tag);
      return matchedKeyword ? { cuisineTag: tag, keyword: matchedKeyword.keyword } : null;
    }).filter(suggestion => suggestion !== null) as Array<{ cuisineTag: string; keyword: string }>;

    return { suggestions, error: null };
  } catch (error) {
    console.error('Failed to suggest items to sell:', error);
    return { suggestions: null, error: error as Error };
  }
}