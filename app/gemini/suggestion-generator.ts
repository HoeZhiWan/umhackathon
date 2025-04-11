import { GoogleGenAI } from "@google/genai";
import { ConversationMessage } from "./types";
import { MODEL_NAME, getSuggestionConfig } from "./config";

// Generate suggested follow-up prompts
export async function generateSuggestions(
  conversation: ConversationMessage[],
  genAI: GoogleGenAI,
  apiKey: string | undefined,
  language: string = 'en'
): Promise<string[]> {
  try {
    // For new conversations or API issues, provide default suggestions
    if (!apiKey || conversation.length < 2) {
      return getDefaultSuggestions(language);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Filter conversation to just the last few exchanges for context
    const recentConversation = conversation.slice(-6); // Last 3 exchanges

    // Create a suggestion prompt in the appropriate language
    let promptText = "Based on our conversation, what are 3-4 specific follow-up questions I might want to ask about my business data?";
    
    // If not English, ask for responses in that language
    if (language !== 'en') {
      promptText += ` Please provide the suggestions in ${getLanguageName(language)} language.`;
    }

    const suggestionPrompt: ConversationMessage = {
      role: 'user',
      parts: [{ text: promptText }]
    };
    
    // Get suggestions from the model using our config (with function declarations as context, not tools)
    const config = getSuggestionConfig();
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [...recentConversation, suggestionPrompt],
      config: config
    });

    const suggestionsText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse suggestions - split by lines, filter empty lines, and clean up
    const suggestions = suggestionsText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^["-\s•*]+|["-\s]+$/g, '').trim()) // Remove quotes, dashes, etc.
      .filter(line => line.length > 0 && line.length <= 45) // Keep reasonable lengths
      .slice(0, 4); // Limit to max 4 suggestions
      
    return suggestions.length > 0 ? suggestions : getDefaultSuggestions(language);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return getDefaultSuggestions(language);
  }
}

// Get default suggestions based on starting a new conversation
function getDefaultSuggestions(language: string = 'en'): string[] {
  // Default suggestions in different languages
  const suggestions = {
    en: [
      "Suggest me a new menu item",
      "What are my best-selling items?",
      "Show me my sales data",
      "What is my best selling day?"
    ],
    ms: [
      "Cadangkan saya item menu baru",
      "Apakah makanan popular saya?",
      "Tunjukkan data jualan saya",
      "Apakah hari jualan terbaik saya?"
    ],
    zh: [
      "给我推荐一个新菜单项",
      "我最畅销的商品是什么？",
      "显示我的销售数据",
      "我最畅销的日子是什么？"
    ],
    ta: [
      "எனக்கு புதிய மெனு உருப்படியை பரிந்துரை செய்",
      "இந்த மாதம் எனது அதிகம் விற்பனையாகும் பொருட்கள் என்ன?",
      "எனது விற்பனை தரவுகளை காட்டுங்கள்",
      "என்னது எனது அதிக விற்பனை நாளாகும்?"
    ]
  };
  
  // Return suggestions in the requested language, fallback to English
  return suggestions[language as keyof typeof suggestions] || suggestions.en;
}

// Get suggestions for when merchant context changes
export function getMerchantSuggestions(merchantId: string, language: string = 'en'): string[] {
  // You could customize these based on merchantId in the future
  return getDefaultSuggestions(language);
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
