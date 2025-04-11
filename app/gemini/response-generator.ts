import { GoogleGenAI } from "@google/genai";
import { ConversationMessage, GeminiResponse } from "./types";
import { dummy_getCurrentWeather, dummy_getWeatherForecast, display_data_window, get_top_selling_items, switch_language, get_weekly_sales, get_best_selling_day, get_item_suggestions } from "./functions";
import { getGeminiConfig, MODEL_NAME } from "./config";
import { generateSuggestions } from "./suggestion-generator";

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
  else if (tool_call.name === "display_data_window" && tool_call.args) {
    functionResult = display_data_window(
      tool_call.args.visualization_type as 'chart' | 'graph' | 'stats',
      tool_call.args.title as string
    );
    console.log(`Display data window function execution result: ${JSON.stringify(functionResult)}`);
  }
  else if (tool_call.name === "get_top_selling_items" && tool_call.args) {
    functionResult = await get_top_selling_items(
      tool_call.args.time_period as 'week' | 'month'
    );
    console.log(`Top selling items function execution result: ${JSON.stringify(functionResult)}`);
  }
  else if (tool_call.name === "switch_language" && tool_call.args) {
    functionResult = switch_language(
      tool_call.args.language_code as string
    );
    console.log(`Language switch function execution result: ${JSON.stringify(functionResult)}`);
    
    // Update the language in the system instruction if switch was successful
    if (functionResult.success && config.systemInstruction && functionResult.language_code) {
      // Extract current language instruction if it exists
      const langInstructRegex = /\n\nPlease respond in .+ language\./;
      const hasLangInstruct = langInstructRegex.test(config.systemInstruction);
      
      if (hasLangInstruct) {
        // Replace existing language instruction
        config.systemInstruction = config.systemInstruction.replace(
          langInstructRegex,
          `\n\nPlease respond in ${getLanguageName(functionResult.language_code)} language.`
        );
      } else {
        // Add new language instruction
        config.systemInstruction = config.systemInstruction + 
          `\n\nPlease respond in ${getLanguageName(functionResult.language_code)} language.`;
      }
    }
  }
  else if (tool_call.name === "get_weekly_sales") {
    functionResult = await get_weekly_sales();
    console.log(`Weekly sales function execution result: ${JSON.stringify(functionResult)}`);
  }
  else if (tool_call.name === "get_best_selling_day") {
    functionResult = await get_best_selling_day();
    console.log(`Best selling day function execution result: ${JSON.stringify(functionResult)}`);
  }
  else if (tool_call.name === "get_item_suggestions") {
    functionResult = await get_item_suggestions();
    console.log(`Item suggestions function execution result: ${JSON.stringify(functionResult)}`);
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

export async function generateGeminiResponse(
  userInput: string, 
  conversationHistory: ConversationMessage[] = [], 
  language: string = 'en'
): Promise<GeminiResponse | null> {
  try {
    const genAI = new GoogleGenAI({apiKey: API_KEY});
    const config = getGeminiConfig();

    // Add language instruction if not English
    if (language !== 'en') {
      const languageNames: Record<string, string> = {
        'ms': 'Malay (Bahasa Melayu)',
        'zh': 'Chinese (中文)',
        'ta': 'Tamil (தமிழ்)'
      };
      
      const languageName = languageNames[language] || language;
      
      // Add language instruction to config
      config.systemInstruction = (config.systemInstruction || '') + 
        `\n\nPlease respond in ${languageName} language.`;
    }

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

    // Generate suggested follow-up prompts using the dedicated module
    const suggestedPrompts = await generateSuggestions(updatedHistory, genAI, API_KEY, language);

    return {
      type: 'text',
      message: textResponse,
      functionResults: functionResults.length > 0 ? functionResults : null,
      history: updatedHistory,
      suggestedPrompts: suggestedPrompts,
    };

  } catch (error) {
    console.error('Error generating response:', error);
    return null;
  }
}

// Helper function to get full language name from code
function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'ms': 'Malay',
    'zh': 'Chinese',
    'ta': 'Tamil'
  };
  
  return languages[code] || 'English';
}
