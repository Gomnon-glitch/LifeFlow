/* ============================================
   LIFEFLOW — Service Worker
   Offline caching + Notification scheduling
   ============================================ */

const CACHE_NAME = 'lifeflow-v3';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './firebase-config.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap'
];

// ============================================
// INSTALL — Cache all assets
// ============================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// ============================================
// ACTIVATE — Clean old caches
// ============================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// ============================================
// FETCH — Network first, fallback to cache (for offline)
// ============================================
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).then((response) => {
            // Update cache with fresh response
            if (response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
        }).catch(() => {
            // Offline: serve from cache
            return caches.match(event.request).then((cached) => {
                return cached || (event.request.destination === 'document'
                    ? caches.match('./index.html')
                    : new Response('Offline', { status: 503 }));
            });
        })
    );
});

// ============================================
// NOTIFICATION CLICK — Open/focus the app
// ============================================
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Focus existing window or open new one
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if (client.url.includes('index.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            return self.clients.openWindow('./index.html');
        })
    );
});

// ============================================
// MESSAGE — Handle notification scheduling from main app
// ============================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
        const reminders = event.data.reminders;
        scheduleNotifications(reminders);
    }

    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, icon, tag } = event.data;
        self.registration.showNotification(title, {
            body,
            icon: icon || './icon-192.png',
            badge: './icon-192.png',
            tag: tag || 'lifeflow-reminder',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            silent: false,
            data: { url: './index.html' }
        });
    }
});

function scheduleNotifications(reminders) {
    // Store reminders for the periodic check
    // Service worker will check these when triggered
    self.reminders = reminders;
}
