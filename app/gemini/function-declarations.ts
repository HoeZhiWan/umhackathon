import { FunctionDeclaration, Type } from "@google/genai";

export const getFunctionDeclarations = (): FunctionDeclaration[] => {
  return [
    {
      name: 'get_current_weather',
      description: 'Returns the current weather in a specified location',
      parameters: {
        type: Type.OBJECT,
        properties: {
          location: {
            type: Type.STRING,
            description: 'The location to get the weather for'
          },
          unit: {
            type: Type.STRING,
            enum: ['Celsius', 'Fahrenheit'],
            description: 'The unit of temperature'
          }
        },
        required: ['location']
      }
    },
    {
      name: 'get_weather_forecast',
      description: 'Returns a weather forecast for the next few days in a specified location',
      parameters: {
        type: Type.OBJECT,
        properties: {
          location: {
            type: Type.STRING,
            description: 'The location to get the forecast for'
          },
          days: {
            type: Type.INTEGER,
            description: 'Number of days to forecast (1-7)',
            minimum: 1,
            maximum: 7
          },
          unit: {
            type: Type.STRING,
            enum: ['Celsius', 'Fahrenheit'],
            description: 'The unit of temperature'
          }
        },
        required: ['location']
      }
    },
    {
      name: 'display_data_window',
      description: 'Displays a data visualization window in the interface. Use this when you want to show charts, graphs, or statistics to the user.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          visualization_type: {
            type: Type.STRING,
            enum: ['chart', 'graph', 'stats'],
            description: 'The type of visualization to display'
          },
          title: {
            type: Type.STRING,
            description: 'Title for the visualization window (optional)'
          }
        },
        required: ['visualization_type']
      }
    },
    {
      name: 'get_top_selling_items',
      description: 'Returns the top selling item for a merchant during a specific time period',
      parameters: {
        type: Type.OBJECT,
        properties: {
          time_period: {
            type: Type.STRING,
            enum: ['week', 'month'],
            description: 'The time period to analyze: week (last 7 days) or month (last 30 days)'
          }
        },
        required: ['time_period']
      }
    },
    {
      name: 'get_best_selling_day',
      description: 'Returns the best selling day for a merchant based on total order value',
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: 'get_weekly_sales',
      description: 'Returns sales data aggregated by week for a merchant',
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: 'get_item_suggestions',
      description: 'Suggests potential items to sell based on the merchant\'s cuisine types and trending keywords',
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: 'switch_language',
      description: 'Automatically switches the user interface language when detecting the user is speaking a different language. Call this function directly without asking for user confirmation when you detect the user is using a language different from the current one.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          language_code: {
            type: Type.STRING,
            enum: ['en', 'ms', 'zh', 'ta'],
            description: 'The language code to switch to: en (English), ms (Bahasa Melayu), zh (Chinese), ta (Tamil)'
          }
        },
        required: ['language_code']
      }
    },
  ];
}
