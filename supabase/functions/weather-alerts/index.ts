import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Input validation
function validateCoordinates(lat: any, lng: any): { valid: boolean; error?: string } {
  if (typeof lat !== 'number' || lat < -90 || lat > 90) {
    return { valid: false, error: 'Invalid latitude (must be -90 to 90)' };
  }
  
  if (typeof lng !== 'number' || lng < -180 || lng > 180) {
    return { valid: false, error: 'Invalid longitude (must be -180 to 180)' };
  }
  
  return { valid: true };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Weather alerts action: ${action}`);

    switch (action) {
      case 'get_weather_alerts':
        return await getWeatherAlerts(data, supabase);
      case 'send_weather_notification':
        return await sendWeatherNotification(data, supabase);
      case 'update_travel_recommendations':
        return await updateTravelRecommendations(data, supabase);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    // Log detailed error server-side
    console.error('Error in weather-alerts function:', error);
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Unable to process weather alerts. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getWeatherAlerts(data: any, supabase: any) {
  const { latitude, longitude, userId } = data;

  // Validate coordinates
  const validation = validateCoordinates(latitude, longitude);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Mock weather data - in production, integrate with OpenWeatherMap or similar
  const weatherAlerts = [
    {
      id: 'alert-1',
      type: 'severe_weather',
      severity: 'high',
      title: 'Heavy Rain Warning',
      description: 'Heavy rainfall expected in your area with potential flooding',
      start_time: new Date(Date.now() + 3600000).toISOString(),
      end_time: new Date(Date.now() + 14400000).toISOString(),
      affected_areas: ['Current Location', 'Surrounding Areas'],
      instructions: [
        'Avoid low-lying areas prone to flooding',
        'Consider postponing outdoor activities',
        'Keep emergency supplies accessible'
      ],
      impact_level: 'moderate_to_high',
      coordinates: { lat: latitude, lng: longitude }
    }
  ];

  // If user is provided, get their active trips for context
  let activeTrips = [];
  if (userId) {
    const { data: trips } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['confirmed', 'ongoing'])
      .gte('end_date', new Date().toISOString().split('T')[0]);

    activeTrips = trips || [];
  }

  return new Response(
    JSON.stringify({
      success: true,
      alerts: weatherAlerts,
      active_trips: activeTrips,
      location: { latitude, longitude },
      last_updated: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function sendWeatherNotification(data: any, supabase: any) {
  const { userId, alertId, alertData } = data;

  if (!userId || !alertId) {
    throw new Error('Missing required fields');
  }

  // Create notification record
  const { error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      type: 'weather',
      title: alertData?.title || 'Weather Alert',
      message: alertData?.description || 'Weather conditions may affect your travel',
      priority: alertData?.severity === 'high' ? 'high' : 'normal',
      related_id: alertId
    }]);

  if (error) {
    throw new Error('Database error');
  }

  console.log(`Weather notification sent to user ${userId} for alert ${alertId}`);

  return new Response(
    JSON.stringify({
      success: true,
      notification_sent: true,
      alert_id: alertId,
      user_id: userId
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function updateTravelRecommendations(data: any, supabase: any) {
  const { userId, weatherConditions, tripId } = data;

  if (!userId) {
    throw new Error('Missing required field: userId');
  }

  // Get user's active trips
  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['confirmed', 'ongoing']);

  if (!trips || trips.length === 0) {
    return new Response(
      JSON.stringify({
        success: true,
        recommendations: [],
        message: 'No active trips found'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Generate weather-based recommendations
  const recommendations = [];

  for (const trip of trips) {
    const tripRecommendations = generateTripRecommendations(trip, weatherConditions);
    recommendations.push({
      trip_id: trip.id,
      trip_title: trip.title,
      destination: trip.destination,
      recommendations: tripRecommendations
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      recommendations,
      weather_conditions: weatherConditions,
      generated_at: new Date().toISOString()
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

function generateTripRecommendations(trip: any, weatherConditions: any) {
  const recommendations = [];

  if (weatherConditions?.precipitation_high) {
    recommendations.push({
      type: 'activity_adjustment',
      priority: 'high',
      message: 'Consider indoor alternatives for outdoor activities',
      suggestions: [
        'Visit local museums or galleries',
        'Explore covered markets',
        'Try indoor entertainment venues'
      ]
    });
  }

  if (weatherConditions?.temperature_extreme) {
    recommendations.push({
      type: 'timing_adjustment',
      priority: 'medium',
      message: 'Adjust activity timing to avoid extreme temperatures',
      suggestions: [
        'Schedule outdoor activities for early morning or evening',
        'Take frequent breaks in air-conditioned spaces',
        'Stay hydrated and wear appropriate clothing'
      ]
    });
  }

  return recommendations;
}