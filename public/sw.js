// Service Worker for PWA functionality
const CACHE_NAME = 'pokemon-hub-v1.0.0';
const API_CACHE_NAME = 'pokemon-api-v1.0.0';
const STATIC_CACHE_NAME = 'pokemon-static-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/manifest.json',
  '/pokeball.svg',
  // Add critical assets here
];

// API endpoints to cache
const API_PATTERNS = [
  /^https:\/\/pokeapi\.co\/api\/v2\//,
  /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      }),
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== STATIC_CACHE_NAME
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with cache-first strategy for better performance
  if (API_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
          // Return cached response immediately
          return cachedResponse;
        }

        try {
          // Fetch from network
          const networkResponse = await fetch(request);

          // Cache successful responses
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          console.log('Service Worker: Network fetch failed for API:', request.url);
          // Return a fallback response for API failures
          return new Response(
            JSON.stringify({ error: 'Network unavailable', offline: true }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      })
    );
    return;
  }

  // Handle static files with cache-first strategy
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // Cache successful responses
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }

          return networkResponse;
        }).catch(() => {
          // Return offline fallback for HTML pages
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/') || new Response(
              '<h1>Offline</h1><p>Please check your internet connection.</p>',
              {
                headers: { 'Content-Type': 'text/html' },
              }
            );
          }

          throw error;
        });
      })
    );
  }
});

// Background sync for team data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag);

  if (event.tag === 'sync-teams') {
    event.waitUntil(syncTeamData());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  const options = {
    body: event.data?.text() || 'New update available!',
    icon: '/pokeball.svg',
    badge: '/pokeball.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-96x96.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Pokémon Hub', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_TEAM') {
    cacheTeamData(event.data.teamData);
  }
});

// Helper function to sync team data
async function syncTeamData() {
  try {
    console.log('Service Worker: Syncing team data...');

    // Get pending team data from IndexedDB or localStorage
    const teams = await getPendingTeams();

    for (const team of teams) {
      try {
        // Attempt to sync each team
        await syncSingleTeam(team);
        await removePendingTeam(team.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync team:', team.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Sync failed:', error);
  }
}

// Helper function to cache team data
async function cacheTeamData(teamData) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(teamData), {
      headers: { 'Content-Type': 'application/json' },
    });

    await cache.put(`/teams/${teamData.id}`, response);
    console.log('Service Worker: Team data cached:', teamData.id);
  } catch (error) {
    console.error('Service Worker: Failed to cache team data:', error);
  }
}

// Placeholder functions for team sync (implement based on your backend)
async function getPendingTeams() {
  return []; // Implement based on your storage strategy
}

async function syncSingleTeam(team) {
  // Implement team sync logic
  console.log('Syncing team:', team);
}

async function removePendingTeam(teamId) {
  // Implement team removal logic
  console.log('Removing pending team:', teamId);
}