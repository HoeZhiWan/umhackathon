import { GoogleGenAI } from "@google/genai";
import { ConversationMessage, GeminiResponse } from "./types";
import { dummy_getCurrentWeather, dummy_getWeatherForecast } from "./functions";
import { getGeminiConfig, MODEL_NAME } from "./config";

const API_KEY = process.env.GEMINI_API_KEY;

// Helper function to handle tool calls
async function handleToolCall(
  tool_call: any, 
  updatedHistory: ConversationMessage[],
  functionResults: any[],
  genAI: GoogleGenAI,
  config: any
) {
  let functionResult;
  
  // Execute the appropriate function based on tool_call name
  if (tool_call.name === "get_current_weather" && tool_call.args) {
    functionResult = dummy_getCurrentWeather(
      tool_call.args.location as string, 
      tool_call.args.unit as string
    );
    console.log(`Function execution result: ${JSON.stringify(functionResult)}`);
  } 
  else if (tool_call.name === "get_weather_forecast" && tool_call.args) {
    functionResult = dummy_getWeatherForecast(
      tool_call.args.location as string, 
      tool_call.args.days as number || 3, 
      tool_call.args.unit as string
    );
    console.log(`Forecast function execution result: ${JSON.stringify(functionResult)}`);
  }
  else {
    // Return null if it's an unrecognized function
    return { finalResponse: null, updatedHistory, functionCallPart: null };
  }
  
  // Add the function result to the array
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
  const finalResponse = await genAI.models.generateContent({
    model: MODEL_NAME,
    contents: updatedHistory,
    config: config
  });
  
  console.log(`Response after ${tool_call.name} call:`, finalResponse.candidates?.[0]?.content?.parts);
  
  // Find if there are more function calls
  const functionCallPart = finalResponse.candidates?.[0]?.content?.parts?.find(
    part => part.functionCall
  );
  
  return { finalResponse, updatedHistory, functionCallPart };
}

export async function generateGeminiResponse(userInput: string, conversationHistory: ConversationMessage[] = []): Promise<GeminiResponse | null> {
  try {
    const genAI = new GoogleGenAI({apiKey: API_KEY});
    const config = getGeminiConfig();

    // Create a new message for the current user input
    const newUserMessage: ConversationMessage = {
      role: 'user',
      parts: [{ text: userInput }]
    };
    
    // Combine existing conversation history with new user message
    const contents = [...conversationHistory, newUserMessage];

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: config
    });

    console.log('Response:', response);

    let functionResults: Array<any> = [];
    let finalResponse = response;
    let updatedHistory = [...contents]; // Start with existing history plus new user message
    
    // Process function calls (if any)
    let functionCallPart = response.candidates?.[0]?.content?.parts?.find(
      part => part.functionCall
    );
    
    // Loop to allow multiple function calls
    while (functionCallPart?.functionCall) {
      const result = await handleToolCall(
        functionCallPart.functionCall,
        updatedHistory,
        functionResults,
        genAI,
        config
      );
      
      if (!result.finalResponse) {
        break; // Unrecognized function
      }
      
      finalResponse = result.finalResponse;
      updatedHistory = result.updatedHistory;
      functionCallPart = result.functionCallPart;
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
