import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Input validation
function validateTripPlannerRequest(data: any): { valid: boolean; error?: string } {
  if (!data.destination || typeof data.destination !== 'string') {
    return { valid: false, error: 'destination is required' };
  }
  
  if (data.destination.length > 200) {
    return { valid: false, error: 'destination exceeds maximum length' };
  }
  
  if (!data.startDate || !data.endDate) {
    return { valid: false, error: 'startDate and endDate are required' };
  }
  
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (endDate <= startDate) {
    return { valid: false, error: 'endDate must be after startDate' };
  }
  
  if (data.budget && (typeof data.budget !== 'number' || data.budget < 0)) {
    return { valid: false, error: 'budget must be a positive number' };
  }
  
  if (data.travelers && (typeof data.travelers !== 'number' || data.travelers < 1 || data.travelers > 50)) {
    return { valid: false, error: 'travelers must be between 1 and 50' };
  }
  
  return { valid: true };
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

    // Parse and validate request
    const requestBody = await req.json();
    const validation = validateTripPlannerRequest(requestBody);
    
    if (!validation.valid) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid trip planning request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { 
      destination, 
      startDate, 
      endDate, 
      budget, 
      travelStyle, 
      travelers = 1,
      preferences,
      conversationHistory 
    } = requestBody;

    console.log('AI Trip Planning request:', { destination, startDate, endDate, budget, travelStyle });

    // Build the AI prompt based on user inputs
    const systemPrompt = `You are JourneyXWave's AI travel assistant. Create detailed, personalized trip itineraries based on user preferences. 

    Always respond with a JSON structure containing:
    - title: A catchy trip title
    - summary: Brief overview of the trip
    - daily_itinerary: Array of daily plans with activities, times, locations, and estimated costs
    - total_estimated_cost: Overall budget breakdown
    - travel_tips: Helpful advice for the destination
    - packing_suggestions: Essential items to pack
    - best_season: When to visit
    - local_cuisine: Must-try dishes
    - safety_tips: Important safety information

    Be specific, practical, and consider local culture, weather, and logistics.`;

    const userPrompt = `Plan a ${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} day trip to ${destination} from ${startDate} to ${endDate}.

    Details:
    - Budget: ₹${budget || 'Not specified'}
    - Travel style: ${travelStyle || 'Moderate'}
    - Number of travelers: ${travelers || 1}
    - Preferences: ${preferences || 'None specified'}

    ${conversationHistory ? `Previous conversation: ${conversationHistory}` : ''}

    Please create a comprehensive itinerary with daily activities, estimated costs, and practical travel advice.`;

    // Create conversation history for context
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    console.log('Sending request to OpenAI...');

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
        max_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('AI service error');
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const aiResponse = JSON.parse(data.choices[0].message.content);

    // Save the generated itinerary if trip data is provided
    if (destination && startDate && endDate) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      // Get user from auth header
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: { user }, error: authError } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );

        if (user && !authError) {
          console.log('Saving generated itinerary for user:', user.id);
          
          // Create trip with AI-generated itinerary
          const { error: tripError } = await supabase
            .from('trips')
            .insert([{
              user_id: user.id,
              title: aiResponse.title || `Trip to ${destination}`,
              destination: destination,
              start_date: startDate,
              end_date: endDate,
              budget: budget ? parseFloat(budget) : null,
              status: 'planning',
              ai_generated_itinerary: aiResponse,
              notes: `Generated by AI • ${travelers} travelers • ${travelStyle} style`
            }]);

          if (tripError) {
            console.error('Error saving trip:', tripError);
          } else {
            console.log('Trip saved successfully');
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        itinerary: aiResponse,
        generatedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    // Log detailed error server-side
    console.error('Error in ai-trip-planner:', error);
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Unable to generate trip plan. Please try again.',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});