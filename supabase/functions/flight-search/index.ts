import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { fromCity, toCity, departDate, passengers, flightClass } = await req.json();

    console.log('Flight search request:', { fromCity, toCity, departDate, passengers, flightClass });

    if (!fromCity || !toCity || !departDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fromCity, toCity, departDate' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Flight search service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Using SkyScanner API from RapidAPI
    const url = `https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'sky-scrapper.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originSkyId: fromCity,
        destinationSkyId: toCity,
        originEntityId: fromCity,
        destinationEntityId: toCity,
        date: departDate,
        adults: parseInt(passengers) || 1,
        cabinClass: flightClass || 'economy',
        currency: 'INR',
        market: 'IN',
        locale: 'en-IN',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Flight API error:', response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch flights',
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Flight API response:', JSON.stringify(data).substring(0, 200));

    // Transform the API response to match our frontend structure
    const flights = data.data?.itineraries?.map((itinerary: any, index: number) => {
      const leg = itinerary.legs?.[0];
      const carrier = leg?.carriers?.marketing?.[0];
      
      return {
        id: index + 1,
        airline: carrier?.name || 'Unknown Airline',
        logo: carrier?.logoUrl || '',
        departure: {
          time: leg?.departure ? new Date(leg.departure).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }) : '',
          city: leg?.origin?.displayCode || fromCity,
        },
        arrival: {
          time: leg?.arrival ? new Date(leg.arrival).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }) : '',
          city: leg?.destination?.displayCode || toCity,
        },
        duration: `${Math.floor((leg?.durationInMinutes || 0) / 60)}h ${(leg?.durationInMinutes || 0) % 60}m`,
        stops: leg?.stopCount === 0 ? 'Non-stop' : `${leg?.stopCount} stop(s)`,
        price: itinerary.price?.raw || 0,
        rating: 4.0 + (Math.random() * 0.5), // API doesn't provide ratings
        bookingUrl: itinerary.deepLink || '',
      };
    }) || [];

    console.log('Transformed flights:', flights.length, 'flights found');

    return new Response(
      JSON.stringify({ flights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in flight-search function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});