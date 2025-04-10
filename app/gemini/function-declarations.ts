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
  ];
}
