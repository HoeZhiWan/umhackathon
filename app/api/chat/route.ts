import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, FunctionCallingConfigMode, FunctionDeclaration, Type } from '@google/genai';

// Predefined questions mapping
const PREDEFINED_QUESTIONS: Record<string, string> = {
  "top selling": "get_top_selling_items",
  "best-selling day": "get_best_selling_day",
  "cities do most": "get_top_order_cities",
  "cuisine type is the most popular": "get_popular_cuisine",
  "average order count": "get_average_order_count",
  "compare to similar merchants": "compare_with_similar_merchants",
  "time should i promote": "get_promotion_times",
  "show me my weekly": "get_selling_report",
  "show me my monthly": "get_selling_report",
  "slowest moving items": "get_slow_moving_items",
  "alerts or problems": "get_alerts",
  "how long does it usually take": "get_driver_arrival_time",
};

// Mock response data for each function
const functionResponses: Record<string, string> = {
  'get_top_selling_items': 'Your top selling items are Chicken Wings, Burgers, and Fries.',
  'get_best_selling_day': 'Your best-selling day is Friday, followed by Saturday.',
  'get_top_order_cities': 'Most of your orders come from Downtown, Midtown, and Uptown areas.',
  'get_popular_cuisine': 'American cuisine is your most popular cuisine type.',
  'get_average_order_count': 'You receive an average of 75 orders per day.',
  'compare_with_similar_merchants': 'Your sales are 15% higher than similar merchants in your area.',
  'get_promotion_times': 'The best time for promotions is between 5PM and 7PM on weekdays.',
  'get_selling_report': 'Your weekly sales show a 10% increase compared to last week.',
  'get_slow_moving_items': 'Your slowest moving items are Salads and Vegetarian options.',
  'get_alerts': 'There are no critical alerts at this time.',
  'get_driver_arrival_time': 'Drivers usually take 12-15 minutes to arrive at your location.',
  'no_match_found': 'I don\'t understand that question. Could you please rephrase it?'
};

async function generateGeminiResponse(userInput: string): Promise<string> {
  try {
    // Initialize the Gemini AI client
    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY || ''});
    
    // Define the function declaration for question intent matching
    const matchQuestionDeclaration: FunctionDeclaration = {
      name: 'matchQuestion',
      parameters: {
        type: Type.OBJECT,
        description: 'Match user question to a predefined function',
        properties: {
          functionName: {
            type: Type.STRING,
            description: 'The function name that matches the user intent from predefined questions, or "no_match_found" if no match',
            enum: [...Object.values(PREDEFINED_QUESTIONS), 'no_match_found']
          }
        },
        required: ['functionName'],
      },
    };
    
    // Generate content with function calling
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an assistant for a food delivery analytics system. Your job is to:
1. Look at the user's question
2. Compare it against the predefined questions I've given you
3. Identify which predefined question pattern matches the user's intent best
4. Return the function name that corresponds to the matching predefined question
5. If no match is found, respond with "no_match_found"

User question: ${userInput}

Predefined questions and their functions: ${JSON.stringify(PREDEFINED_QUESTIONS)}`
            }
          ]
        }
      ],
      config: {
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: ['matchQuestion'],
          }
        },
        tools: [{functionDeclarations: [matchQuestionDeclaration]}]
      }
    });
    
    // Process the function call response
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionCall = response.functionCalls[0];
      const functionArgs = functionCall.args;
      
      if (functionArgs && 'functionName' in functionArgs) {
        const functionName = functionArgs.functionName as string;
        
        // Return the corresponding response for the function
        return functionResponses[functionName] || functionResponses['no_match_found'];
      }
    }
    
    return functionResponses['no_match_found'];
  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    return 'Sorry, I encountered an error processing your request.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, merchantId } = await request.json();

    const aiResponse = await generateGeminiResponse(message);
    
    if (aiResponse) {
      return NextResponse.json({ 
        text: aiResponse,
        timestamp: new Date().toISOString()
      });
    }

    console.log(aiResponse);
    
    // Fall back to the original logic if Gemini doesn't provide a response
    const genericResponses = [
      `You asked: "${message}" - This is a response from our API route.`,
      "This response is coming from the API route based on your merchant data.",
      "In a real implementation, this would connect to a backend service or AI provider."
    ];
    
    const responseText = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    
    return NextResponse.json({ 
      text: responseText,
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
