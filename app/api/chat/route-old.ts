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

// Function implementations that return numbers only
const functionImplementations: Record<string, () => Record<string, any>> = {
  get_top_selling_items: () => {
    const items = ['Chicken Wings', 'Burgers', 'Fries', 'Pizza', 'Salads', 'Pasta', 'Tacos', 'Burritos', 'Ice Cream'];
    const indices: number[] = [];
    while (indices.length < 3) {
      const idx = Math.floor(Math.random() * items.length);
      if (!indices.includes(idx)) indices.push(idx);
    }
    return { item_indices: indices };
  },
  
  get_best_selling_day: () => {
    const bestDay = Math.floor(Math.random() * 7);
    let secondBestDay = Math.floor(Math.random() * 7);
    while (secondBestDay === bestDay) {
      secondBestDay = Math.floor(Math.random() * 7);
    }
    return { best_day: bestDay, second_best_day: secondBestDay };
  },
  
  get_top_order_cities: () => {
    const areaCount = 8;
    const indices: number[] = [];
    while (indices.length < 3) {
      const idx = Math.floor(Math.random() * areaCount);
      if (!indices.includes(idx)) indices.push(idx);
    }
    return { area_indices: indices };
  },
  
  get_popular_cuisine: () => {
    return { cuisine_index: Math.floor(Math.random() * 8) };
  },
  
  get_average_order_count: () => {
    return { average_count: Math.floor(Math.random() * 100) + 50 };
  },
  
  compare_with_similar_merchants: () => {
    return { percentage_difference: Math.floor(Math.random() * 30) - 10 };
  },
  
  get_promotion_times: () => {
    const startHour = Math.floor(Math.random() * 6) + 3;
    const duration = Math.floor(Math.random() * 3) + 1;
    return { start_hour: startHour, duration: duration };
  },
  
  get_selling_report: () => {
    return { 
      report_type: Math.floor(Math.random() * 2), 
      percentage_change: Math.floor(Math.random() * 20) - 5 
    };
  },
  
  get_slow_moving_items: () => {
    const itemCount = 7;
    let firstItem = Math.floor(Math.random() * itemCount);
    let secondItem = Math.floor(Math.random() * itemCount);
    while (secondItem === firstItem) {
      secondItem = Math.floor(Math.random() * itemCount);
    }
    return { item_indices: [firstItem, secondItem] };
  },
  
  get_alerts: () => {
    return { alert_type: Math.floor(Math.random() * 4) };
  },
  
  get_driver_arrival_time: () => {
    const minTime = Math.floor(Math.random() * 5) + 8;
    const maxTime = minTime + Math.floor(Math.random() * 7) + 3;
    return { min_time: minTime, max_time: maxTime };
  }
};

// Define function declarations for Gemini AI
const getFunctionDeclarations = (): FunctionDeclaration[] => {
  return [
    {
      name: "get_top_selling_items",
      description: "Returns the top selling items for the merchant",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "get_best_selling_day",
      description: "Returns the best selling day of the week for the merchant",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "get_top_order_cities",
      description: "Returns the top cities or areas where orders are coming from",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "get_popular_cuisine",
      description: "Returns the most popular cuisine type for the merchant",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "get_average_order_count",
      description: "Returns the average number of orders per day for the merchant",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "compare_with_similar_merchants",
      description: "Compares the merchant's performance with similar merchants in the area",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "get_promotion_times",
      description: "Suggests optimal times for running promotions based on order patterns",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "get_selling_report",
      description: "Returns a weekly or monthly selling report with performance insights",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "get_slow_moving_items",
      description: "Identifies items that are not selling well and might need attention",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "get_alerts",
      description: "Returns any alerts or problems that require merchant attention",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    },
    {
      name: "get_driver_arrival_time",
      description: "Returns information about typical driver arrival times",
      parameters: {
        type: Type.OBJECT,
        properties: {},
        required: []
      }
    }
  ];
};

async function generateGeminiResponse(userInput: string): Promise<string> {
  try {
    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY || ''});
    const functionDeclarations = getFunctionDeclarations();
    
    let contents = [
      {
        role: 'user',
        parts: [
          {
            text: `You are an assistant for a food delivery analytics system. Based on the user's question, call the appropriate function to get the information they need.
            
            User question: ${userInput}`
          }
        ]
      }
    ];
    
    const config = {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: functionDeclarations.map(fd => fd.name).filter((name): name is string => name !== undefined),
        }
      },
      tools: [{functionDeclarations: functionDeclarations}]
    };
    
    const initialResponse = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: config
    });
    
    console.log(initialResponse.functionCalls?.[0]); 
    
    // Handle function call response
    if (initialResponse.functionCalls && initialResponse.functionCalls.length > 0) {
      const functionCall = initialResponse.functionCalls[0];
      const functionName = functionCall.name;
      
      if (functionName && functionName in functionImplementations) {
        const functionResult = functionImplementations[functionName]();
        
        // Send function result back to the model
        const finalContent = [
          ...contents,
          {
            role: 'model',
            parts: [{ 
              functionResponse: {
                name: functionName,
                response: functionResult
              }
            }]
          }
        ];
        
        const finalResponse = await genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: finalContent
        });
        
        return finalResponse.text || "I'm not sure how to answer that.";
      }
    }
    
    return "I don't understand that question. Could you please rephrase it?";
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
    
    return NextResponse.json({ 
      text: `You asked: "${message}" - I'm not sure how to help with that.`,
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
