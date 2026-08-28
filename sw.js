const CACHE_NAME = 'portfolio-v1.1.0';
const CORE_ASSETS = [
  './',
  './index.html',
  './404.html',
  './style.css',
  './script.js',
  './manifest.webmanifest',
  './favicon.ico',
  './assets/favicon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/avatar.avif',
  './assets/avatar.webp',
  './assets/og-image.webp',
  './assets/fonts/i7dPIFZifjKcF5UAWdDRYEF8RQ.woff2',
  './assets/fonts/i7dMIFZifjKcF5UAWdDRaPpZUFWaHg.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache-first for same-origin static assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        }).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./404.html') || caches.match('./index.html');
          }
        });
      })
    );
  }
});
