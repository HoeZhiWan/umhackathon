import { GoogleGenAI } from "@google/genai";
import { ConversationMessage } from "./types";
import { MODEL_NAME, getSuggestionConfig } from "./config";

export async function generateSuggestions(
  conversation: ConversationMessage[],
  genAI: GoogleGenAI,
  apiKey: string | undefined,
  language: string = 'en'
): Promise<string[]> {
  try {
    if (!apiKey || conversation.length < 2) {
      return getDefaultSuggestions(language);
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const recentConversation = conversation.slice(-6);

    let promptText = "Based on our conversation, what are 3-4 specific follow-up questions I might want to ask about my business data?";
    
    if (language !== 'en') {
      promptText += ` Please provide the suggestions in ${getLanguageName(language)} language.`;
    }

    const suggestionPrompt: ConversationMessage = {
      role: 'user',
      parts: [{ text: promptText }]
    };
    
    const config = getSuggestionConfig();
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [...recentConversation, suggestionPrompt],
      config: config
    });

    const suggestionsText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const suggestions = suggestionsText
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^["-\s•*]+|["-\s]+$/g, '').trim())
      .filter(line => line.length > 0 && line.length <= 45)
      .slice(0, 4);
      
    return suggestions.length > 0 ? suggestions : getDefaultSuggestions(language);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return getDefaultSuggestions(language);
  }
}

function getDefaultSuggestions(language: string = 'en'): string[] {
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
  
  return suggestions[language as keyof typeof suggestions] || suggestions.en;
}

export function getMerchantSuggestions(merchantId: string, language: string = 'en'): string[] {
  return getDefaultSuggestions(language);
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
