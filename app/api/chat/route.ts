import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, merchantId } = await request.json();
    
    // For demonstration, we'll use a similar response system but via the API route
    const merchantSpecificResponses: Record<string, string[]> = {
      'merchant_1': [
        'Thank you for your question about Restaurant 1. How can I help you further?',
        'Restaurant 1 offers a variety of dishes. Would you like to see our menu?',
        'Our opening hours are 9am to 10pm every day of the week.'
      ],
      'merchant_2': [
        'Welcome to Tech Shop. How may I assist you today?',
        'Tech Shop has the latest gadgets in stock. Would you like to know about our offers?',
        'We offer a 2-year warranty on all our products at Tech Shop.'
      ],
      'merchant_3': [
        'Hello from Clothing Boutique! We appreciate your interest.',
        'All our clothes are made from sustainable materials.',
        'Thank you for choosing Restaurant. Would you like to hear about our chef\'s recommendations?'
      ]
    };

    const genericResponses = [
      `You asked: "${message}" - This is a response from our API route.`,
      "This response is coming from the API route based on your merchant data.",
      "In a real implementation, this would connect to a backend service or AI provider."
    ];

    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get merchant-specific responses or fall back to generic ones
    const responses = merchantSpecificResponses[merchantId] || genericResponses;
    const responseText = responses[Math.floor(Math.random() * responses.length)];
    
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
