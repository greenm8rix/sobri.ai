// Service Worker for Soberi.ai
const CACHE_NAME = 'Soberiai-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // Removed non-existent icon files
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('SW: install event - new version detected.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: activate event - new version activated.');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Listener for messages from the client (e.g., to manually trigger skipWaiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: SKIP_WAITING message received, calling skipWaiting().');
    self.skipWaiting();
  }
  // Handle other messages if needed
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // If network fails and it's a navigation request, return the cached homepage
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }

          // For image requests, you could return a fallback image
          if (event.request.destination === 'image') {
            return caches.match('/fallback-image.png');
          }

          // Otherwise just return nothing
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checkins') {
    event.waitUntil(syncCheckIns());
  } else if (event.tag === 'sync-journal') {
    event.waitUntil(syncJournal());
  } else if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

// Helper function to sync check-ins when online
async function syncCheckIns() {
  // In a real app, this would send data to your backend
  // For now, we'll just log that sync would happen
  console.log('Would sync check-ins with server');
}

// Helper function to sync journal entries when online
async function syncJournal() {
  console.log('Would sync journal entries with server');
}

// Helper function to sync tasks when online
async function syncTasks() {
  console.log('Would sync tasks with server');
}

// Push notification event listener
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/android/android-launchericon-192-192.png',
    badge: '/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});