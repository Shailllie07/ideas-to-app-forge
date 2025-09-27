import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;
export type BookingInsert = TablesInsert<'bookings'>;
export type BookingUpdate = TablesUpdate<'bookings'>;

export const useBookings = (tripId?: string) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalSpent: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchBookingStats();
    }
  }, [user, tripId]);

  // Set up realtime subscription for booking updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}${tripId ? ` AND trip_id=eq.${tripId}` : ''}`
        },
        (payload) => {
          console.log('Booking changed:', payload);
          fetchBookings();
          fetchBookingStats();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Booking Added",
              description: "A new booking has been added to your trip",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Booking Updated",
              description: "Your booking status has been updated",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, tripId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false });

      if (tripId) {
        query = query.eq('trip_id', tripId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('get_user_booking_stats', { user_uuid: user.id });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats({
          totalBookings: Number(data[0].total_bookings || 0),
          pendingBookings: Number(data[0].pending_bookings || 0),
          confirmedBookings: Number(data[0].confirmed_bookings || 0),
          totalSpent: Number(data[0].total_spent || 0)
        });
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  const createBooking = async (bookingData: BookingInsert) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...bookingData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Note: realtime subscription will handle adding to state
      
      toast({
        title: "Booking Created",
        description: "Your booking has been successfully created!",
      });

      return { data, error: null };
    } catch (error) {
      const bookingError = error as Error;
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
      return { data: null, error: bookingError };
    }
  };

  const syncExternalBooking = async (
    tripId: string, 
    bookingType: string, 
    bookingReference: string, 
    provider: string, 
    bookingData?: any
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('booking-sync', {
        body: {
          tripId,
          bookingType,
          bookingReference,
          provider,
          bookingData
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Booking sync failed');
      }

      toast({
        title: "Booking Synchronized",
        description: `Your ${bookingType} booking has been added to your trip`,
      });

      return { data: data.booking, error: null };
    } catch (error) {
      console.error('Error syncing booking:', error);
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "Failed to sync booking",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateBooking = async (bookingId: string, updates: BookingUpdate) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      // Note: realtime subscription will handle updating state
      
      toast({
        title: "Booking Updated",
        description: "Your booking has been successfully updated!",
      });

      return { data, error: null };
    } catch (error) {
      const bookingError = error as Error;
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive",
      });
      return { data: null, error: bookingError };
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      // Note: realtime subscription will handle removing from state
      
      toast({
        title: "Booking Deleted",
        description: "Your booking has been successfully deleted.",
      });

      return { error: null };
    } catch (error) {
      const bookingError = error as Error;
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive",
      });
      return { error: bookingError };
    }
  };

  const getBookingsByTrip = async (tripId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('trip_id', tripId)
        .order('travel_date', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      const bookingError = error as Error;
      return { data: [], error: bookingError };
    }
  };

  const getBookingsByType = async (bookingType: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_type', bookingType)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      const bookingError = error as Error;
      return { data: [], error: bookingError };
    }
  };

  return {
    bookings,
    loading,
    stats,
    createBooking,
    syncExternalBooking,
    updateBooking,
    deleteBooking,
    getBookingsByTrip,
    getBookingsByType,
    refetch: fetchBookings,
  };
};