import { GoogleGenAI } from "@google/genai";
import { ConversationMessage } from "./types";
import { MODEL_NAME } from "./config";
import { SUGGESTION_SYSTEM_INSTRUCTION } from "./config";

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
    
    // Get suggestions from the model
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [...recentConversation, suggestionPrompt],
      config: {
        temperature: 0.7,
        maxOutputTokens: 150,
        systemInstruction: SUGGESTION_SYSTEM_INSTRUCTION
      },
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
      "Show me this month's sales trends",
      "What are my best-selling items this month?",
      "How do I compare to similar merchants?",
      "Any issues I should address?"
    ],
    ms: [
      "Tunjukkan trend jualan bulan ini",
      "Apakah makanan popular saya bulan ini?",
      "Bagaimanakah prestasi saya berbanding peniaga serupa?",
      "Adakah isu yang perlu saya tangani?"
    ],
    zh: [
      "显示本月销售趋势",
      "这个月我最畅销的商品是什么？",
      "我与类似商家相比如何？",
      "有什么问题需要解决？"
    ],
    ta: [
      "இந்த மாத விற்பனை போக்குகளைக் காட்டு",
      "இந்த மாதம் எனது அதிகம் விற்பனையாகும் பொருட்கள் என்ன?",
      "ஒத்த வணிகர்களுடன் நான் எவ்வாறு ஒப்பிடுகிறேன்?",
      "நான் கவனிக்க வேண்டிய பிரச்சினைகள் உள்ளதா?"
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
