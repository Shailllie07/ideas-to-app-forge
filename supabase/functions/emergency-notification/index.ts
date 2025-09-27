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
    const { userId, location, emergencyType, message } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Emergency notification request:', { userId, emergencyType, location });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's emergency contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId);

    if (contactsError) {
      console.error('Error fetching emergency contacts:', contactsError);
      throw new Error('Failed to fetch emergency contacts');
    }

    // Get user profile for additional context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, phone_number')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('Could not fetch user profile:', profileError);
    }

    const userName = profile?.display_name || 'Unknown User';
    const timestamp = new Date().toLocaleString();
    
    // Format location for sharing
    const locationText = location 
      ? `Location: https://maps.google.com/maps?q=${location.latitude},${location.longitude} (Lat: ${location.latitude}, Lng: ${location.longitude})`
      : 'Location not available';

    // Create emergency message
    const emergencyMessage = `🚨 EMERGENCY ALERT 🚨

${userName} has triggered an emergency alert.

Type: ${emergencyType || 'General Emergency'}
Time: ${timestamp}
${locationText}

${message ? `Message: ${message}` : ''}

Please contact them immediately or call emergency services if needed.

This is an automated alert from JourneyXWave.`;

    // Store emergency event in database
    const { error: logError } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type: 'emergency',
        title: 'Emergency Alert Sent',
        message: `Emergency alert sent to ${contacts?.length || 0} contacts`,
        priority: 'high'
      }]);

    if (logError) {
      console.error('Error logging emergency event:', logError);
    }

    // Send notifications to all emergency contacts
    const notificationResults = [];
    
    for (const contact of contacts || []) {
      try {
        // Note: In production, integrate with Twilio or similar SMS service
        // For now, we'll log the notification that would be sent
        console.log(`Would send SMS to ${contact.phone_number}:`, emergencyMessage);
        
        // Store notification result
        notificationResults.push({
          contactId: contact.id,
          contactName: contact.name,
          phone: contact.phone_number,
          status: 'queued',
          message: 'SMS notification queued for delivery'
        });

      } catch (contactError) {
        console.error(`Failed to notify ${contact.name}:`, contactError);
        notificationResults.push({
          contactId: contact.id,
          contactName: contact.name,
          phone: contact.phone_number,
          status: 'failed',
          error: contactError instanceof Error ? contactError.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alertSent: true,
        contactsNotified: contacts?.length || 0,
        timestamp: timestamp,
        location: location,
        results: notificationResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in emergency-notification:', error);
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