import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Trip } from '@/types/database';

export type { Trip } from '@/types/database';

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  // Set up realtime subscription for trip updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('trips-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Trip changed:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTrip = payload.new as Trip;
            setTrips(prev => [newTrip, ...prev]);
            toast({
              title: "Trip Created",
              description: `${newTrip.title} has been added to your trips`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedTrip = payload.new as Trip;
            setTrips(prev => prev.map(trip => 
              trip.id === updatedTrip.id ? updatedTrip : trip
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedTrip = payload.old as Trip;
            setTrips(prev => prev.filter(trip => trip.id !== deletedTrip.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('trips' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setTrips((data || []) as Trip[]);
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
      const { data, error } = await (supabase
        .from('trips' as any)
        .insert([{
          ...tripData,
          user_id: user.id,
        }])
        .select()
        .single() as any);

      if (error) throw error;
      
      toast({
        title: "Trip Created",
        description: "Your trip has been successfully created!",
      });

      return { data: data as Trip, error: null };
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
      const { data, error } = await (supabase
        .from('trips' as any)
        .update(updates)
        .eq('id', tripId)
        .select()
        .single() as any);

      if (error) throw error;
      
      toast({
        title: "Trip Updated",
        description: "Your trip has been successfully updated!",
      });

      return { data: data as Trip, error: null };
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
      const { error } = await (supabase
        .from('trips' as any)
        .delete()
        .eq('id', tripId) as any);

      if (error) throw error;
      
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

  return {
    trips,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    refetch: fetchTrips,
  };
};
