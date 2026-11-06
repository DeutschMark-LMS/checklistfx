// Checklist Fx High-Performance Service Worker (v3)
// Implements Stale-While-Revalidate for app shell, Cache-First for Google Fonts,
// and Network-Only pass-through for Firebase Firestore/Auth.

const CACHE_NAME = 'checklistfx-pwa-v3';
const FONT_CACHE_NAME = 'checklistfx-fonts-v1';

const PRECACHE_SHELL = [
  './',
  './index.html',
  './app.html',
  './journal.html',
  './playbook.html',
  './analytics.html',
  './profile.html',
  './login.html',
  './signup.html',
  './style.css',
  './app.js',
  './guardian.js',
  './firebaseClient.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];

// Install: precache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_SHELL).catch((err) => {
        console.warn('[SW] Precache shell asset warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== FONT_CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate for local files; Cache-First for Fonts; Network-Only for APIs
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // 1. Never cache Firebase Auth, Google Auth, or Firestore Database queries
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com')
  ) {
    return;
  }

  // 2. Google Fonts: Cache-First strategy for instant, non-blocking typography
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then((fontCache) => {
        return fontCache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              fontCache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 3. App Shell & Local Assets: Stale-While-Revalidate
  // Serves cached version immediately (instant 5-15ms load) while fetching latest in background
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          // If offline and request is navigation, fallback to cached app shell
          if (event.request.mode === 'navigate') {
            return caches.match('./app.html') || caches.match('./index.html');
          }
          return null;
        });

        // Return instant cached response if available, else wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
