/* SubTrack service worker — app shell caching.
 * Strategy:
 *   - HTML navigations: NetworkFirst (3s) so deploys propagate fast.
 *   - JS/CSS:           StaleWhileRevalidate.
 *   - Images/fonts:     CacheFirst with size cap.
 *   - API/_serverFn:    NEVER cached (always network).
 */
const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const IMAGE_CACHE = `images-${VERSION}`;
const CACHE_NAMES = [SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE];

const PRECACHE = ["/", "/app", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !CACHE_NAMES.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

function isBypass(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_serverFn/") ||
    url.pathname.startsWith("/~oauth") ||
    url.pathname.includes("supabase.co") ||
    url.search.includes("__lovable_token")
  );
}

async function networkFirst(request, cacheName, timeoutMs = 3000) {
  const cache = await caches.open(cacheName);
  try {
    const network = await Promise.race([
      fetch(request),
      new Promise((_, r) => setTimeout(() => r(new Error("timeout")), timeoutMs)),
    ]);
    if (network && network.ok) cache.put(request, network.clone()).catch(() => {});
    return network;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await cache.match("/app");
    if (fallback) return fallback;
    throw new Error("offline-no-cache");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function cacheFirst(request, cacheName, maxEntries = 60) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res && res.ok) {
    cache.put(request, res.clone()).catch(() => {});
    // best-effort prune
    cache.keys().then((keys) => {
      if (keys.length > maxEntries) cache.delete(keys[0]);
    });
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !/fonts\.(googleapis|gstatic)\.com/.test(url.host)) return;
  if (isBypass(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }
  const dest = request.destination;
  if (dest === "script" || dest === "style" || dest === "worker") {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }
  if (dest === "image" || dest === "font") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }
});

self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});
