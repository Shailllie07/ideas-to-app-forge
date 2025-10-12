import { supabase } from '@/integrations/supabase/client';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationSubscriptionData {
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  device_info?: any;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);

      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('Already subscribed to push notifications');
        return true;
      }

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      // Use the public VAPID key from your app
      const vapidPublicKey = 'BP5yZfQ7ZEE5c8cK5K9tK8cK5K9tK8cK5K9tK8cK5K9tK8cK5K9tK8cK5K9tK8cK5K9tK8cK5K9tK8cK5K9tK8cK5K9t'; // This would be your actual VAPID key
      
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // Save subscription to database
      await this.saveSubscription();

      console.log('Push subscription created:', this.subscription);
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const result = await this.subscription.unsubscribe();
      
      if (result) {
        // Remove subscription from database
        await this.removeSubscription();
        this.subscription = null;
        console.log('Successfully unsubscribed from push notifications');
      }

      return result;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  private async saveSubscription(): Promise<void> {
    if (!this.subscription) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const subscriptionData: NotificationSubscriptionData = {
      user_id: user.id,
      endpoint: this.subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(this.subscription.getKey('auth')!)
      },
      device_info: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };

    // Store subscription in Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert([subscriptionData], {
        onConflict: 'user_id,endpoint'
      });

    if (error) {
      console.error('Failed to save push subscription:', error);
      throw error;
    }
  }

  private async removeSubscription(): Promise<void> {
    if (!this.subscription) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', this.subscription.endpoint);

    if (error) {
      console.error('Failed to remove push subscription:', error);
    }
  }

  async sendLocalNotification(payload: PushNotificationPayload): Promise<void> {
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/badge-72.png',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: payload.priority === 'high'
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      if (payload.data?.url) {
        window.location.href = payload.data.url;
      }
      
      notification.close();
    };
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray as Uint8Array<ArrayBuffer>;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return window.btoa(binary);
  }

  // Check if push notifications are supported and enabled
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  getSubscription(): PushSubscription | null {
    return this.subscription;
  }
}

export const pushNotificationService = new PushNotificationService();