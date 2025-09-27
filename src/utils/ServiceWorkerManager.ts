import { pushNotificationService } from './PushNotificationService';

export interface SyncData {
  type: 'emergency' | 'location' | 'booking' | 'notification';
  data: any;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', this.registration);

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, notify user
              this.notifyUserOfUpdate();
            }
          });
        }
      });

      // Initialize push notifications
      await pushNotificationService.initialize();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  private notifyUserOfUpdate(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version of JourneyXWave is available. Refresh to update.',
        icon: '/icon-192.png',
        tag: 'app-update',
        requireInteraction: true
      });
    }
  }

  async requestBackgroundSync(tag: string, data?: SyncData): Promise<boolean> {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return false;
    }

    try {
      if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
        // Store sync data in IndexedDB for retrieval by service worker
        if (data) {
          await this.storeSyncData(tag, data);
        }

        await (this.registration as any).sync.register(tag);
        console.log(`Background sync registered: ${tag}`);
        return true;
      } else {
        console.warn('Background sync not supported');
        return false;
      }
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }

  async requestPeriodicSync(tag: string, minInterval: number = 24 * 60 * 60 * 1000): Promise<boolean> {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return false;
    }

    try {
      if ('serviceWorker' in navigator && 'periodicSync' in (window as any).ServiceWorkerRegistration.prototype) {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName
        });

        if (status.state === 'granted') {
          await (this.registration as any).periodicSync.register(tag, {
            minInterval
          });
          console.log(`Periodic sync registered: ${tag}`);
          return true;
        }
      }
      
      console.warn('Periodic sync not supported or not granted');
      return false;
    } catch (error) {
      console.error('Periodic sync registration failed:', error);
      return false;
    }
  }

  private async storeSyncData(tag: string, data: SyncData): Promise<void> {
    try {
      const db = await this.openSyncDB();
      const transaction = db.transaction('sync_data', 'readwrite');
      const store = transaction.objectStore('sync_data');

      await store.put({
        tag,
        data,
        created_at: Date.now()
      });

      console.log(`Sync data stored for tag: ${tag}`);
    } catch (error) {
      console.error('Failed to store sync data:', error);
    }
  }

  private async openSyncDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('JourneyXWaveSync', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('sync_data')) {
          const store = db.createObjectStore('sync_data', { keyPath: 'tag' });
          store.createIndex('created_at', 'created_at');
        }

        if (!db.objectStoreNames.contains('offline_cache')) {
          const cacheStore = db.createObjectStore('offline_cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async scheduleEmergencySync(emergencyData: any): Promise<boolean> {
    const syncData: SyncData = {
      type: 'emergency',
      data: emergencyData,
      timestamp: Date.now(),
      priority: 'high'
    };

    return await this.requestBackgroundSync('emergency-sync', syncData);
  }

  async scheduleLocationSync(locationData: any): Promise<boolean> {
    const syncData: SyncData = {
      type: 'location',
      data: locationData,
      timestamp: Date.now(),
      priority: 'normal'
    };

    return await this.requestBackgroundSync('location-sync', syncData);
  }

  async scheduleBookingSync(bookingData: any): Promise<boolean> {
    const syncData: SyncData = {
      type: 'booking',
      data: bookingData,
      timestamp: Date.now(),
      priority: 'normal'
    };

    return await this.requestBackgroundSync('booking-sync', syncData);
  }

  async cacheDataOffline(key: string, data: any, ttl: number = 86400000): Promise<boolean> {
    try {
      const db = await this.openSyncDB();
      const transaction = db.transaction('offline_cache', 'readwrite');
      const store = transaction.objectStore('offline_cache');

      await store.put({
        key,
        data,
        timestamp: Date.now(),
        expires_at: Date.now() + ttl
      });

      console.log(`Data cached offline: ${key}`);
      return true;
    } catch (error) {
      console.error('Failed to cache data offline:', error);
      return false;
    }
  }

  async getCachedData(key: string): Promise<any | null> {
    try {
      const db = await this.openSyncDB();
      const transaction = db.transaction('offline_cache', 'readonly');
      const store = transaction.objectStore('offline_cache');

      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (result && result.expires_at > Date.now()) {
        return result.data;
      } else if (result) {
        // Data expired, remove it
        await this.removeCachedData(key);
      }

      return null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  async removeCachedData(key: string): Promise<boolean> {
    try {
      const db = await this.openSyncDB();
      const transaction = db.transaction('offline_cache', 'readwrite');
      const store = transaction.objectStore('offline_cache');

      await store.delete(key);
      return true;
    } catch (error) {
      console.error('Failed to remove cached data:', error);
      return false;
    }
  }

  async clearExpiredCache(): Promise<boolean> {
    try {
      const db = await this.openSyncDB();
      const transaction = db.transaction('offline_cache', 'readwrite');
      const store = transaction.objectStore('offline_cache');

      const now = Date.now();
      const index = store.index('timestamp');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record = cursor.value;
          if (record.expires_at < now) {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      return true;
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
      return false;
    }
  }

  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  isRegistered(): boolean {
    return this.registration !== null;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();