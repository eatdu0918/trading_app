const CACHE_VERSION = 'v1';
const STATIC_CACHE = `trading-static-${CACHE_VERSION}`;
const API_CACHE = `trading-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Binance REST API klines endpoint (OHLCV history)
const BINANCE_API_ORIGIN = 'https://api.binance.com';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache Binance klines with stale-while-revalidate (30s TTL)
  if (url.origin === BINANCE_API_ORIGIN && url.pathname.includes('/klines')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE, 30_000));
    return;
  }

  // Network-first for Next.js pages / API routes
  if (url.origin === self.location.origin && !url.pathname.startsWith('/_next/static/')) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // Cache-first for static assets (_next/static)
  if (url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName, maxAgeMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchAndCache = fetch(request).then((response) => {
    if (response.ok) {
      const clone = response.clone();
      cache.put(request, clone);
    }
    return response;
  });

  if (cached) {
    const dateHeader = cached.headers.get('date');
    if (dateHeader) {
      const age = Date.now() - new Date(dateHeader).getTime();
      if (age < maxAgeMs) return cached;
    } else {
      return cached;
    }
  }

  return fetchAndCache;
}
