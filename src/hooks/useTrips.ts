import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Trip = Tables<'trips'>;
export type TripInsert = TablesInsert<'trips'>;
export type TripUpdate = TablesUpdate<'trips'>;
export type TripActivity = Tables<'trip_activities'>;

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([{
          ...tripData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setTrips(prev => [data, ...prev]);
      
      toast({
        title: "Trip Created",
        description: "Your trip has been successfully created!",
      });

      return { data, error: null };
    } catch (error) {
      const tripError = error as Error;
      toast({
        title: "Error",
        description: "Failed to create trip. Please try again.",
        variant: "destructive",
      });
      return { data: null, error: tripError };
    }
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;

      setTrips(prev => prev.map(trip => trip.id === tripId ? data : trip));
      
      toast({
        title: "Trip Updated",
        description: "Your trip has been successfully updated!",
      });

      return { data, error: null };
    } catch (error) {
      const tripError = error as Error;
      toast({
        title: "Error",
        description: "Failed to update trip. Please try again.",
        variant: "destructive",
      });
      return { data: null, error: tripError };
    }
  };

  const deleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      
      toast({
        title: "Trip Deleted",
        description: "Your trip has been successfully deleted.",
      });

      return { error: null };
    } catch (error) {
      const tripError = error as Error;
      toast({
        title: "Error",
        description: "Failed to delete trip. Please try again.",
        variant: "destructive",
      });
      return { error: tripError };
    }
  };

  const getActiveTrips = async () => {
    if (!user) return { data: [], error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .rpc('get_active_trips', { user_uuid: user.id });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      const tripError = error as Error;
      return { data: [], error: tripError };
    }
  };

  const getTripStatistics = async () => {
    if (!user) return { data: null, error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .rpc('get_trip_statistics', { user_uuid: user.id });

      if (error) throw error;
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      const tripError = error as Error;
      return { data: null, error: tripError };
    }
  };

  return {
    trips,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    getActiveTrips,
    getTripStatistics,
    refetch: fetchTrips,
  };
};