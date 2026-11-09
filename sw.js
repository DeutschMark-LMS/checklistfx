// Checklist Fx High-Performance Service Worker (v8)
// Implements Stale-While-Revalidate for app shell, Cache-First for Google Fonts,
// clean URL resolution, and Network-Only pass-through for Firebase Firestore/Auth.

const CACHE_NAME = 'checklistfx-pwa-v8';
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

// Helper to resolve an extensionless or .html URL to its matching precached .html shell asset
function getMatchingHtmlPath(urlStr) {
  try {
    const u = new URL(urlStr);
    let lastSeg = u.pathname.split('/').filter(Boolean).pop() || 'index';
    lastSeg = lastSeg.toLowerCase().replace(/\.html$/i, '');
    const known = ['app', 'journal', 'playbook', 'analytics', 'profile', 'login', 'signup', 'index'];
    if (known.includes(lastSeg)) {
      return `./${lastSeg}.html`;
    }
  } catch (_) {}
  return './index.html';
}

// Install: precache essential shell assets resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_SHELL.map(async (url) => {
          try {
            const resp = await fetch(url);
            if (resp && (resp.status === 200 || resp.type === 'opaque')) {
              await cache.put(url, resp);
            }
          } catch (_) {}
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== FONT_CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
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
      caches.open(FONT_CACHE_NAME).then(async (fontCache) => {
        const cachedResponse = await fontCache.match(event.request);
        if (cachedResponse) return cachedResponse;
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            fontCache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (_) {
          return new Response('', { status: 408 });
        }
      })
    );
    return;
  }

  // 3. Navigation Requests (HTML Page Transitions): Resilient offline & clean URL handling
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const targetHtml = getMatchingHtmlPath(event.request.url);
        const cache = await caches.open(CACHE_NAME);

        // Check if target HTML is already cached
        const cachedHtml = await cache.match(targetHtml, { ignoreSearch: true });

        // Trigger network fetch in background to revalidate
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(targetHtml, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        // If we already have the cached HTML, return it immediately for instant transitions
        if (cachedHtml) {
          fetchPromise.catch(() => {});
          return cachedHtml;
        }

        // Otherwise wait for network response
        const netResp = await fetchPromise;
        if (netResp && (netResp.status === 200 || netResp.type === 'opaqueredirect')) {
          return netResp;
        }

        // If network failed or returned 404, fallback to cached HTML
        const fallback = (await cache.match(targetHtml, { ignoreSearch: true })) ||
                         (await cache.match('./app.html', { ignoreSearch: true })) ||
                         (await cache.match('./index.html', { ignoreSearch: true }));
        if (fallback) {
          return fallback;
        }

        return netResp || new Response('Offline - Page not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
      })()
    );
    return;
  }

  // 4. App Shell & Static Assets: Stale-While-Revalidate with search query tolerance
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request, { ignoreSearch: true });
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => null);

      if (cachedResponse) {
        fetchPromise.catch(() => {});
        return cachedResponse;
      }

      const netResp = await fetchPromise;
      return netResp || new Response('Asset unavailable offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    })
  );
});
