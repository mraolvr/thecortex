const CACHE_NAME = 'cortex-cache-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
    '/',
    '/offline.html',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/assets/logo.png'
];

// Cache strategies
const strategies = {
    // Cache first, then network
    cacheFirst: async (request) => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        try {
            const networkResponse = await fetch(request);
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        } catch (error) {
            if (request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
            }
            throw error;
        }
    },

    // Network first, then cache
    networkFirst: async (request) => {
        try {
            const networkResponse = await fetch(request);
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        } catch (error) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            if (request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
            }
            throw error;
        }
    },

    // Stale while revalidate
    staleWhileRevalidate: async (request) => {
        const cachedResponse = await caches.match(request);
        const fetchPromise = fetch(request).then(async (networkResponse) => {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        });
        return cachedResponse || fetchPromise;
    }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle API requests with network-first strategy
    if (request.url.includes('/api/')) {
        event.respondWith(strategies.networkFirst(request));
        return;
    }

    // Handle static assets with cache-first strategy
    if (request.destination === 'style' || 
        request.destination === 'script' || 
        request.destination === 'image') {
        event.respondWith(strategies.cacheFirst(request));
        return;
    }

    // Handle navigation requests with stale-while-revalidate
    if (request.mode === 'navigate') {
        event.respondWith(strategies.staleWhileRevalidate(request));
        return;
    }

    // Default to network-first for other requests
    event.respondWith(strategies.networkFirst(request));
});

// Background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-posts') {
        event.waitUntil(syncPosts());
    }
});

async function syncPosts() {
    const db = await openDB();
    const posts = await db.getAll('pendingPosts');
    
    for (const post of posts) {
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${post.token}`
                },
                body: JSON.stringify(post.data)
            });

            if (response.ok) {
                await db.delete('pendingPosts', post.id);
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
}

// Push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/assets/logo.png',
        badge: '/assets/badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View',
                icon: '/assets/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Cortex', options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function to open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('cortex-sync', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('pendingPosts')) {
                db.createObjectStore('pendingPosts', { keyPath: 'id' });
            }
        };
    });
} 