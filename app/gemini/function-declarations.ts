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
  ];
}
