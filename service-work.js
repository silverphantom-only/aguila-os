const CACHE_NAME="aguila-os-v1";

const urls=[
"./",
"./index.html",
"./style.css",
"./app.js",
"./balgham.png",
"./progreso.png",
"./aguila.png"
];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urls)));
});

self.addEventListener("fetch",e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
