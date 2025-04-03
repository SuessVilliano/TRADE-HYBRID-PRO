/**
 * Trade Hybrid Service Worker
 *
 * This service worker handles push notifications and other background tasks.
 */

// Cache name for offline support
const CACHE_NAME = 'tradehybrid-v1';

// Assets to cache for offline support
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/badge.png',
  '/favicon.ico'
];

// Install event handler
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  // Cache static assets for offline support
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(CACHE_ASSETS);
    })
  );
});

// Activate event handler
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker');
  
  // Claim clients to ensure the service worker controls all clients immediately
  event.waitUntil(self.clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('[Service Worker] Removing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event handler for offline support
self.addEventListener('fetch', (event) => {
  // For navigation requests, try the network first, then fall back to the cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // For other requests, try the cache first, then fall back to the network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Push event handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  let notificationData = {};
  
  // Try to parse the notification data
  try {
    if (event.data) {
      notificationData = event.data.json();
      console.log('[Service Worker] Push data:', notificationData);
    }
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
  }
  
  // Default notification options
  const notificationOptions = {
    title: notificationData.title || 'New Notification',
    body: notificationData.body || 'You have a new notification from Trade Hybrid',
    icon: notificationData.icon || '/logo.png',
    badge: notificationData.badge || '/badge.png',
    data: notificationData.data || { url: '/' },
    requireInteraction: true,
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open',
        title: 'Open'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };
  
  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationOptions.title, notificationOptions)
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);
  
  // Close the notification
  event.notification.close();
  
  // Handle notification action
  let action = event.action;
  let notification = event.notification;
  let data = notification.data || {};
  let url = data.url || '/';
  
  // If the user clicked the "open" action or clicked the notification itself
  if (action === 'open' || action === '') {
    // Open the target URL in a focused window/tab
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open with the target URL, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Push subscription change event handler
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[Service Worker] Push subscription changed:', event);
  
  // Re-subscribe the user
  event.waitUntil(
    // Get the current user information from IndexedDB or other storage
    // For now, we'll just log the event
    console.log('[Service Worker] Push subscription needs to be re-established')
    
    // In a real implementation, we would re-subscribe the user with the new subscription
    /*
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        // Send the new subscription to the server
        return fetch('/api/notifications/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription,
            userId: currentUserId // This would need to be retrieved from storage
          })
        });
      })
    */
  );
});

// Log messages about the service worker lifecycle
console.log('[Service Worker] Service Worker Registered');