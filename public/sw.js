/*
 * Service worker for the journal.
 *
 * - Pages: always try the network first, so a new memory shows up straight
 *   away; fall back to the last copy of that page, then to /offline.
 * - Build assets, fonts and icons: served from cache once fetched (their URLs
 *   change whenever their contents do).
 * - Everything else (photos and videos on Cloudinary, song players, form
 *   posts) goes straight to the network and is never cached here.
 */
const VERSION = "v2";
const PAGES = `journal-pages-${VERSION}`;
const ASSETS = `journal-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

/** Saves the offline page together with the styles, fonts and scripts it needs to look right. */
async function saveOfflinePage() {
  const response = await fetch(new Request(OFFLINE_URL, { cache: "reload" }));
  const html = await response.clone().text();
  await (await caches.open(PAGES)).put(OFFLINE_URL, response);

  const assets = [...new Set(html.match(/\/_next\/static\/[^"'\\\s)]+/g) ?? [])];
  const cache = await caches.open(ASSETS);
  // One missing file must not stop the rest (or the install) from succeeding.
  await Promise.allSettled(assets.map((url) => cache.add(url)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(saveOfflinePage().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== PAGES && key !== ASSETS).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    // The parents' desk depends on the session cookie; never serve it from cache.
    const cacheable = !url.pathname.startsWith("/parents");
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (cacheable && response.ok) {
            const copy = response.clone();
            caches.open(PAGES).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => (cacheable && (await caches.match(request))) || (await caches.match(OFFLINE_URL))),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(ASSETS).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
