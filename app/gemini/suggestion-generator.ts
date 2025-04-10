import { GoogleGenAI } from "@google/genai";
import { ConversationMessage } from "./types";
import { MODEL_NAME } from "./config";
import { SUGGESTION_SYSTEM_INSTRUCTION } from "./config";

// Generate suggested follow-up prompts
export async function generateSuggestions(
  conversation: ConversationMessage[],
  genAI: GoogleGenAI,
  apiKey: string | undefined
): Promise<string[]> {
  try {
    // For new conversations or API issues, provide default suggestions
    if (!apiKey || conversation.length < 2) {
      return getDefaultSuggestions();
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Filter conversation to just the last few exchanges for context
    const recentConversation = conversation.slice(-6); // Last 3 exchanges

    const suggestionPrompt: ConversationMessage = {
      role: 'user',
      parts: [{
        text: "Based on our conversation, what are 3-4 specific follow-up questions I might want to ask about my business data?"
      }]
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
      
    return suggestions.length > 0 ? suggestions : getDefaultSuggestions();
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return getDefaultSuggestions();
  }
}

// Get default suggestions based on starting a new conversation
function getDefaultSuggestions(): string[] {
  return [
    "Show me this month's sales trends",
    "What are my best-selling items this month?",
    "How do I compare to similar merchants?",
    "Any issues I should address?"
  ];
}

// Get suggestions for when merchant context changes
export function getMerchantSuggestions(merchantId: string): string[] {
  // You could customize these based on merchantId in the future
  return [
    "Show my sales overview",
    "What are my best-selling items this month?",
    "How do I compare to similar merchants?",
    "Any issues to address?"
  ];
}
