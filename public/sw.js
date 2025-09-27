// Service Worker for JourneyXWave PWA
const CACHE_NAME = 'journeyxwave-v2';
const OFFLINE_CACHE = 'offline-v1';

// Cache essential assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Supabase API calls
  if (url.hostname.includes('supabase.co')) {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Serving from cache:', request.url);
          return cachedResponse;
        }

        // Network request with caching
        return fetch(request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.log('Network request failed:', error);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html')
                .then((offlineResponse) => {
                  return offlineResponse || new Response('Offline - Please check your connection', {
                    status: 503,
                    statusText: 'Service Unavailable'
                  });
                });
            }
            
            throw error;
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);

  let notificationData = {
    title: 'JourneyXWave',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'default'
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.priority === 'high',
      actions: notificationData.actions || [],
      data: notificationData.data || {}
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a tab open with our app
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'emergency-sync') {
    event.waitUntil(syncEmergencyData());
  } else if (event.tag === 'location-sync') {
    event.waitUntil(syncLocationData());
  } else if (event.tag === 'booking-sync') {
    event.waitUntil(syncBookingData());
  }
});

// Sync functions
async function syncEmergencyData() {
  try {
    console.log('Syncing emergency data...');
    // Implementation for syncing emergency data
    return true;
  } catch (error) {
    console.error('Emergency sync failed:', error);
    throw error;
  }
}

async function syncLocationData() {
  try {
    console.log('Syncing location data...');
    // Implementation for syncing location data
    return true;
  } catch (error) {
    console.error('Location sync failed:', error);
    throw error;
  }
}

async function syncBookingData() {
  try {
    console.log('Syncing booking data...');
    // Implementation for syncing booking data
    return true;
  } catch (error) {
    console.error('Booking sync failed:', error);
    throw error;
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync:', event.tag);
  
  if (event.tag === 'location-update') {
    event.waitUntil(updateLocationPeriodically());
  }
});

async function updateLocationPeriodically() {
  try {
    console.log('Periodic location update...');
    // Implementation for periodic location updates
    return true;
  } catch (error) {
    console.error('Periodic location update failed:', error);
    throw error;
  }
}