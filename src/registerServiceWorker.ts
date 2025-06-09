export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });

        console.log('ServiceWorker registration successful with scope: ', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show notification to user
                showUpdateNotification();
              }
            });
          }
        });

        // Register for push notifications
        requestNotificationPermission();

      } catch (error) {
        console.error('ServiceWorker registration failed: ', error);
      }
    });

    // Handle service worker communication
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker: ', event.data);
      // Handle various messages from service worker
      if (event.data.type === 'CACHE_UPDATED') {
        // Handle cache updates
      }
    });

    // Add offline detection
    window.addEventListener('online', () => {
      console.log('Application is online. Syncing data...');
      // Trigger background sync
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          // Check if Background Sync is supported by the browser and registration object
          if ('sync' in registration) {
            // Cast registration to any or a type that includes BackgroundSyncManager if needed,
            // or ensure your tsconfig.json lib includes 'WebWorker' and potentially 'DOM.BackgroundSync'
            // For a quick fix, we can cast to any to bypass strict type checking here if 'sync' is known to exist at runtime.
            const regWithSync = registration as any; 
            try {
              regWithSync.sync.register('sync-checkins');
              regWithSync.sync.register('sync-journal');
              regWithSync.sync.register('sync-tasks');
              console.log('Background sync registered for checkins, journal, and tasks.');
            } catch (syncError) {
              console.error('Failed to register background sync:', syncError);
            }
          } else {
            console.warn('Background Sync not supported by this browser or service worker registration.');
          }
        });
      }
    });

    window.addEventListener('offline', () => {
      console.log('Application is offline. Data will be synced when connection returns.');
      // Show offline notification to user
      showOfflineNotification();
    });
  }
}

function showUpdateNotification() {
  // Create a notification or UI element to inform the user
  // of available updates
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
  
  `;

  document.body.appendChild(notification);

  document.getElementById('update-app')?.addEventListener('click', () => {
    window.location.reload();
  });
}

function showOfflineNotification() {
  // Create a notification to inform the user they're offline
  const notification = document.createElement('div');
  notification.className = 'offline-notification';
  notification.innerHTML = `
    <div class="p-3 bg-amber-600 text-white fixed top-0 left-0 right-0 text-center z-50">
      <p>You're offline. Some features may be limited.</p>
    </div>
  `;

  const existingNotification = document.querySelector('.offline-notification');
  if (!existingNotification) {
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      // Subscribe to push notifications
      subscribeToPushNotifications();
    }
  }
}

async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;

    // In a real app, you would request a subscription from your server
    // and use the server's public key
    // This is just a placeholder example
    /*
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_KEY')
    });
    
    // Send the subscription to your server
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    */

    console.log('Ready for push notifications');
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
}

// Helper function to convert a base64 string to a Uint8Array
// Needed for the applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}