import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from "@/app/gemini/response-generator";
import { ConversationMessage } from "@/app/gemini/types";

export async function POST(request: NextRequest) {
  try {
    const { message, merchantId, history = [] } = await request.json();

    const aiResponse = await generateGeminiResponse(message, history as ConversationMessage[]);

    console.log('AI Response:', aiResponse);

    if (aiResponse) {
      return NextResponse.json({
        type: 'text', 
        message: aiResponse.message,
        functionResults: aiResponse.functionResults,
        history: aiResponse.history,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      type: 'text',
      message: `You asked: "${message}" - I'm not sure how to help with that.`,
      history: [...history, { role: 'user', parts: [{ text: message }] }],
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