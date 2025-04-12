import { topSellingItemsWeek, topSellingItemsMonth, salesByWeek, bestSellingDay, suggestItemsToSell } from '../actions/sql';
import { getCurrentMerchant } from '../lib/merchant-store';
import { genAIClient, MODEL_NAME, MODEL_NAME_IMAGE_GENERATION, getDescriptionAndImagePrompt } from './config';

export function switch_language(language_code: string) {
  try {
    const validLanguageCodes = ['en', 'ms', 'zh', 'ta'];
    
    if (!validLanguageCodes.includes(language_code)) {
      return {
        success: false,
        error: `Invalid language code: ${language_code}. Valid codes are: ${validLanguageCodes.join(', ')}`,
      };
    }
    
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

export function set_data_window(
  visualization_type: 'chart' | 'graph' | 'stats',
  title: string,
  data: {
    chartData?: Array<{ name: string; value: number }>;
    lineData?: Array<{ name: string; value: number }>;
    statData?: Array<{ label: string; value: string }>;
    topItems?: Array<{ name: string; count: number }>;
    period?: string;
    merchant?: string;
  }
) {
  try {
    if (!['chart', 'graph', 'stats'].includes(visualization_type)) {
      return {
        success: false,
        error: `Invalid visualization type: ${visualization_type}. Valid types are: chart, graph, stats`,
      };
    }

    if (visualization_type === 'chart' && !data.chartData && !data.topItems) {
      return {
        success: false,
        error: 'Chart visualization requires chartData or topItems',
      };
    }

    if (visualization_type === 'graph' && !data.lineData) {
      return {
        success: false,
        error: 'Graph visualization requires lineData',
      };
    }

    if (visualization_type === 'stats' && !data.statData) {
      return {
        success: false,
        error: 'Stats visualization requires statData',
      };
    }

    const windowTitle = title || (
      visualization_type === 'chart' ? 'Data Analysis' : 
      visualization_type === 'graph' ? 'Trend Analysis' : 
      'Statistics'
    );
    
    const resultId = `window-${visualization_type}-${windowTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

    return {
      success: true,
      window_type: visualization_type,
      title: windowTitle,
      id: resultId,
      clientAction: {
        type: "ADD_DATA_WINDOW",
        params: {
          visualization_type: visualization_type,
          title: windowTitle,
          id: resultId,
          data
        }
      }
    };
  } catch (error) {
    console.error('Error in set_data_window:', error);
    return {
      success: false,
      error: 'Failed to set data window',
    };
  }
}

export async function get_top_selling_items(time_period: 'week' | 'month') {
  try {
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
    
    const formattedItems = topItems.map(item => ({
      name: item.name,
      count: item.count
    }));
    
    if (formattedItems.length > 0) {
      set_data_window('chart', `Top Selling Items (${time_period})`, {
        topItems: formattedItems,
        period: time_period,
        merchant: merchantName
      });
    }
    
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

export async function get_weekly_sales() {
  try {
    const { merchantId, merchantName } = await getCurrentMerchant();

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

    const lineData = weeklySales.map(item => ({
      name: new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(item.totalSales.toString())
    }));

    if (lineData.length > 0) {
      set_data_window('graph', `Weekly Sales Trends`, {
        lineData,
        merchant: merchantName
      });
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

export async function get_best_selling_day() {
  try {
    const { merchantId, merchantName } = await getCurrentMerchant();

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

    const date = new Date(bestDay);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const statData = [
      {
        label: 'Best Selling Day',
        value: date.toLocaleDateString('en-US', { weekday: 'long' })
      },
      {
        label: 'Date',
        value: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      },
      {
        label: 'Merchant',
        value: merchantName
      },
      {
        label: 'Performance',
        value: '↑ Higher Than Average'
      }
    ];

    set_data_window('stats', `Best Selling Day Analysis`, {
      statData,
      merchant: merchantName
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

export async function get_item_suggestions() {
  try {
    const { merchantId, merchantName } = await getCurrentMerchant();

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

export async function generate_description_and_image(item_name: string, cuisine_tag: string) {
  try {
    const prompt = getDescriptionAndImagePrompt(item_name, cuisine_tag);

    const response = await genAIClient.models.generateContent({
      model: MODEL_NAME_IMAGE_GENERATION,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No response received from Gemini API.');
    }

    let description = '';
    let imageData: string | null = null;
    let imageUrl: string | null = null;

    for (const part of response.candidates[0].content?.parts || []) {
      if (part.text) {
        if (!description) {
          description = part.text;
        }
      } else if (part.inlineData) {
        imageData = part.inlineData.data ?? null;
        
        if (imageData) {
          try {
            const isServer = typeof window === 'undefined';
            
            let apiUrl = '/api/images';
            if (isServer) {
              const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
                ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
                : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
              apiUrl = `${baseUrl}/api/images`;
            }

            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ imageData })
            });
            
            if (response.ok) {
              const result = await response.json();
              
              if (result.success) {
                imageUrl = result.url;
              }
            }
          } catch (storageError) {
            console.error("Error calling image storage API:", storageError);
          }
        }
      }
    }

    if (!description) {
      throw new Error('Failed to generate description.');
    }
    
    description = description
      .replace(/^\s*\*{1,2}description:?\*{1,2}\s*/i, '')
      .replace(/^\s*\*{1,2}image:?\*{1,2}.*/im, '')
      .replace(/^\s*\*{1,2}([^*]+)\*{1,2}\s*/g, '')
      .trim();

    return {
      success: true,
      item_name,
      cuisine_tag,
      description,
      imageData: null,
      imageUrl,
    };
  } catch (error) {
    console.error('Failed to generate description and image:', error);
    return {
      success: false,
      error: (error as Error).message || 'Unknown error occurred',
      description: null,
      imageUrl: null,
    };
  }
}

export function add_menu_item_window(
  item_name: string,
  cuisine_tag: string,
  description?: string,
  imageUrl?: string
) {
  try {
    if (!item_name || !cuisine_tag) {
      return {
        success: false,
        error: 'Item name and cuisine tag are required',
      };
    }

    const resultId = `menu-item-${item_name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
    
    return {
      success: true,
      item_name,
      cuisine_tag,
      description,
      imageUrl,
      id: resultId,
      clientAction: {
        type: "ADD_MENU_ITEM_WINDOW",
        params: {
          itemName: item_name,
          cuisineTag: cuisine_tag,
          description,
          imageUrl,
          id: resultId
        }
      }
    };
  } catch (error) {
    console.error('Error in add_menu_item_window:', error);
    return {
      success: false,
      error: 'Failed to create menu item window',
    };
  }
}

export async function create_menu_item(item_name: string, cuisine_tag: string) {
  try {
    const generationResult = await generate_description_and_image(item_name, cuisine_tag);
    if (!generationResult.success) {
      return {
        success: false,
        error: `Failed to generate description and image: ${generationResult.error}`,
      };
    }

    const windowResult = add_menu_item_window(
      item_name,
      cuisine_tag,
      generationResult.description || undefined,
      generationResult.imageUrl || undefined
    );

    return {
      success: true,
      item_name,
      cuisine_tag,
      description: generationResult.description,
      has_image: !!generationResult.imageUrl,
      window_id: windowResult.id,
      clientAction: windowResult.clientAction
    };
  } catch (error) {
    console.error('Error in create_menu_item workflow:', error);
    return {
      success: false,
      error: (error as Error).message || 'Unknown error occurred',
    };
  }
}


