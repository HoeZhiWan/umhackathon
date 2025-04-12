import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from "@/app/gemini/response-generator";
import { ConversationMessage } from "@/app/gemini/types";

export async function POST(request: NextRequest) {
  try {
    const { message, merchantId, language = 'en', history = [] } = await request.json();
    const response = await generateGeminiResponse(message, history, language);

    if (!response) {
      return NextResponse.json({ 
        message: "Sorry, I couldn't process your request.",
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      message: response.message,
      history: response.history,
      functionResults: response.functionResults,
      suggestedPrompts: response.suggestedPrompts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json({ 
      message: "An error occurred while processing your request.",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}