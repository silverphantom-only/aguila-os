const CACHE  = 'modo-aguila-v2';
const ASSETS = [
  './',
  './index.html',
  './calendario.html',
  './style.css',
  './app.js',
  './calendario.js',
  './manifest.json',
  './eagle1.png',
  './eagle2.png',
  './eagle3.png',
  './eagle4.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request)
        .then(res => {
          if (res && res.status === 200 && res.type === 'basic') {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() => null);
      return cached || fresh;
    })
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(data.title || '🦅 Modo Águila', {
    body:    data.body || 'Mantén el foco. El águila no descansa.',
    icon:    './icons/icon-192.png',
    badge:   './icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag:     'modo-aguila'
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./index.html'));
});
