import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Notification } from '@/types/database';

export type { Notification } from '@/types/database';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Set up realtime subscription for notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification:', payload);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for high priority notifications
          if (newNotification.priority === 'high') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: newNotification.type === 'emergency' ? 'destructive' : 'default',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('notifications' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      
      const notificationData = (data || []) as Notification[];
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notificationData: Partial<Notification>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await (supabase
        .from('notifications' as any)
        .insert([{
          ...notificationData,
          user_id: user.id,
        }])
        .select()
        .single() as any);

      if (error) throw error;

      const newNotification = data as Notification;
      setNotifications(prev => [newNotification, ...prev]);
      if (!newNotification.is_read) {
        setUnreadCount(prev => prev + 1);
      }
      
      return { data: newNotification, error: null };
    } catch (error) {
      const notificationError = error as Error;
      return { data: null, error: notificationError };
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { data, error } = await (supabase
        .from('notifications' as any)
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single() as any);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return { data: data as Notification, error: null };
    } catch (error) {
      const notificationError = error as Error;
      return { data: null, error: notificationError };
    }
  };

  const markAllAsRead = async () => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await (supabase
        .from('notifications' as any)
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false) as any);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      });

      return { error: null };
    } catch (error) {
      const notificationError = error as Error;
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      });
      return { error: notificationError };
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      
      const { error } = await (supabase
        .from('notifications' as any)
        .delete()
        .eq('id', notificationId) as any);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return { error: null };
    } catch (error) {
      const notificationError = error as Error;
      return { error: notificationError };
    }
  };

  const getNotificationsByType = (type: string) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.is_read);
  };

  return {
    notifications,
    unreadCount,
    loading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsByType,
    getUnreadNotifications,
    refetch: fetchNotifications,
  };
};
