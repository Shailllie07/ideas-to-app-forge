import { supabase } from '@/integrations/supabase/client';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface ProximityAlert {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  is_active: boolean;
  alert_type: 'enter' | 'exit' | 'both';
  metadata?: any;
}

export interface LocationHistoryEntry {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  activity_type?: 'stationary' | 'walking' | 'running' | 'cycling' | 'driving';
  metadata?: any;
}

class LocationService {
  private watchId: number | null = null;
  private currentLocation: LocationData | null = null;
  private locationHistory: LocationHistoryEntry[] = [];
  private proximityAlerts: ProximityAlert[] = [];
  private lastLocationUpdate: number = 0;
  private minUpdateInterval: number = 30000; // 30 seconds

  async requestPermission(): Promise<boolean> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    try {
      const position = await this.getCurrentPosition();
      return true;
    } catch (error) {
      console.error('Location permission denied:', error);
      return false;
    }
  }

  async getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: Date.now()
          };
          
          this.currentLocation = locationData;
          resolve(locationData);
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  }

  startLocationTracking(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    minInterval?: number;
  }): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      if (this.watchId !== null) {
        this.stopLocationTracking();
      }

      this.minUpdateInterval = options?.minInterval || 30000;

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          if (now - this.lastLocationUpdate < this.minUpdateInterval) {
            return; // Skip update if too frequent
          }

          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: now
          };

          this.currentLocation = locationData;
          this.lastLocationUpdate = now;

          // Store in location history (if user consents)
          this.addToLocationHistory(locationData);

          // Check proximity alerts
          this.checkProximityAlerts(locationData);

          console.log('Location updated:', locationData);
        },
        (error) => {
          console.error('Location tracking error:', error);
          reject(new Error(`Location tracking failed: ${error.message}`));
        },
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 15000,
          maximumAge: options?.maximumAge ?? 60000
        }
      );

      resolve(true);
    });
  }

  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('Location tracking stopped');
    }
  }

  private async addToLocationHistory(location: LocationData): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Only store location if user has enabled location history
      const { data: profile } = await supabase
        .from('profiles')
        .select('location_history_enabled')
        .eq('id', user.id)
        .single();

      if (!profile?.location_history_enabled) return;

      const historyEntry: Omit<LocationHistoryEntry, 'id'> = {
        user_id: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: new Date(location.timestamp).toISOString(),
        activity_type: this.detectActivityType(location),
        metadata: {
          altitude: location.altitude,
          heading: location.heading,
          speed: location.speed
        }
      };

      const { error } = await supabase
        .from('location_history')
        .insert([historyEntry]);

      if (error) {
        console.error('Failed to save location history:', error);
      }
    } catch (error) {
      console.error('Error adding to location history:', error);
    }
  }

  private detectActivityType(location: LocationData): string {
    if (!location.speed) return 'stationary';
    
    const speedKmh = location.speed * 3.6; // Convert m/s to km/h
    
    if (speedKmh < 1) return 'stationary';
    if (speedKmh < 5) return 'walking';
    if (speedKmh < 15) return 'running';
    if (speedKmh < 25) return 'cycling';
    return 'driving';
  }

  async createProximityAlert(alert: Omit<ProximityAlert, 'id' | 'user_id'>): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('proximity_alerts')
        .insert([{
          ...alert,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      this.proximityAlerts.push(data);
      return data.id;
    } catch (error) {
      console.error('Failed to create proximity alert:', error);
      return null;
    }
  }

  private async checkProximityAlerts(location: LocationData): Promise<void> {
    for (const alert of this.proximityAlerts) {
      if (!alert.is_active) continue;

      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        alert.latitude,
        alert.longitude
      );

      const isInside = distance <= alert.radius;
      const wasInside = alert.metadata?.wasInside || false;

      let shouldTrigger = false;
      let alertMessage = '';

      if (alert.alert_type === 'enter' && isInside && !wasInside) {
        shouldTrigger = true;
        alertMessage = `You have entered ${alert.name}`;
      } else if (alert.alert_type === 'exit' && !isInside && wasInside) {
        shouldTrigger = true;
        alertMessage = `You have left ${alert.name}`;
      } else if (alert.alert_type === 'both') {
        if (isInside && !wasInside) {
          shouldTrigger = true;
          alertMessage = `You have entered ${alert.name}`;
        } else if (!isInside && wasInside) {
          shouldTrigger = true;
          alertMessage = `You have left ${alert.name}`;
        }
      }

      if (shouldTrigger) {
        // Trigger notification
        this.triggerProximityNotification(alert, alertMessage);
      }

      // Update state
      alert.metadata = { ...alert.metadata, wasInside: isInside };
    }
  }

  private async triggerProximityNotification(alert: ProximityAlert, message: string): Promise<void> {
    try {
      // Send push notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Location Alert', {
          body: message,
          icon: '/icon-192.png',
          tag: `proximity-${alert.id}`
        });
      }

      // Store notification in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('notifications').insert([{
          user_id: user.id,
          type: 'location',
          title: 'Location Alert',
          message: message,
          priority: 'normal',
          related_id: alert.id
        }]);
      }
    } catch (error) {
      console.error('Failed to trigger proximity notification:', error);
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  async shareLocationWithContacts(duration: number = 3600000): Promise<boolean> {
    try {
      const location = await this.getCurrentPosition();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      // Get emergency contacts
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (!contacts || contacts.length === 0) {
        throw new Error('No emergency contacts found');
      }

      const expiresAt = new Date(Date.now() + duration);

      // Create location sharing session
      const { data: session, error } = await supabase
        .from('location_sharing_sessions')
        .insert([{
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          expires_at: expiresAt.toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Send location to emergency contacts
      const { error: notificationError } = await supabase.functions.invoke('emergency-notification', {
        body: {
          userId: user.id,
          location: location,
          emergencyType: 'Location Sharing',
          message: `I'm sharing my location with you for the next ${Math.round(duration / 60000)} minutes. View: ${window.location.origin}/shared-location/${session.id}`
        }
      });

      if (notificationError) {
        console.error('Failed to send location sharing notifications:', notificationError);
      }

      return true;
    } catch (error) {
      console.error('Failed to share location:', error);
      return false;
    }
  }

  async getLocationHistory(days: number = 7): Promise<LocationHistoryEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('location_history')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to get location history:', error);
      return [];
    }
  }

  // Getters
  getCurrentLocationData(): LocationData | null {
    return this.currentLocation;
  }

  isTracking(): boolean {
    return this.watchId !== null;
  }

  getProximityAlerts(): ProximityAlert[] {
    return this.proximityAlerts;
  }
}

export const locationService = new LocationService();