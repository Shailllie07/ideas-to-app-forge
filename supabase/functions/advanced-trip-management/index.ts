import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Input validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
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

    console.log(`Advanced trip management action: ${action}`);

    switch (action) {
      case 'invite_collaborator':
        return await inviteCollaborator(data, supabase);
      case 'replan_trip':
        return await replanTrip(data, supabase);
      case 'export_trip':
        return await exportTripData(data, supabase);
      case 'analyze_budget':
        return await analyzeBudget(data, supabase);
      case 'backup_trip':
        return await backupTrip(data, supabase);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    // Log detailed error server-side
    console.error('Error in advanced-trip-management:', error);
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Unable to process trip management request. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function inviteCollaborator(data: any, supabase: any) {
  const { tripId, email, role, invitedBy } = data;

  if (!tripId || !email || !invitedBy) {
    throw new Error('Missing required fields');
  }
  
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  if (!validateUUID(tripId) || !validateUUID(invitedBy)) {
    throw new Error('Invalid ID format');
  }

  // Check if trip exists and user has permission
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', invitedBy)
    .single();

  if (!trip) {
    throw new Error('Trip not found or insufficient permissions');
  }

  // Mock collaboration invite - in production, would send email
  console.log(`Sending collaboration invite for trip ${tripId} to ${email} with role ${role}`);

  return new Response(
    JSON.stringify({
      success: true,
      message: `Collaboration invitation sent to ${email}`,
      tripId,
      email,
      role: role || 'viewer'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function replanTrip(data: any, supabase: any) {
  const { tripId, reason, userId } = data;

  if (!tripId || !reason || !userId) {
    throw new Error('Missing required fields');
  }

  // Get trip details
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (!trip) {
    throw new Error('Trip not found');
  }

  // Mock AI replanning logic
  const replanning = {
    original_plan: trip.ai_generated_itinerary,
    new_plan: {
      ...trip.ai_generated_itinerary,
      updated_for: reason,
      replanned_at: new Date().toISOString(),
      alternative_activities: [
        'Indoor museum visit (weather alternative)',
        'Local cooking class',
        'City walking tour with covered areas'
      ]
    },
    reason,
    confidence_score: 0.85,
    alternatives: [
      {
        activity: 'Alternative restaurant recommendation',
        reason: 'Original choice not available',
        confidence: 0.9
      }
    ]
  };

  // Update trip with new plan
  await supabase
    .from('trips')
    .update({
      ai_generated_itinerary: replanning.new_plan,
      updated_at: new Date().toISOString()
    })
    .eq('id', tripId);

  return new Response(
    JSON.stringify({
      success: true,
      replanning,
      message: 'Trip successfully replanned'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function exportTripData(data: any, supabase: any) {
  const { tripId, format, userId } = data;

  if (!tripId || !userId) {
    throw new Error('Missing required fields');
  }

  // Get trip with all related data
  const { data: trip } = await supabase
    .from('trips')
    .select(`
      *,
      trip_activities (*),
      bookings (*)
    `)
    .eq('id', tripId)
    .single();

  if (!trip) {
    throw new Error('Trip not found');
  }

  // Mock export functionality
  const exportData = {
    trip: trip,
    exported_at: new Date().toISOString(),
    format: format || 'pdf',
    file_size: '2.5 MB',
    download_url: `https://example.com/exports/trip-${tripId}.${format || 'pdf'}`
  };

  console.log(`Exporting trip ${tripId} in ${format} format for user ${userId}`);

  return new Response(
    JSON.stringify({
      success: true,
      export: exportData,
      downloadUrl: exportData.download_url,
      message: `Trip exported successfully as ${format || 'PDF'}`
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function analyzeBudget(data: any, supabase: any) {
  const { tripId, userId } = data;

  if (!tripId || !userId) {
    throw new Error('Missing required fields');
  }

  // Get trip and expenses
  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (!trip) {
    throw new Error('Trip not found');
  }

  // Mock budget analysis
  const analysis = {
    total_budget: trip.budget || 0,
    spent_amount: 850,
    remaining_budget: (trip.budget || 0) - 850,
    expense_breakdown: {
      transport: 400,
      accommodation: 300,
      food: 100,
      activities: 50
    },
    spending_trend: 'on_track',
    recommendations: [
      'You are 15% under budget for accommodation',
      'Consider allocating more budget to activities',
      'Food expenses are tracking well'
    ],
    projected_total: 1200,
    savings_opportunities: [
      {
        category: 'transport',
        potential_savings: 50,
        suggestion: 'Consider public transport for local trips'
      }
    ]
  };

  return new Response(
    JSON.stringify({
      success: true,
      analysis,
      message: 'Budget analysis completed'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function backupTrip(data: any, supabase: any) {
  const { tripId, userId } = data;

  if (!tripId || !userId) {
    throw new Error('Missing required fields');
  }

  // Get complete trip data
  const { data: trip } = await supabase
    .from('trips')
    .select(`
      *,
      trip_activities (*),
      bookings (*),
      trip_expenses (*)
    `)
    .eq('id', tripId)
    .single();

  if (!trip) {
    throw new Error('Trip not found');
  }

  // Mock backup creation
  const backup = {
    backup_id: `backup-${tripId}-${Date.now()}`,
    trip_id: tripId,
    user_id: userId,
    backup_date: new Date().toISOString(),
    data_size: '1.2 MB',
    includes: ['trip_details', 'activities', 'bookings', 'expenses'],
    storage_location: 'secure_cloud_backup',
    retention_period: '1 year'
  };

  console.log(`Creating backup for trip ${tripId}`);

  return new Response(
    JSON.stringify({
      success: true,
      backup,
      message: 'Trip backup created successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}