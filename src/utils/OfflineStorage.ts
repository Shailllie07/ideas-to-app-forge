interface OfflineData {
  id: string;
  data: any;
  timestamp: number;
  expires_at?: number;
  type: string;
  priority: 'low' | 'normal' | 'high';
  sync_status: 'pending' | 'synced' | 'failed';
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  priority?: 'low' | 'normal' | 'high';
  encrypt?: boolean;
}

class OfflineStorage {
  private dbName = 'JourneyXWaveOffline';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<boolean> {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported');
      return false;
    }

    try {
      this.db = await this.openDatabase();
      console.log('Offline storage initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
      return false;
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Offline cache store
        if (!db.objectStoreNames.contains('offline_cache')) {
          const cacheStore = db.createObjectStore('offline_cache', { keyPath: 'id' });
          cacheStore.createIndex('type', 'type');
          cacheStore.createIndex('timestamp', 'timestamp');
          cacheStore.createIndex('expires_at', 'expires_at');
          cacheStore.createIndex('priority', 'priority');
          cacheStore.createIndex('sync_status', 'sync_status');
        }

        // Trip data store
        if (!db.objectStoreNames.contains('trips_offline')) {
          const tripsStore = db.createObjectStore('trips_offline', { keyPath: 'id' });
          tripsStore.createIndex('user_id', 'user_id');
          tripsStore.createIndex('status', 'status');
          tripsStore.createIndex('updated_at', 'updated_at');
        }

        // Bookings data store
        if (!db.objectStoreNames.contains('bookings_offline')) {
          const bookingsStore = db.createObjectStore('bookings_offline', { keyPath: 'id' });
          bookingsStore.createIndex('user_id', 'user_id');
          bookingsStore.createIndex('trip_id', 'trip_id');
          bookingsStore.createIndex('updated_at', 'updated_at');
        }

        // Maps data store
        if (!db.objectStoreNames.contains('maps_offline')) {
          const mapsStore = db.createObjectStore('maps_offline', { keyPath: 'id' });
          mapsStore.createIndex('region', 'region');
          mapsStore.createIndex('download_date', 'download_date');
        }

        // Emergency data store
        if (!db.objectStoreNames.contains('emergency_offline')) {
          const emergencyStore = db.createObjectStore('emergency_offline', { keyPath: 'id' });
          emergencyStore.createIndex('user_id', 'user_id');
          emergencyStore.createIndex('type', 'type');
          emergencyStore.createIndex('updated_at', 'updated_at');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('priority', 'priority');
          syncStore.createIndex('created_at', 'created_at');
          syncStore.createIndex('status', 'status');
        }
      };
    });
  }

  async setItem(key: string, data: any, options: CacheOptions = {}): Promise<boolean> {
    if (!this.db) {
      console.warn('Database not initialized');
      return false;
    }

    try {
      const transaction = this.db.transaction('offline_cache', 'readwrite');
      const store = transaction.objectStore('offline_cache');

      const item: OfflineData = {
        id: key,
        data: options.encrypt ? await this.encryptData(data) : data,
        timestamp: Date.now(),
        expires_at: options.ttl ? Date.now() + options.ttl : undefined,
        type: this.getDataType(data),
        priority: options.priority || 'normal',
        sync_status: 'synced'
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(item);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`Offline storage: Item cached - ${key}`);
      return true;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      return false;
    }
  }

  async getItem(key: string): Promise<any | null> {
    if (!this.db) {
      console.warn('Database not initialized');
      return null;
    }

    try {
      const transaction = this.db.transaction('offline_cache', 'readonly');
      const store = transaction.objectStore('offline_cache');

      const result = await new Promise<OfflineData | undefined>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!result) {
        return null;
      }

      // Check expiration
      if (result.expires_at && result.expires_at < Date.now()) {
        await this.removeItem(key);
        return null;
      }

      // Decrypt if needed
      if (this.isEncrypted(result.data)) {
        return await this.decryptData(result.data);
      }

      return result.data;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction('offline_cache', 'readwrite');
      const store = transaction.objectStore('offline_cache');

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return true;
    } catch (error) {
      console.error('Failed to remove offline data:', error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction('offline_cache', 'readwrite');
      const store = transaction.objectStore('offline_cache');

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('Offline storage cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear offline storage:', error);
      return false;
    }
  }

  async cleanup(): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction('offline_cache', 'readwrite');
      const store = transaction.objectStore('offline_cache');
      const index = store.index('expires_at');

      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);

      await new Promise<void>((resolve, reject) => {
        const request = index.openCursor(range);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });

      console.log('Offline storage cleanup completed');
      return true;
    } catch (error) {
      console.error('Failed to cleanup offline storage:', error);
      return false;
    }
  }

  async getStorageInfo(): Promise<{
    totalItems: number;
    totalSize: number;
    itemsByType: Record<string, number>;
  }> {
    if (!this.db) {
      return { totalItems: 0, totalSize: 0, itemsByType: {} };
    }

    try {
      const transaction = this.db.transaction('offline_cache', 'readonly');
      const store = transaction.objectStore('offline_cache');

      const items = await new Promise<OfflineData[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const totalItems = items.length;
      const totalSize = items.reduce((size, item) => {
        return size + JSON.stringify(item).length;
      }, 0);

      const itemsByType = items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { totalItems, totalSize, itemsByType };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalItems: 0, totalSize: 0, itemsByType: {} };
    }
  }

  // Trip-specific methods
  async storeTrip(trip: any): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction('trips_offline', 'readwrite');
      const store = transaction.objectStore('trips_offline');

      await new Promise<void>((resolve, reject) => {
        const request = store.put({ ...trip, updated_at: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return true;
    } catch (error) {
      console.error('Failed to store trip offline:', error);
      return false;
    }
  }

  async getTrips(userId: string): Promise<any[]> {
    if (!this.db) return [];

    try {
      const transaction = this.db.transaction('trips_offline', 'readonly');
      const store = transaction.objectStore('trips_offline');
      const index = store.index('user_id');

      const trips = await new Promise<any[]>((resolve, reject) => {
        const request = index.getAll(userId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return trips.sort((a, b) => b.updated_at - a.updated_at);
    } catch (error) {
      console.error('Failed to get offline trips:', error);
      return [];
    }
  }

  // Emergency-specific methods
  async storeEmergencyContacts(userId: string, contacts: any[]): Promise<boolean> {
    if (!this.db) return false;

    try {
      const transaction = this.db.transaction('emergency_offline', 'readwrite');
      const store = transaction.objectStore('emergency_offline');

      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          id: `emergency_contacts_${userId}`,
          user_id: userId,
          type: 'emergency_contacts',
          data: contacts,
          updated_at: Date.now()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      return true;
    } catch (error) {
      console.error('Failed to store emergency contacts offline:', error);
      return false;
    }
  }

  async getEmergencyContacts(userId: string): Promise<any[]> {
    if (!this.db) return [];

    try {
      const transaction = this.db.transaction('emergency_offline', 'readonly');
      const store = transaction.objectStore('emergency_offline');

      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(`emergency_contacts_${userId}`);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return result?.data || [];
    } catch (error) {
      console.error('Failed to get emergency contacts offline:', error);
      return [];
    }
  }

  private getDataType(data: any): string {
    if (Array.isArray(data)) return 'array';
    if (data && typeof data === 'object') {
      if (data.id && data.title) return 'trip';
      if (data.id && data.booking_type) return 'booking';
      if (data.phone && data.name) return 'emergency_contact';
    }
    return 'generic';
  }

  private async encryptData(data: any): Promise<string> {
    // Simple base64 encoding for now
    // In production, use proper encryption
    return btoa(JSON.stringify(data));
  }

  private async decryptData(encryptedData: string): Promise<any> {
    try {
      return JSON.parse(atob(encryptedData));
    } catch {
      return encryptedData;
    }
  }

  private isEncrypted(data: any): boolean {
    return typeof data === 'string' && data.length > 0 && !data.includes('{');
  }
}

export const offlineStorage = new OfflineStorage();