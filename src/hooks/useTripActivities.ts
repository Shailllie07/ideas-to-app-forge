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

  // Set up realtime subscription for activity updates
  useEffect(() => {
    if (!user || !tripId) return;

    const channel = supabase
      .channel('trip-activities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_activities',
          filter: `trip_id=eq.${tripId}`
        },
        (payload) => {
          console.log('Activity changed:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newActivity = payload.new as TripActivity;
            setActivities(prev => [...prev, newActivity].sort((a, b) => a.day_number - b.day_number));
          } else if (payload.eventType === 'UPDATE') {
            const updatedActivity = payload.new as TripActivity;
            setActivities(prev => prev.map(activity => 
              activity.id === updatedActivity.id ? updatedActivity : activity
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedActivity = payload.old as TripActivity;
            setActivities(prev => prev.filter(activity => activity.id !== deletedActivity.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

      // Note: realtime subscription will handle adding to state
      
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

  const updateActivity = async (activityId: string, updates: Partial<TripActivity>) => {
    try {
      const { data, error } = await supabase
        .from('trip_activities')
        .update(updates)
        .eq('id', activityId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Activity Updated",
        description: "Activity has been updated successfully!",
      });

      return { data, error: null };
    } catch (error) {
      const activityError = error as Error;
      toast({
        title: "Error",
        description: "Failed to update activity. Please try again.",
        variant: "destructive",
      });
      return { data: null, error: activityError };
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('trip_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      toast({
        title: "Activity Deleted",
        description: "Activity has been removed from your itinerary",
      });

      return { error: null };
    } catch (error) {
      const activityError = error as Error;
      toast({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
        variant: "destructive",
      });
      return { error: activityError };
    }
  };

  return {
    activities,
    loading,
    createActivity,
    updateActivity,
    deleteActivity,
    refetch: fetchActivities,
  };
};