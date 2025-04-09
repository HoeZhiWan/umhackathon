import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

// Add system instructions for Gemini
const SYSTEM_INSTRUCTION = `You are a helpful assistant with access to functions.
You can call functions multiple times to gather all the information you need before answering.
When you have enough information, provide a comprehensive answer based on all function results.
Do not include raw function call details in your responses to the user.`;

const getFunctionDeclarations = (): FunctionDeclaration[] => {
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

const config = {
  systemInstruction: SYSTEM_INSTRUCTION,
  tools: [
    {
      functionDeclarations: getFunctionDeclarations()
    }
  ]
};

// Add this dummy weather function
function dummy_getCurrentWeather(location: string, unit: string = 'Celsius') {
  // This is a dummy implementation
  return {
    location,
    temperature: unit === 'Celsius' ? 22 : 72,
    unit: unit || 'Celsius',
    description: 'Sunny',
    humidity: '65%'
  };
}

// Add new dummy forecast function
function dummy_getWeatherForecast(location: string, days: number = 3, unit: string = 'Celsius') {
  // Generate fake forecast data for the specified number of days
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

// Define types for conversation messages
interface TextPart {
  text: string;
}

interface FunctionCallPart {
  functionCall: any;
}

interface FunctionResponsePart {
  functionResponse: any;
}

type MessagePart = TextPart | FunctionCallPart | FunctionResponsePart;

interface ConversationMessage {
  role: string;
  parts: MessagePart[];
}

async function generateGeminiResponse(userInput: string, conversationHistory: ConversationMessage[] = []) {
  try {
    const genAI = new GoogleGenAI({apiKey: API_KEY});

    // Create a new message for the current user input
    const newUserMessage: ConversationMessage = {
      role: 'user',
      parts: [{ text: userInput }]
    };
    
    // Combine existing conversation history with new user message
    const contents = [...conversationHistory, newUserMessage];

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: config
    });

    console.log('Response:', response);

    let functionResults = [];
    let finalResponse = response;
    let updatedHistory = [...contents]; // Start with existing history plus new user message
    
    // Process function calls (if any)
    let functionCallPart = response.candidates?.[0]?.content?.parts?.find(
      part => part.functionCall
    );
    
    // Loop to allow multiple function calls
    while (functionCallPart?.functionCall) {
      const tool_call = functionCallPart.functionCall;
      
      if (tool_call.name === "get_current_weather" && tool_call.args) {
        const functionResult = dummy_getCurrentWeather(tool_call.args.location as string, tool_call.args.unit as string);
        console.log(`Function execution result: ${JSON.stringify(functionResult)}`);
        functionResults.push(functionResult);
        
        // Create a function response part
        const function_response_part = {
          name: tool_call.name,
          response: { result: functionResult }
        };

        // Model message with the function call
        const modelFunctionCallMessage = { 
          role: 'model', 
          parts: [{ functionCall: tool_call }] 
        };
        
        // User message with function response
        const userFunctionResponseMessage = { 
          role: 'user', 
          parts: [{ functionResponse: function_response_part }] 
        };

        // Add these to the conversation
        updatedHistory.push(modelFunctionCallMessage);
        updatedHistory.push(userFunctionResponseMessage);

        // Get the next response from the model
        finalResponse = await genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: updatedHistory,
          config: config
        });
        
        console.log("Response after function call:", finalResponse.candidates?.[0]?.content?.parts);
        
        // Check if there are more function calls
        functionCallPart = finalResponse.candidates?.[0]?.content?.parts?.find(
          part => part.functionCall
        );
      } 
      else if (tool_call.name === "get_weather_forecast" && tool_call.args) {
        const functionResult = dummy_getWeatherForecast(
          tool_call.args.location as string, 
          tool_call.args.days as number || 3, 
          tool_call.args.unit as string
        );
        console.log(`Forecast function execution result: ${JSON.stringify(functionResult)}`);
        functionResults.push(functionResult);
        
        // Create a function response part
        const function_response_part = {
          name: tool_call.name,
          response: { result: functionResult }
        };

        // Model message with the function call
        const modelFunctionCallMessage = { 
          role: 'model', 
          parts: [{ functionCall: tool_call }] 
        };
        
        // User message with function response
        const userFunctionResponseMessage = { 
          role: 'user', 
          parts: [{ functionResponse: function_response_part }] 
        };

        // Add these to the conversation
        updatedHistory.push(modelFunctionCallMessage);
        updatedHistory.push(userFunctionResponseMessage);

        // Get the next response from the model
        finalResponse = await genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: updatedHistory,
          config: config
        });
        
        console.log("Response after forecast function call:", finalResponse.candidates?.[0]?.content?.parts);
        
        // Check if there are more function calls
        functionCallPart = finalResponse.candidates?.[0]?.content?.parts?.find(
          part => part.functionCall
        );
      } else {
        // Break if it's a function call we don't recognize
        break;
      }
    }
    
    // Extract final text response (without function calls)
    const responseWithResult = finalResponse.candidates?.[0]?.content?.parts || [];
    
    // Filter out any function calls from the final response parts
    const textResponseParts = responseWithResult.filter(part => !part.functionCall);
    
    // Extract the text from the parts
    let textResponse = "";
    if (Array.isArray(textResponseParts)) {
      for (const part of textResponseParts) {
        if (part.text) {
          textResponse += part.text;
        }
      }
    }

    // Add the model's final response to history
    const modelResponseMessage = {
      role: 'model',
      parts: textResponseParts.map(part => ({
        text: part.text || JSON.stringify(part)
      }))
    };
    updatedHistory.push(modelResponseMessage);

    return {
      type: 'text',
      message: textResponse,
      functionResults: functionResults.length > 0 ? functionResults : null,
      history: updatedHistory // Return the updated conversation history
    };

  } catch (error) {
    console.error('Error generating response:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, merchantId, history = [] } = await request.json();

    const aiResponse = await generateGeminiResponse(message, history);

    console.log('AI Response:', aiResponse);

    if (aiResponse) {
      const response = NextResponse.json({
        type: 'text', 
        message: aiResponse.message,
        functionResults: aiResponse.functionResults,
        history: aiResponse.history, // Send the updated history back to the client
        timestamp: new Date().toISOString()
      });

      return response;
    }

    return NextResponse.json({
      type: 'text',
      message: `You asked: "${message}" - I'm not sure how to help with that.`,
      history: [...history, { role: 'user', parts: [{ text: message }] }], // Include at least the user message
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}