const CACHE_NAME = "aguila-final-v2";

const urls = [
"./",
"./index.html",
"./app.js",
"./manifest.json"
];

self.addEventListener("install", e => {
e.waitUntil(
caches.open(CACHE_NAME).then(cache => cache.addAll(urls))
);
self.skipWaiting();
});

self.addEventListener("fetch", e => {
e.respondWith(
caches.match(e.request).then(res => res || fetch(e.request))
);
});
