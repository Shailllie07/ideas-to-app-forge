import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export const useEmergency = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const { user } = useAuth();

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          setLocation(locationData);
          resolve(locationData);
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(new Error('Failed to get current location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const triggerEmergency = async (emergencyType?: string, customMessage?: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use emergency features",
        variant: "destructive",
      });
      return { success: false, error: 'User not authenticated' };
    }

    setIsEmergencyActive(true);

    try {
      console.log('Triggering emergency alert...');

      // Get current location
      let currentLocation: LocationData | null = null;
      try {
        currentLocation = await getCurrentLocation();
        console.log('Location obtained:', currentLocation);
      } catch (locationError) {
        console.warn('Could not get location:', locationError);
        toast({
          title: "Location Warning",
          description: "Emergency alert will be sent without location data",
          variant: "destructive",
        });
      }

      // Send emergency notification
      const { data, error } = await supabase.functions.invoke('emergency-notification', {
        body: {
          userId: user.id,
          location: currentLocation,
          emergencyType: emergencyType || 'General Emergency',
          message: customMessage
        }
      });

      if (error) {
        console.error('Emergency notification error:', error);
        throw new Error(error.message || 'Failed to send emergency alert');
      }

      if (!data.success) {
        throw new Error(data.error || 'Emergency notification failed');
      }

      console.log('Emergency alert sent successfully:', data);

      toast({
        title: "Emergency Alert Sent",
        description: `Alert sent to ${data.contactsNotified} emergency contacts`,
      });

      // Auto-deactivate emergency after 30 seconds
      setTimeout(() => {
        setIsEmergencyActive(false);
      }, 30000);

      return { 
        success: true, 
        data: data,
        contactsNotified: data.contactsNotified,
        location: currentLocation
      };

    } catch (error) {
      console.error('Error triggering emergency:', error);
      setIsEmergencyActive(false);
      
      toast({
        title: "Emergency Alert Failed",
        description: error instanceof Error ? error.message : "Failed to send emergency alert",
        variant: "destructive",
      });

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const cancelEmergency = () => {
    setIsEmergencyActive(false);
    console.log('Emergency cancelled by user');
    
    toast({
      title: "Emergency Cancelled",
      description: "Emergency alert has been cancelled",
    });
  };

  const findNearestHospitals = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      
      // In a real implementation, this would query a hospitals API
      // For now, we'll return mock data based on location
      const mockHospitals = [
        {
          id: '1',
          name: 'City General Hospital',
          address: 'Near your location',
          phone: '+91-11-2345-6789',
          distance: '0.8 km',
          specialties: ['Emergency', 'General Medicine', 'Surgery'],
          coordinates: {
            lat: currentLocation.latitude + 0.01,
            lng: currentLocation.longitude + 0.01
          }
        },
        {
          id: '2',
          name: 'Metro Medical Center',
          address: 'Medical District',
          phone: '+91-11-9876-5432',
          distance: '1.2 km',
          specialties: ['Emergency', 'Cardiology', 'Trauma'],
          coordinates: {
            lat: currentLocation.latitude - 0.01,
            lng: currentLocation.longitude + 0.005
          }
        }
      ];

      console.log('Found hospitals near location:', currentLocation);

      return {
        success: true,
        hospitals: mockHospitals,
        userLocation: currentLocation
      };

    } catch (error) {
      console.error('Error finding hospitals:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find hospitals',
        hospitals: []
      };
    }
  };

  return {
    isEmergencyActive,
    location,
    triggerEmergency,
    cancelEmergency,
    findNearestHospitals,
    getCurrentLocation
  };
};