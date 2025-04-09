import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

const getFunctionDeclarations = () => {
  return [
    {
      name: 'get_current_weather',
      description: 'Returns the current weather in a specified location',
      parameters: {
        type: Type.OBJECT,
        properties: {
          location: {
            type: Type.STRING,
            description: 'The location to get the weather for'
          },
          unit: {
            type: Type.STRING,
            enum: ['Celsius', 'Fahrenheit'],
            description: 'The unit of temperature'
          }
        },
        required: ['location']
      }
    },
  ];
}

const config = {
  tools: [{
    functionDeclarations: getFunctionDeclarations()
  }]
};

// Add this dummy weather function
function dummy_getCurrentWeather(location: string, unit: string = 'Celsius') {
  // This is a dummy implementation
  return {
    location,
    temperature: unit === 'Celsius' ? 22 : 72,
    unit: unit || 'Celsius',
    description: 'Sunny',
    humidity: '65%'
  };
}

async function generateGeminiResponse(userInput: string) {
  try {
    const genAI = new GoogleGenAI({apiKey: API_KEY});

    const contents = [
      {
        role: 'user',
        parts: [{ text: userInput }]
      }
    ];

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: config
    });

    console.log('Response:', response);

    // Find the function call part if it exists
    const functionCallPart = response.candidates?.[0]?.content?.parts?.find(
      part => part.functionCall
    );
    
    let functionResult = null;
    let finalResponse = response;
    
    if (functionCallPart?.functionCall) {
      const tool_call = functionCallPart.functionCall;
      
      if (tool_call.name === "get_current_weather" && tool_call.args) {
        functionResult = dummy_getCurrentWeather(tool_call.args.location as string, tool_call.args.unit as string);
        console.log(`Function execution result: ${JSON.stringify(functionResult)}`);
        
        // Create a function response part
        const function_response_part = {
          name: tool_call.name,
          response: { result: functionResult }
        };

        // Append function call and result of the function execution to contents
        contents.push({ role: 'model', parts: [{ 
          text: JSON.stringify(tool_call)
        }] });
        contents.push({ role: 'user', parts: [{ 
          text: JSON.stringify(function_response_part) 
        }] });

        // Get the final response from the model
        finalResponse = await genAI.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: contents,
          config: config
        });
        
        console.log("Final response after function call:", finalResponse.candidates?.[0]?.content?.parts);
      }
    }
    
    // Include the function result in the response
    const responseWithResult = finalResponse.candidates?.[0]?.content?.parts || [];
    
    // Extract the text from the parts
    let textResponse = "";
    if (Array.isArray(responseWithResult)) {
      for (const part of responseWithResult) {
        if (part.text) {
          textResponse += part.text;
        }
      }
    }

    return {
      type: 'text',
      message: textResponse,
      functionResult: functionResult,
      parts: responseWithResult
    };

  } catch (error) {
    console.error('Error generating response:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, merchantId } = await request.json();

    const aiResponse = await generateGeminiResponse(message);

    console.log('AI Response:', aiResponse);

    if (aiResponse) {
      const response = NextResponse.json({
        type: 'text', 
        message: aiResponse.message,
        functionResult: aiResponse.functionResult,
        timestamp: new Date().toISOString()
      });

      return response;
    }

    return NextResponse.json({
      type: 'text',
      message: `You asked: "${message}" - I'm not sure how to help with that.`,
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