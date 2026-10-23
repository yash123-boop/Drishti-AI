/**
 * Service Worker & Map Tile Offline Cache Manager
 * Coordinates explicit caching of route tile bounding boxes via Service Worker
 */

import { getRouteTileUrls } from '../routes/routeData';
import type { TransitRoute, RouteTileInfo, RouteTileCacheState } from '../../types/transit';

const CACHE_NAME = 'drishti-offline-map-tiles-v2';

type ProgressCallback = (progress: { completed: number; total: number; currentUrl?: string }) => void;

class MapTileCacheService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSwReady: boolean = false;
  private isOfflineSimulated: boolean = false;

  constructor() {
    this.initServiceWorker();
  }

  public async initServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      await navigator.serviceWorker.ready;
      this.isSwReady = true;
      return true;
    } catch (err) {
      console.warn('Service Worker registration fallback to CacheStorage API:', err);
      return false;
    }
  }

  public setOfflineSimulated(simulated: boolean) {
    this.isOfflineSimulated = simulated;
  }

  public isOfflineMode(): boolean {
    if (this.isOfflineSimulated) return true;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
    return false;
  }

  /**
   * Explicitly caches all map tiles for the given route into CacheStorage via Service Worker
   */
  public async cacheRouteTiles(
    route: TransitRoute,
    onProgress?: ProgressCallback
  ): Promise<{ success: boolean; cachedCount: number }> {
    const tiles = getRouteTileUrls(route, [13, 14, 15]);
    const tileUrls = tiles.map((t) => t.url);

    // Try sending command to active Service Worker
    const sw = navigator.serviceWorker;
    if (sw && sw.controller) {
      const controller = sw.controller;
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          const data = event.data;
          if (data.type === 'CACHE_PROGRESS') {
            onProgress?.({
              completed: data.completed,
              total: data.total,
              currentUrl: data.url
            });
          } else if (data.type === 'CACHE_COMPLETE') {
            // Save metadata to localStorage
            this.saveCacheMetadata(route.id, route.routeName, data.totalCached);
            resolve({ success: data.totalCached > 0, cachedCount: data.totalCached });
          }
        };

        controller.postMessage(
          {
            type: 'CACHE_ROUTE_TILES',
            tileUrls,
            routeId: route.id
          },
          [messageChannel.port2]
        );

        // Fallback safety timeout if postMessage does not return
        setTimeout(async () => {
          const count = await this.getCachedTileCount();
          this.saveCacheMetadata(route.id, route.routeName, count);
          resolve({ success: true, cachedCount: count });
        }, 8000);
      });
    }

    // Direct CacheStorage client fallback
    try {
      const cache = await caches.open(CACHE_NAME);
      let completed = 0;
      let cachedCount = 0;

      for (const url of tileUrls) {
        try {
          const match = await cache.match(url);
          if (match && match.headers.get('X-Offline-Fallback') !== 'true') {
            cachedCount++;
          } else {
            const response = await fetch(url);
            if (response.ok || response.type === 'opaque') {
              await cache.put(url, response);
              cachedCount++;
            }
          }
        } catch {
          // Leave unavailable tiles uncached so a later online request can retry.
        }

        completed++;
        onProgress?.({
          completed,
          total: tileUrls.length,
          currentUrl: url
        });
      }

      this.saveCacheMetadata(route.id, route.routeName, cachedCount);
      return { success: cachedCount > 0, cachedCount };
    } catch (err) {
      console.error('Failed to cache tiles directly:', err);
      return { success: false, cachedCount: 0 };
    }
  }

  public async getCachedTileCount(): Promise<number> {
    try {
      if (typeof caches === 'undefined') return 0;
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      return keys.length;
    } catch {
      return 0;
    }
  }

  public async clearMapCache(): Promise<boolean> {
    try {
      const controller = navigator.serviceWorker?.controller;
      if (controller) {
        controller.postMessage({ type: 'CLEAR_MAP_CACHE' });
      }
      if (typeof caches !== 'undefined') {
        await caches.delete(CACHE_NAME);
      }
      localStorage.removeItem('drishti_tile_cache_meta');
      return true;
    } catch {
      return false;
    }
  }

  public getCacheMetadata(routeId?: string): RouteTileCacheState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('drishti_tile_cache_meta');
      if (raw) {
        const meta = JSON.parse(raw);
        if (!routeId || meta.routeId === routeId) {
          return meta;
        }
      }
    } catch {
      // Fallback
    }
    return null;
  }

  private saveCacheMetadata(routeId: string, routeName: string, count: number) {
    if (typeof window === 'undefined') return;
    try {
      const state: RouteTileCacheState = {
        routeId,
        routeName,
        totalTiles: count,
        cachedTiles: count,
        isCaching: false,
        isComplete: true,
        lastCachedAt: new Date().toLocaleTimeString(),
        cacheSizeKb: Math.round(count * 14.5) // ~14.5 KB per tile
      };
      localStorage.setItem('drishti_tile_cache_meta', JSON.stringify(state));
    } catch {
      // Fallback
    }
  }
}

export const mapTileCacheService = new MapTileCacheService();
