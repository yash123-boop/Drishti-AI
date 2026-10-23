import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  HardDrive,
  RefreshCw,
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Map,
  Trash2,
  Radio,
  Layers
} from 'lucide-react';
import { getCachedRoutes, saveRoutesToOfflineCache, DEMO_ROUTES, getRouteTileUrls } from '../modules/routes/routeData';
import { mapTileCacheService } from '../modules/offline/mapTileCacheService';
import { audioChimes } from '../modules/voice/audioChimes';
import { speechSynth } from '../modules/voice/speechSynthesis';
import { hapticEngine } from '../modules/voice/hapticEngine';
import type { TransitRoute, RouteTileCacheState } from '../types/transit';

interface OfflineMapBannerProps {
  currentRoute?: TransitRoute | null;
}

export const OfflineMapBanner: React.FC<OfflineMapBannerProps> = ({ currentRoute }) => {
  const routes = getCachedRoutes();
  const activeRoute = currentRoute || routes[0]; // Default to Route 101 Hazratganj Express

  const [isExpanded, setIsExpanded] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState<{ completed: number; total: number; currentUrl?: string }>({
    completed: 0,
    total: 0
  });
  const [cachedTileCount, setCachedTileCount] = useState<number>(0);
  const [cacheMeta, setCacheMeta] = useState<RouteTileCacheState | null>(null);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Calculate tiles for active route
  const routeTiles = getRouteTileUrls(activeRoute, [13, 14, 15]);

  useEffect(() => {
    // Monitor hardware connectivity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of cache status
    mapTileCacheService.getCachedTileCount().then(setCachedTileCount);
    setCacheMeta(mapTileCacheService.getCacheMetadata(activeRoute.id));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeRoute.id]);

  const handleCacheRouteTiles = async () => {
    setIsCaching(true);
    audioChimes.play('tap');
    hapticEngine.tap();
    speechSynth.speakMessage('offlineCacheStarting', { route: activeRoute.routeName });

    const result = await mapTileCacheService.cacheRouteTiles(activeRoute, (prog) => {
      setCacheProgress(prog);
    });

    setIsCaching(false);
    if (result.success) {
      setCachedTileCount(result.cachedCount);
      setCacheMeta(mapTileCacheService.getCacheMetadata(activeRoute.id));
      audioChimes.play('success');
      hapticEngine.tap();
      speechSynth.speakMessage('offlineCacheDone', { route: activeRoute.routeName });
    } else {
      audioChimes.play('wrong-bus');
      speechSynth.speak('No map tiles could be cached. Check your internet connection and try again.');
    }
  };

  const handleToggleSimulatedOffline = () => {
    const next = !isSimulatedOffline;
    setIsSimulatedOffline(next);
    mapTileCacheService.setOfflineSimulated(next);
    audioChimes.play('tap');
    hapticEngine.tap();

    if (next) {
      speechSynth.speakMessage('offlineEnabled');
    } else {
      speechSynth.speakMessage('onlineRestored');
    }
  };

  const handleClearCache = async () => {
    audioChimes.play('tap');
    await mapTileCacheService.clearMapCache();
    setCachedTileCount(0);
    setCacheMeta(null);
    speechSynth.speakMessage('offlineCacheCleared');
  };

  const handleSyncTimetables = () => {
    saveRoutesToOfflineCache(DEMO_ROUTES);
    audioChimes.play('success');
    speechSynth.speakMessage('offlineSchedulesSynced');
  };

  const isActuallyOffline = !isOnline || isSimulatedOffline;
  const isRouteFullyCached = cacheMeta && cacheMeta.cachedTiles >= routeTiles.length;

  return (
    <div className="w-full bg-slate-900 text-slate-300 text-xs border-b border-slate-800 transition-colors">
      {/* Top Compact Summary Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Cache & Connectivity Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isActuallyOffline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700 font-bold">
              <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Offline Connectivity Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Online • Service Worker Active</span>
            </div>
          )}

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Route Tile Cache Status */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Route: <strong>Bus {activeRoute.busNumber}</strong> ({activeRoute.destination})
            </span>
            {isRouteFullyCached ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                {cacheMeta.cachedTiles} Tiles Cached
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {cachedTileCount} tiles cached
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isRouteFullyCached && !isCaching && (
            <button
              onClick={handleCacheRouteTiles}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-colors"
              title="Cache map tile data for this route into Service Worker"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Cache Route Tiles</span>
            </button>
          )}

          {isCaching && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-950 text-blue-300 border border-blue-800">
              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
              <span className="font-mono text-[11px]">
                {cacheProgress.completed}/{cacheProgress.total} Tiles
              </span>
            </div>
          )}

          {/* Toggle Poor Connectivity Simulation */}
          <button
            onClick={handleToggleSimulatedOffline}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
              isSimulatedOffline
                ? 'bg-amber-600 text-white border-amber-500 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Simulate entering a low-connectivity zone / subway tunnel"
          >
            {isSimulatedOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
            <span>{isSimulatedOffline ? 'Tunnel Mode: ON' : 'Simulate Tunnel'}</span>
          </button>

          {/* Expand Inspector Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Toggle Map Tile Cache Inspector"
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Tile Inspector & Strategy Panel */}
      {isExpanded && (
        <div className="border-t border-slate-800 bg-slate-950/90 px-4 py-4 max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-blue-400" />
                Service Worker Map Tile Caching Strategy
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pre-caches slippy map tiles across zoom levels 13, 14, and 15 along all {activeRoute.stops.length} stops. Intercepted by <code className="font-mono text-blue-300">/sw.js</code> via <code className="font-mono text-blue-300">CacheFirst</code> strategy.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCacheRouteTiles}
                disabled={isCaching}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Download {routeTiles.length} Tiles for Route</span>
              </button>

              <button
                onClick={handleClearCache}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 font-semibold text-xs flex items-center gap-1 transition-colors"
                title="Purge cached map tiles from Service Worker storage"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>

          {/* Caching Progress Bar */}
          {isCaching && (
            <div className="space-y-1.5 p-3 rounded-xl bg-blue-950/40 border border-blue-900">
              <div className="flex justify-between text-[11px] font-bold text-blue-300">
                <span>Caching Map Tiles into Service Worker (CacheStorage)...</span>
                <span>
                  {Math.round((cacheProgress.completed / Math.max(1, cacheProgress.total)) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.round(
                      (cacheProgress.completed / Math.max(1, cacheProgress.total)) * 100
                    )}%`
                  }}
                />
              </div>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                {cacheProgress.currentUrl || 'Downloading tile assets...'}
              </p>
            </div>
          )}

          {/* Tile Grid & Stop Landmarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {activeRoute.stops.map((stop, idx) => (
              <div
                key={stop.id}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white truncate max-w-[150px]">
                    {idx + 1}. {stop.name}
                  </span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">
                    Z14/15
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  {stop.latitude?.toFixed(4)}°N, {stop.longitude?.toFixed(4)}°E
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                  <span className="text-slate-500">Service Worker</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Pre-Cached
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Cache Metadata Specs */}
          {cacheMeta && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
              <div>
                Cache Store: <strong className="text-slate-200">drishti-offline-map-tiles-v2</strong>
              </div>
              <div>
                Stored Tiles: <strong className="text-emerald-400">{cacheMeta.cachedTiles}</strong>
              </div>
              <div>
                Estimated Storage: <strong className="text-slate-200">~{cacheMeta.cacheSizeKb} KB</strong>
              </div>
              <div>
                Last Synchronized: <strong className="text-slate-200">{cacheMeta.lastCachedAt}</strong>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
