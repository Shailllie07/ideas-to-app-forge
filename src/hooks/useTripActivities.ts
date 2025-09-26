import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type TripActivity = Tables<'trip_activities'>;
export type TripActivityInsert = TablesInsert<'trip_activities'>;
export type TripActivityUpdate = TablesUpdate<'trip_activities'>;

export const useTripActivities = (tripId?: string) => {
  const [activities, setActivities] = useState<TripActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && tripId) {
      fetchActivities();
    }
  }, [user, tripId]);

  const fetchActivities = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_activities')
        .select('*')
        .eq('trip_id', tripId)
        .order('day_number', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: TripActivityInsert) => {
    try {
      const { data, error } = await supabase
        .from('trip_activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;

      setActivities(prev => [...prev, data]);
      
      toast({
        title: "Activity Added",
        description: "Activity has been added to your itinerary!",
      });

      return { data, error: null };
    } catch (error) {
      const activityError = error as Error;
      toast({
        title: "Error",
        description: "Failed to add activity. Please try again.",
        variant: "destructive",
      });
      return { data: null, error: activityError };
    }
  };

  return {
    activities,
    loading,
    createActivity,
    refetch: fetchActivities,
  };
};