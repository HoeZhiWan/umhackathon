import { GoogleGenAI } from "@google/genai";
import { ConversationMessage, GeminiResponse } from "./types";
import { get_top_selling_items, switch_language, get_weekly_sales, get_best_selling_day, get_item_suggestions, set_data_window, generate_description_and_image, add_menu_item_window, create_menu_item } from "./functions";
import { getGeminiConfig, MODEL_NAME } from "./config";
import { generateSuggestions } from "./suggestion-generator";

const API_KEY = process.env.GEMINI_API_KEY;

async function handleToolCall(
  tool_call: any, 
  updatedHistory: ConversationMessage[],
  functionResults: any[],
  genAI: GoogleGenAI,
  config: any
) {
  let functionResult;
  
  if (tool_call.name === "set_data_window" && tool_call.args) {
    functionResult = set_data_window(
      tool_call.args.visualization_type as 'chart' | 'graph' | 'stats',
      tool_call.args.title as string,
      tool_call.args.data
    );
  }
  else if (tool_call.name === "get_top_selling_items" && tool_call.args) {
    functionResult = await get_top_selling_items(
      tool_call.args.time_period as 'week' | 'month'
    );
  }
  else if (tool_call.name === "switch_language" && tool_call.args) {
    functionResult = switch_language(
      tool_call.args.language_code as string
    );
    
    if (functionResult.success && config.systemInstruction && functionResult.language_code) {
      const langInstructRegex = /\n\nPlease respond in .+ language\./;
      const hasLangInstruct = langInstructRegex.test(config.systemInstruction);
      
      if (hasLangInstruct) {
        config.systemInstruction = config.systemInstruction.replace(
          langInstructRegex,
          `\n\nPlease respond in ${getLanguageName(functionResult.language_code)} language.`
        );
      } else {
        config.systemInstruction = config.systemInstruction + 
          `\n\nPlease respond in ${getLanguageName(functionResult.language_code)} language.`;
      }
    }
  }
  else if (tool_call.name === "get_weekly_sales") {
    functionResult = await get_weekly_sales();
  }
  else if (tool_call.name === "get_best_selling_day") {
    functionResult = await get_best_selling_day();
  }
  else if (tool_call.name === "get_item_suggestions") {
    functionResult = await get_item_suggestions();
  }
  else if (tool_call.name === "generate_description_and_image" && tool_call.args) {
    const { storeImageFromGemini } = await import('../lib/supabase-storage');
    
    functionResult = await generate_description_and_image(
      tool_call.args.item_name as string,
      tool_call.args.cuisine_tag as string
    );
  }
  else if (tool_call.name === "add_menu_item_window" && tool_call.args) {
    functionResult = add_menu_item_window(
      tool_call.args.item_name as string,
      tool_call.args.cuisine_tag as string,
      tool_call.args.description as string,
      tool_call.args.imageData as string
    );
  }
  else if (tool_call.name === "create_menu_item" && tool_call.args) {
    functionResult = await create_menu_item(
      tool_call.args.item_name as string,
      tool_call.args.cuisine_tag as string
    );
  }
  else {
    return { finalResponse: null, updatedHistory, functionCallPart: null };
  }
  
  functionResults.push(functionResult);
  
  const function_response_part = {
    name: tool_call.name,
    response: { result: functionResult }
  };

  const modelFunctionCallMessage = { 
    role: 'model', 
    parts: [{ functionCall: tool_call }] 
  };
  
  const userFunctionResponseMessage = { 
    role: 'user', 
    parts: [{ functionResponse: function_response_part }] 
  };

  updatedHistory.push(modelFunctionCallMessage);
  updatedHistory.push(userFunctionResponseMessage);

  const finalResponse = await genAI.models.generateContent({
    model: MODEL_NAME,
    contents: updatedHistory,
    config: config
  });
  
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

    if (language !== 'en') {
      const languageNames: Record<string, string> = {
        'ms': 'Malay (Bahasa Melayu)',
        'zh': 'Chinese (中文)',
        'ta': 'Tamil (தமிழ்)'
      };
      
      const languageName = languageNames[language] || language;
      
      config.systemInstruction = (config.systemInstruction || '') + 
        `\n\nPlease respond in ${languageName} language.`;
    }

    const newUserMessage: ConversationMessage = {
      role: 'user',
      parts: [{ text: userInput }]
    };
    
    const contents = [...conversationHistory, newUserMessage];

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: config
    });

    let functionResults: Array<any> = [];
    let finalResponse = response;
    let updatedHistory = [...contents];
    
    let functionCallPart = response.candidates?.[0]?.content?.parts?.find(
      part => part.functionCall
    );
    
    while (functionCallPart?.functionCall) {
      const result = await handleToolCall(
        functionCallPart.functionCall,
        updatedHistory,
        functionResults,
        genAI,
        config
      );
      
      if (!result.finalResponse) {
        break;
      }
      
      finalResponse = result.finalResponse;
      updatedHistory = result.updatedHistory;
      functionCallPart = result.functionCallPart;
    }
    
    const responseWithResult = finalResponse.candidates?.[0]?.content?.parts || [];
    const textResponseParts = responseWithResult.filter(part => !part.functionCall);
    
    let textResponse = "";
    if (Array.isArray(textResponseParts)) {
      for (const part of textResponseParts) {
        if (part.text) {
          textResponse += part.text;
        }
      }
    }

    const modelResponseMessage = {
      role: 'model',
      parts: textResponseParts.map(part => ({
        text: part.text || JSON.stringify(part)
      }))
    };
    updatedHistory.push(modelResponseMessage);

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

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    'en': 'English',
    'ms': 'Malay',
    'zh': 'Chinese',
    'ta': 'Tamil'
  };
  
  return languages[code] || 'English';
}
