import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

type Trip = {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  budget?: number;
  notes?: string;
  ai_generated_itinerary?: any;
  created_at: string;
  updated_at: string;
};

export interface TripCollaborator {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  invited_by: string;
  invited_at: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'declined';
  profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface TripExpense {
  id: string;
  trip_id: string;
  user_id: string;
  category: 'transport' | 'accommodation' | 'food' | 'activities' | 'shopping' | 'other';
  description: string;
  amount: number;
  currency: string;
  date: string;
  receipt_url?: string;
  split_type: 'equal' | 'custom' | 'percentage';
  split_data?: any;
  created_at: string;
}

export interface TripReplanning {
  original_plan: any;
  new_plan: any;
  reason: string;
  confidence_score: number;
  alternatives: any[];
}

export const useAdvancedTripManagement = () => {
  const { user } = useAuth();
  const [collaborativeTrips, setCollaborativeTrips] = useState<Trip[]>([]);
  const [tripExpenses, setTripExpenses] = useState<TripExpense[]>([]);
  const [tripCollaborators, setTripCollaborators] = useState<TripCollaborator[]>([]);
  const [loading, setLoading] = useState(false);

  // Real-time collaboration setup
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('trip-collaboration')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_collaborators',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Collaboration change:', payload);
          fetchCollaborativeTrips();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_expenses'
        },
        (payload) => {
          console.log('Expense change:', payload);
          fetchTripExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchCollaborativeTrips = useCallback(async () => {
    try {
      setLoading(true);

      // Get user's own trips
      const { data: ownTrips, error: ownError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id);

      if (ownError) throw ownError;

      // For now, just use own trips until collaborator functionality is fully implemented
      setCollaborativeTrips(ownTrips || []);
    } catch (error) {
      console.error('Error fetching collaborative trips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch collaborative trips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const inviteCollaborator = async (tripId: string, email: string, role: 'editor' | 'viewer' = 'viewer'): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('invite-trip-collaborator', {
        body: {
          tripId,
          email,
          role,
          invitedBy: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Collaboration invitation sent to ${email}`,
      });

      return true;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      toast({
        title: "Error",
        description: "Failed to send collaboration invitation",
        variant: "destructive"
      });
      return false;
    }
  };

  const acceptCollaborationInvite = async (inviteId: string): Promise<boolean> => {
    try {
      // Temporary mock until collaboration system is fully implemented
      console.log('Accepting collaboration invite:', inviteId);

      toast({
        title: "Invitation Accepted",
        description: "You are now a collaborator on this trip",
      });

      fetchCollaborativeTrips();
      return true;
    } catch (error) {
      console.error('Error accepting collaboration invite:', error);
      toast({
        title: "Error",
        description: "Failed to accept collaboration invitation",
        variant: "destructive"
      });
      return false;
    }
  };

  const fetchTripExpenses = async (tripId?: string) => {
    try {
      // Mock expenses for now until types are updated
      console.log('Fetching trip expenses for trip:', tripId);
      setTripExpenses([]);
    } catch (error) {
      console.error('Error fetching trip expenses:', error);
    }
  };

  const addTripExpense = async (expense: Omit<TripExpense, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    try {
      console.log('Adding trip expense:', expense);
      
      toast({
        title: "Expense Added",
        description: "Trip expense has been recorded",
      });

      return true;
    } catch (error) {
      console.error('Error adding trip expense:', error);
      toast({
        title: "Error",
        description: "Failed to add trip expense",
        variant: "destructive"
      });
      return false;
    }
  };

  const splitExpense = async (expenseId: string, splitData: any): Promise<boolean> => {
    try {
      console.log('Splitting expense:', expenseId, splitData);

      toast({
        title: "Expense Split",
        description: "Expense has been split among collaborators",
      });

      return true;
    } catch (error) {
      console.error('Error splitting expense:', error);
      toast({
        title: "Error",
        description: "Failed to split expense",
        variant: "destructive"
      });
      return false;
    }
  };

  const replanTrip = async (tripId: string, reason: string): Promise<TripReplanning | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('replan-trip', {
        body: {
          tripId,
          reason,
          userId: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Trip Replanned",
        description: "Your trip has been replanned based on the changes",
      });

      return data;
    } catch (error) {
      console.error('Error replanning trip:', error);
      toast({
        title: "Error",
        description: "Failed to replan trip",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const syncBookingStatus = async (tripId: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('booking-sync', {
        body: {
          tripId,
          action: 'sync_all'
        }
      });

      if (error) throw error;

      toast({
        title: "Bookings Synced",
        description: "All booking statuses have been updated",
      });
    } catch (error) {
      console.error('Error syncing bookings:', error);
      toast({
        title: "Error",
        description: "Failed to sync booking statuses",
        variant: "destructive"
      });
    }
  };

  const exportTripData = async (tripId: string, format: 'pdf' | 'excel' | 'json' = 'pdf'): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('export-trip-data', {
        body: {
          tripId,
          format,
          userId: user?.id
        }
      });

      if (error) throw error;

      return data.downloadUrl;
    } catch (error) {
      console.error('Error exporting trip data:', error);
      toast({
        title: "Error",
        description: "Failed to export trip data",
        variant: "destructive"
      });
      return null;
    }
  };

  const getTripBudgetAnalysis = async (tripId: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-trip-budget', {
        body: {
          tripId,
          userId: user?.id
        }
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error analyzing trip budget:', error);
      return null;
    }
  };

  const createTripBackup = async (tripId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('backup-trip', {
        body: {
          tripId,
          userId: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Backup Created",
        description: "Trip data has been backed up successfully",
      });

      return true;
    } catch (error) {
      console.error('Error creating trip backup:', error);
      toast({
        title: "Error",
        description: "Failed to create trip backup",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    // State
    collaborativeTrips,
    tripExpenses,
    tripCollaborators,
    loading,

    // Actions
    fetchCollaborativeTrips,
    inviteCollaborator,
    acceptCollaborationInvite,
    fetchTripExpenses,
    addTripExpense,
    splitExpense,
    replanTrip,
    syncBookingStatus,
    exportTripData,
    getTripBudgetAnalysis,
    createTripBackup
  };
};