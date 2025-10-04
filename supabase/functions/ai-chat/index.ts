import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Input validation schema
interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  userContext?: any;
}

function validateChatRequest(data: any): { valid: boolean; error?: string; data?: ChatRequest } {
  if (!data.message || typeof data.message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string' };
  }
  
  if (data.message.length > 5000) {
    return { valid: false, error: 'Message exceeds maximum length of 5000 characters' };
  }
  
  if (data.conversationHistory && !Array.isArray(data.conversationHistory)) {
    return { valid: false, error: 'Conversation history must be an array' };
  }
  
  if (data.conversationHistory && data.conversationHistory.length > 50) {
    return { valid: false, error: 'Conversation history exceeds maximum of 50 messages' };
  }
  
  return { valid: true, data: data as ChatRequest };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Parse and validate request body
    const requestBody = await req.json();
    const validation = validateChatRequest(requestBody);
    
    if (!validation.valid) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { message, conversationHistory = [], userContext } = validation.data!;

    console.log('AI Chat request:', { messageLength: message.length, hasHistory: !!conversationHistory });

    // Build comprehensive system prompt for travel assistant
    const systemPrompt = `You are JourneyXWave's AI travel assistant, an expert in travel planning, navigation, booking assistance, and emergency support.

    Your capabilities include:
    - Creating personalized travel itineraries and recommendations
    - Providing real-time travel advice, weather updates, and local insights
    - Helping with booking flights, trains, buses, and hotels
    - Offering navigation assistance and offline map guidance
    - Providing safety tips and emergency preparedness advice
    - Answering questions about visa requirements, local customs, and travel regulations
    - Suggesting activities, restaurants, and attractions based on preferences
    - Helping with travel document management and organization

    User Context: ${userContext ? JSON.stringify(userContext) : 'No additional context provided'}

    Always be helpful, accurate, and prioritize user safety. If asked about emergency situations, provide immediate actionable advice and remind users of the SOS feature in the app.

    Keep responses concise but comprehensive, and suggest relevant app features when appropriate.`;

    // Build conversation context
    let messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages = [...messages, ...conversationHistory];
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    console.log('Sending request to OpenAI with', messages.length, 'messages');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('OpenAI service error');
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    const aiResponse = data.choices[0].message.content;

    // Save conversation to database if user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );

        if (user && !authError) {
          // Could save chat history here if needed
          console.log('Authenticated user chat:', user.id);
        }
      } catch (authErr) {
        console.log('No authentication provided, continuing without user context');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString(),
        model: 'gpt-4o-mini'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    // Log detailed error server-side
    console.error('Error in ai-chat function:', error);
    
    // Return generic error to client to avoid exposing internals
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Unable to process chat request. Please try again.',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});