import { topSellingItemsWeek, topSellingItemsMonth, salesByWeek } from '../actions/sql';
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
      items: topItems.length > 0 ? topItems : 'No data available',
      clientAction: {
        type: "ADD_DATA_WINDOW",
        params: {
          visualization_type: 'stats',
          title: `${merchantName}'s Top 5 Selling Items (${time_period})`,
          id: `top-selling-${time_period}-${Date.now()}`,
          data: {
            topItems: topItems.length > 0 ? topItems : 'No data available',
            period: time_period,
            merchant: merchantName
          }
        }
      }
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
        message: `No sales data was found for ${merchantName} during the specified period.`,
        weeklySales: [],
      };
    }

    // Format the weekly sales data into a chatbot-friendly response
    const formattedSales = weeklySales.map(
      (week) => `Week starting on ${week.week}: Total Sales = $${week.totalSales.toFixed(2)}`
    ).join('\n');

    return {
      success: true,
      merchant_name: merchantName,
      message: `Here is the weekly sales data for ${merchantName}:\n${formattedSales}`,
      weeklySales,
      clientAction: {
        type: "ADD_DATA_WINDOW",
        params: {
          visualization_type: 'stats',
          title: `${merchantName}'s Weekly Sales`,
          id: `weekly-sales-${Date.now()}`,
          data: {
            weeklySales,
            merchant: merchantName,
          },
        },
      },
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
