/* Colorcode Reader: offline copy.
   Change VERSION whenever index.html is replaced, so phones pick up the new page. */
const VERSION = "colorcode-reader-2ring-2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Answer from the saved copy straight away, and refresh that copy in the background when online. */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(event.request, { ignoreSearch: true }).then(saved => {
        const fresh = fetch(event.request).then(reply => {
          if (reply && reply.ok && new URL(event.request.url).origin === self.location.origin) cache.put(event.request, reply.clone());
          return reply;
        }).catch(() => saved);
        return saved || fresh;
      })
    )
  );
});
