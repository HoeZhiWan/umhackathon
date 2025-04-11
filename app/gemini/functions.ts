import { topSellingItemsWeek, topSellingItemsMonth, salesByWeek, bestSellingDay, suggestItemsToSell } from '../actions/sql';
import { getCurrentMerchant } from '../lib/merchant-store';

// Dummy weather function implementation
export function dummy_getCurrentWeather(location: string, unit: string = 'Celsius') {
  return {
    location,
    temperature: unit === 'Celsius' ? 22 : 72,
    unit: unit || 'Celsius',
    description: 'Sunny',
    humidity: '65%'
  };
}

// Generate fake forecast data for the specified number of days
export function dummy_getWeatherForecast(location: string, days: number = 3, unit: string = 'Celsius') {
  const forecast = [];
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Thunderstorms'];
  const today = new Date();
  
  for (let i = 0; i < Math.min(days || 3, 7); i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i + 1);
    
    // Generate random temperature with some variance
    const baseTemp = unit === 'Celsius' ? 22 : 72;
    const variance = Math.floor(Math.random() * 10) - 5;
    const temperature = baseTemp + variance;
    
    // Pick a random condition
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      temperature,
      unit: unit || 'Celsius',
      condition
    });
  }
  
  return {
    location,
    forecast,
    unit: unit || 'Celsius'
  };
}

// Function to switch the user's language automatically
export function switch_language(language_code: string) {
  try {
    // Validate the language code (should match those available in LanguageContext)
    const validLanguageCodes = ['en', 'ms', 'zh', 'ta'];
    
    if (!validLanguageCodes.includes(language_code)) {
      return {
        success: false,
        error: `Invalid language code: ${language_code}. Valid codes are: ${validLanguageCodes.join(', ')}`,
      };
    }
    
    // Return a success response with a client action to switch the language
    return {
      success: true,
      language_code,
      message: `Switching to ${language_code} language`,
      clientAction: {
        type: "SWITCH_LANGUAGE",
        params: {
          language_code
        }
      }
    };
  } catch (error) {
    console.error('Error in switch_language:', error);
    return {
      success: false,
      error: 'Failed to switch language',
    };
  }
}

// Function to get top selling items
export async function get_top_selling_items(time_period: 'week' | 'month') {
  try {
    // Get the merchant ID automatically from the store
    const { merchantId, merchantName } = await getCurrentMerchant();
    
    let result;
    
    if (time_period === 'week') {
      result = await topSellingItemsWeek(merchantId);
    } else if (time_period === 'month') {
      result = await topSellingItemsMonth(merchantId);
    } else {
      return {
        success: false,
        error: 'Invalid time period. Please use "week" or "month".',
        items: null
      };
    }

    if (result.error) {
      return {
        success: false,
        error: `Error retrieving top selling items: ${result.error.message}`,
        items: null
      };
    }

    const topItems = result.topSellingItems || [];
    
    return {
      success: true,
      time_period,
      merchant_name: merchantName,
      items: topItems.length > 0 ? topItems : []
    };
  } catch (error) {
    console.error('Error in get_top_selling_items:', error);
    return {
      success: false,
      error: 'Failed to retrieve top selling items',
      items: null
    };
  }
}

// Function to display data visualization windows
export function display_data_window(visualization_type: 'chart' | 'graph' | 'stats', title?: string) {
  // This function returns a structured response with a client action
  const windowType = visualization_type as 'chart' | 'graph' | 'stats';
  
  // Create a descriptive response about what will be displayed
  const visualizationDescriptions = {
    chart: "bar chart showing sales by category",
    graph: "line graph showing performance trends over time",
    stats: "key metrics including total revenue, customers, average order value, and conversion rate"
  };
  
  // Generate a stable ID based on the window type and title
  const windowTitle = title || (windowType === 'chart' ? 'Sales Analysis' : 
                     windowType === 'graph' ? 'Performance Trends' : 'Key Statistics');
  
  // Create a stable unique ID by combining type and title (and timestamp as fallback)
  const resultId = `window-${windowType}-${windowTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
  
  return {
    success: true,
    window_type: windowType,
    title: windowTitle,
    description: `A ${visualizationDescriptions[windowType]} has been displayed.`,
    id: resultId, // Add a stable ID here
    // Add a structured client action that the frontend can interpret
    clientAction: {
      type: "ADD_DATA_WINDOW",
      params: {
        visualization_type: windowType,
        title: windowTitle,
        id: resultId // Include the ID in the params as well
      }
    }
  };
}

// Function to get weekly sales data
export async function get_weekly_sales() {
  try {
    // Get the merchant ID automatically from the store
    const { merchantId, merchantName } = await getCurrentMerchant();

    // Fetch weekly sales data
    const { weeklySales, error } = await salesByWeek(merchantId);

    if (error) {
      return {
        success: false,
        error: `Error retrieving weekly sales: ${error.message}`,
        weeklySales: null,
      };
    }

    if (!weeklySales || weeklySales.length === 0) {
      return {
        success: true,
        merchant_name: merchantName,
        weeklySales: [],
      };
    }

    return {
      success: true,
      merchant_name: merchantName,
      weeklySales,
    };
  } catch (error) {
    console.error('Error in get_weekly_sales:', error);
    return {
      success: false,
      error: 'Failed to retrieve weekly sales data',
      weeklySales: null,
    };
  }
}

// Function to get merchant's best selling day
export async function get_best_selling_day() {
  try {
    // Get the merchant ID automatically from the store
    const { merchantId, merchantName } = await getCurrentMerchant();

    // Fetch best selling day data
    const { bestSellingDay: bestDay, error } = await bestSellingDay(merchantId);

    if (error) {
      return {
        success: false,
        error: `Error retrieving best selling day: ${error.message}`,
        bestSellingDay: null,
      };
    }

    if (!bestDay) {
      return {
        success: true,
        merchant_name: merchantName,
        bestSellingDay: null,
      };
    }

    // Format the date to display in a more readable format
    const date = new Date(bestDay);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      success: true,
      merchant_name: merchantName,
      bestSellingDay: bestDay,
      formattedDate,
    };
  } catch (error) {
    console.error('Error in get_best_selling_day:', error);
    return {
      success: false,
      error: 'Failed to retrieve best selling day data',
      bestSellingDay: null,
    };
  }
}

// Function to get item suggestions for the merchant based on their cuisine tags
export async function get_item_suggestions() {
  try {
    // Get the merchant ID automatically from the store
    const { merchantId, merchantName } = await getCurrentMerchant();

    // Fetch item suggestions data
    const { suggestions, error } = await suggestItemsToSell(merchantId);

    if (error) {
      return {
        success: false,
        error: `Error retrieving item suggestions: ${error.message}`,
        suggestions: null,
      };
    }

    if (!suggestions || suggestions.length === 0) {
      return {
        success: true,
        merchant_name: merchantName,
        suggestions: [],
      };
    }

    return {
      success: true,
      merchant_name: merchantName,
      suggestions,
    };
  } catch (error) {
    console.error('Error in get_item_suggestions:', error);
    return {
      success: false,
      error: 'Failed to retrieve item suggestions',
      suggestions: null,
    };
  }
}


