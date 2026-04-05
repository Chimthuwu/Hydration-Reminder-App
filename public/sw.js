// Simple service worker to enable PWA installation
const CACHE_NAME = 'hydroflow-v1';

self.addEventListener('install', (event) => {
  // @ts-ignore
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // @ts-ignore
  event.respondWith(
    // @ts-ignore
    caches.match(event.request).then((response) => {
      // @ts-ignore
      return response || fetch(event.request);
    })
  );
});
