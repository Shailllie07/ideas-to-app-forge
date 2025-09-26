import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';

// Component to configure Mapbox token
export const MapboxConfig = () => {
  useEffect(() => {
    const initializeMapbox = async () => {
      try {
        // In a real app, this would be retrieved from edge functions or server
        // For now, using a demo token - replace with your actual Mapbox token
        mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNrOGVhd2F4ZjBjeGkzaW80dTBwYnlydnQifQ.sample-token';
      } catch (error) {
        console.error('Failed to initialize Mapbox:', error);
      }
    };

    initializeMapbox();
  }, []);

  return null;
};

export default MapboxConfig;