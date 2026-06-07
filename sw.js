// KPIs Vitales · Service Worker
// Estrategia: stale-while-revalidate — sirve desde caché al instante,
// pero actualiza en segundo plano para que la próxima visita tenga lo último.

const CACHE = 'kpis-vitales-v1';
const ASSETS = [
  'kpis.html',
  'manifest.json',
  'icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    )
  );
});
