// Checklist Fx High-Performance Service Worker (v6)
// Implements Stale-While-Revalidate for app shell, Cache-First for Google Fonts,
// extensionless path resolution to .html assets, and Network-Only pass-through for Firebase Firestore/Auth.

const CACHE_NAME = 'checklistfx-pwa-v6';
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

// Helper to resolve an extensionless URL to its matching .html shell asset
function getMatchingHtmlPath(urlStr) {
  try {
    const u = new URL(urlStr);
    const lastSeg = u.pathname.split('/').filter(Boolean).pop() || '';
    if (lastSeg && !lastSeg.includes('.')) {
      const known = ['app', 'journal', 'playbook', 'analytics', 'profile', 'login', 'signup', 'index'];
      if (known.includes(lastSeg.toLowerCase())) {
        return `./${lastSeg.toLowerCase()}.html`;
      }
    }
  } catch (_) {}
  return null;
}

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

  // 3. App Shell & Local Assets: Stale-While-Revalidate with resilient extensionless fallback
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // If exact cache match exists, return it and revalidate in background
        if (cachedResponse) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
          }).catch(() => {});
          return cachedResponse;
        }

        // If request is extensionless (e.g. /journal), resolve to cached .html asset immediately
        const htmlFallbackPath = getMatchingHtmlPath(event.request.url);
        if (htmlFallbackPath) {
          return cache.match(htmlFallbackPath).then((htmlCached) => {
            if (htmlCached) {
              return htmlCached;
            }
            return fetch(event.request).then((netResp) => {
              if (netResp && netResp.status === 200) {
                cache.put(event.request, netResp.clone());
                return netResp;
              }
              // If server returned 404 for extensionless URL, fallback to cached HTML
              return cache.match(htmlFallbackPath) || cache.match('./app.html') || cache.match('./index.html');
            }).catch(() => {
              return cache.match(htmlFallbackPath) || cache.match('./app.html') || cache.match('./index.html');
            });
          });
        }

        // Standard fetch with offline navigation safety net
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          if (event.request.mode === 'navigate') {
            return cache.match('./app.html') || cache.match('./index.html');
          }
          return new Response('Network offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        });
      });
    })
  );
});
