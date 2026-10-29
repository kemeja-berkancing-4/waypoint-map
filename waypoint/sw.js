const CACHE_NAME = 'waypoint-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/css/main.css',
  '/src/js/config.js',
  '/src/js/storage.js',
  '/src/js/map.js',
  '/src/js/app.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});