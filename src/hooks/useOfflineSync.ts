import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { offlineStorage } from '@/utils/OfflineStorage';
import { serviceWorkerManager } from '@/utils/ServiceWorkerManager';
import { supabase } from '@/integrations/supabase/client';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingItems: number;
  syncErrors: string[];
}

export const useOfflineSync = () => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    syncErrors: []
  });

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      // Trigger sync when coming back online
      syncData();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync data when online
  const syncData = useCallback(async () => {
    if (!user || !navigator.onLine || syncStatus.isSyncing) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncErrors: [] }));

    try {
      // Sync trips
      await syncTrips();
      
      // Sync bookings
      await syncBookings();
      
      // Sync emergency contacts
      await syncEmergencyContacts();

      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingItems: 0
      }));

      console.log('Data sync completed successfully');
    } catch (error) {
      console.error('Data sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncErrors: [...prev.syncErrors, error instanceof Error ? error.message : 'Unknown sync error']
      }));
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, [user, syncStatus.isSyncing]);

  const syncTrips = async () => {
    if (!user) return;

    try {
      // Get online trips
      const { data: onlineTrips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get offline trips
      const offlineTrips = await offlineStorage.getTrips(user.id);

      // Store online trips offline for caching
      for (const trip of onlineTrips || []) {
        await offlineStorage.storeTrip(trip);
      }

      // Check for offline-only trips that need to be synced
      for (const offlineTrip of offlineTrips) {
        const existsOnline = onlineTrips?.find(t => t.id === offlineTrip.id);
        if (!existsOnline && offlineTrip.id.startsWith('offline_')) {
          // This is an offline-created trip, sync it
          const { error: insertError } = await supabase
            .from('trips')
            .insert({
              ...offlineTrip,
              id: undefined, // Let Supabase generate new ID
              user_id: user.id
            });

          if (insertError) {
            console.error('Failed to sync offline trip:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Trip sync failed:', error);
      throw error;
    }
  };

  const syncBookings = async () => {
    if (!user) return;

    try {
      // Get online bookings
      const { data: onlineBookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Cache bookings offline
      for (const booking of onlineBookings || []) {
        await offlineStorage.setItem(
          `booking_${booking.id}`,
          booking,
          { ttl: 7 * 24 * 60 * 60 * 1000 } // 7 days
        );
      }
    } catch (error) {
      console.error('Booking sync failed:', error);
      throw error;
    }
  };

  const syncEmergencyContacts = async () => {
    if (!user) return;

    try {
      // Get online emergency contacts
      const { data: onlineContacts, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Store emergency contacts offline for offline access
      await offlineStorage.storeEmergencyContacts(user.id, onlineContacts || []);
    } catch (error) {
      console.error('Emergency contacts sync failed:', error);
      throw error;
    }
  };

  // Store data offline when online
  const storeOffline = useCallback(async (key: string, data: any, options?: any) => {
    try {
      await offlineStorage.setItem(key, data, options);
      return true;
    } catch (error) {
      console.error('Failed to store data offline:', error);
      return false;
    }
  }, []);

  // Get data from offline storage
  const getOffline = useCallback(async (key: string) => {
    try {
      return await offlineStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }, []);

  // Schedule background sync
  const scheduleSync = useCallback(async (type: 'emergency' | 'location' | 'booking', data: any) => {
    try {
      switch (type) {
        case 'emergency':
          await serviceWorkerManager.scheduleEmergencySync(data);
          break;
        case 'location':
          await serviceWorkerManager.scheduleLocationSync(data);
          break;
        case 'booking':
          await serviceWorkerManager.scheduleBookingSync(data);
          break;
      }
      return true;
    } catch (error) {
      console.error('Failed to schedule sync:', error);
      return false;
    }
  }, []);

  // Manual sync trigger
  const forcSync = useCallback(() => {
    if (navigator.onLine) {
      syncData();
    }
  }, [syncData]);

  return {
    syncStatus,
    syncData: forcSync,
    storeOffline,
    getOffline,
    scheduleSync
  };
};