import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from "@/app/gemini/response-generator";
import { ConversationMessage } from "@/app/gemini/types";

export async function POST(request: NextRequest) {
  try {
    const { message, merchantId, language = 'en', history = [] } = await request.json();

    // Call the Gemini response generator with the language parameter
    const response = await generateGeminiResponse(message, history, language);

    if (!response) {
      return NextResponse.json({ 
        message: "Sorry, I couldn't process your request.",
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Send the complete response to the client, including functionResults and suggestedPrompts
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