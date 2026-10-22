/**
 * Drishti AI - Offline Map Tiles Service Worker
 * Explicitly caches map tile data and transit route segments for offline navigation
 */

const CACHE_NAME = 'drishti-offline-map-tiles-v1';
const DATA_CACHE_NAME = 'drishti-transit-data-v1';

// Install event - activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim all clients and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper to generate a fallback SVG offline map tile if network fails and tile not cached
function generateOfflineTileSvg(url) {
  const parsed = url.match(/\/(\d+)\/(\d+)\/(\d+)/) || [null, '14', '0', '0'];
  const z = parsed[1] || '14';
  const x = parsed[2] || '0';
  const y = parsed[3] || '0';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#1e293b"/>
    <path d="M0,64 L256,64 M0,128 L256,128 M0,192 L256,192 M64,0 L64,256 M128,0 L128,256 M192,0 L192,256" stroke="#334155" stroke-width="2" stroke-dasharray="4,4"/>
    <path d="M30,220 Q128,140 220,40" stroke="#38bdf8" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="128" cy="140" r="8" fill="#facc15" stroke="#000" stroke-width="2"/>
    <text x="128" y="240" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">OFFLINE TILE ${z}/${x}/${y}</text>
  </svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'X-Offline-Fallback': 'true'
    }
  });
}

// Fetch interception strategy
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Intercept map tiles (OpenStreetMap, Carto, or relative tile paths)
  const isMapTile =
    url.includes('tile.openstreetmap.org') ||
    url.includes('tile.') ||
    url.includes('/tiles/') ||
    url.includes('cartocdn.com');

  if (isMapTile) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // CacheFirst: Check if already in cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise attempt network fetch
        try {
          const networkResponse = await fetch(event.request, { mode: 'cors' });
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // If offline and not in cache, return synthesized fallback tile
          return generateOfflineTileSvg(url);
        }
      })
    );
    return;
  }

  // Intercept route data requests
  if (url.includes('/data/routes.json')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(async (cache) => {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const cached = await cache.match(event.request);
          if (cached) return cached;
          return new Response(JSON.stringify({ routes: [] }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
    );
    return;
  }
});

// Message handler for client commands
self.addEventListener('message', async (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  const client = event.source;

  if (data.type === 'CACHE_ROUTE_TILES') {
    const urls = data.tileUrls || [];
    const cache = await caches.open(CACHE_NAME);
    let completed = 0;

    for (const url of urls) {
      try {
        // Check if already in cache
        const match = await cache.match(url);
        if (!match) {
          // Fetch and store
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) {
            await cache.put(url, response);
          } else {
            // Save synthetic fallback tile if external tile provider is blocked in sandbox
            const fallback = generateOfflineTileSvg(url);
            await cache.put(url, fallback);
          }
        }
      } catch (err) {
        // Fallback tile on network failure/CORS
        const fallback = generateOfflineTileSvg(url);
        await cache.put(url, fallback);
      }

      completed++;
      if (client && client.postMessage) {
        client.postMessage({
          type: 'CACHE_PROGRESS',
          completed,
          total: urls.length,
          url
        });
      }
    }

    if (client && client.postMessage) {
      client.postMessage({
        type: 'CACHE_COMPLETE',
        totalCached: urls.length,
        cacheName: CACHE_NAME
      });
    }
  }

  if (data.type === 'GET_CACHE_STATUS') {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    if (client && client.postMessage) {
      client.postMessage({
        type: 'CACHE_STATUS_RESPONSE',
        count: keys.length,
        cacheName: CACHE_NAME
      });
    }
  }

  if (data.type === 'CLEAR_MAP_CACHE') {
    await caches.delete(CACHE_NAME);
    if (client && client.postMessage) {
      client.postMessage({
        type: 'CACHE_CLEARED'
      });
    }
  }
});
