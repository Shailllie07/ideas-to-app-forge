import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;
export type BookingInsert = TablesInsert<'bookings'>;
export type BookingUpdate = TablesUpdate<'bookings'>;

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false });

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

      setBookings(prev => [data, ...prev]);
      
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

  const updateBooking = async (bookingId: string, updates: BookingUpdate) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      setBookings(prev => prev.map(booking => booking.id === bookingId ? data : booking));
      
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

      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
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
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingsByTrip,
    getBookingsByType,
    refetch: fetchBookings,
  };
};