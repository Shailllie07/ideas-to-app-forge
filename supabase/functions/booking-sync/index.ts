import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { 
      bookingType, 
      bookingReference, 
      tripId, 
      bookingData,
      provider 
    } = await req.json();

    if (!bookingType || !bookingReference || !tripId) {
      throw new Error('Missing required fields: bookingType, bookingReference, and tripId are required');
    }

    console.log('Booking sync request:', { bookingType, bookingReference, provider });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Verify user owns the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, user_id')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single();

    if (tripError || !trip) {
      throw new Error('Trip not found or access denied');
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        user_id: user.id,
        trip_id: tripId,
        booking_type: bookingType,
        booking_reference: bookingReference,
        provider: provider || 'Unknown',
        booking_data: bookingData || {},
        status: 'pending',
        total_amount: bookingData?.amount || null,
        currency: bookingData?.currency || 'INR',
        travel_date: bookingData?.travelDate || null
      }])
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw new Error('Failed to create booking record');
    }

    console.log('Booking created successfully:', booking.id);

    // Create notification for user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([{
        user_id: user.id,
        type: 'booking',
        title: 'Booking Confirmed',
        message: `Your ${bookingType} booking (${bookingReference}) has been added to your trip.`,
        related_id: booking.id,
        priority: 'normal'
      }]);

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking: booking,
        message: 'Booking synchronized successfully',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in booking-sync:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});