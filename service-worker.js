/* Caches the app shell so the page loads instantly and works offline.
   Data calls (Apps Script) are always network-first and are NOT cached. */
const CACHE = "shopkiraana-recv-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  // Never cache the Apps Script API — always go to network.
  if (url.indexOf("script.google.com") >= 0 || url.indexOf("googleusercontent.com") >= 0) {
    return; // default network handling
  }
  // App shell: cache-first, fall back to network.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => hit))
  );
});
