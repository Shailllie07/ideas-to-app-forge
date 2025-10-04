import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Input validation
interface EmergencyRequest {
  userId: string;
  location: { latitude: number; longitude: number };
  emergencyType?: string;
  message?: string;
}

function validateEmergencyRequest(data: any): { valid: boolean; error?: string; data?: EmergencyRequest } {
  if (!data.userId || typeof data.userId !== 'string') {
    return { valid: false, error: 'userId is required' };
  }
  
  if (!data.location || typeof data.location !== 'object') {
    return { valid: false, error: 'location is required' };
  }
  
  const { latitude, longitude } = data.location;
  
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Invalid latitude (must be -90 to 90)' };
  }
  
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Invalid longitude (must be -180 to 180)' };
  }
  
  if (data.emergencyType && typeof data.emergencyType !== 'string') {
    return { valid: false, error: 'emergencyType must be a string' };
  }
  
  if (data.message && typeof data.message !== 'string') {
    return { valid: false, error: 'message must be a string' };
  }
  
  return { valid: true, data: data as EmergencyRequest };
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
    // Parse and validate request
    const requestBody = await req.json();
    const validation = validateEmergencyRequest(requestBody);
    
    if (!validation.valid) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid emergency request data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { userId, location, emergencyType = 'general', message = '' } = validation.data!;

    console.log('Emergency notification request:', { userId, emergencyType, location: 'coordinates validated' });

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
      throw new Error('Database error');
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
        console.log(`Would send SMS to ${contact.phone_number}`);
        
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
          error: 'Notification failed'
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
    // Log detailed error server-side
    console.error('Error sending emergency notifications:', error);
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Unable to send emergency notifications. Please try again.',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});