const VER = 'ktl-v1';
const ASSETS = [
  '/', '/index.html',
  '/styles/main.css',
  '/scripts/config.js','/scripts/router.js','/scripts/main.js','/scripts/stocks.js','/scripts/mobile.js',
  '/video/fabric-waves.mp4',
  '/img/fabric-waves.jpg',
  '/logo/icon-180.png','/logo/icon-192.png','/logo/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== VER).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VER).then(c => c.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});