import React, { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin } from 'lucide-react';
import { TransitMap } from './TransitMap';
import type { MapLocation } from './TransitMap';

export const LiveLocationMap: React.FC = () => {
  const watchId = useRef<number | null>(null);
  const [location, setLocation] = useState<MapLocation | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (watchId.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    },
    []
  );

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser.');
      return;
    }

    setError(null);
    setIsLocating(true);
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setAccuracy(position.coords.accuracy);
        setIsLocating(false);
        setError(null);
      },
      (locationError) => {
        setIsLocating(false);
        if (locationError.code === locationError.PERMISSION_DENIED) {
          setError('Location permission was denied. Allow location access in your browser settings and try again.');
        } else if (locationError.code === locationError.POSITION_UNAVAILABLE) {
          setError('Your device could not determine a location. Check that location services are enabled.');
        } else {
          setError('Location request timed out. Please try again.');
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
  };

  return (
    <section
      aria-labelledby="live-location-heading"
      className="mb-8 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="live-location-heading" className="text-xl font-extrabold text-slate-900 dark:text-white">
            Your live location
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            View your position on the map. Location access starts only when you choose.
          </p>
        </div>
        <button
          type="button"
          onClick={startLocationTracking}
          disabled={isLocating}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          <LocateFixed className="h-5 w-5" />
          {isLocating ? 'Finding your location…' : location ? 'Refresh my location' : 'Show my location'}
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </p>
      )}

      {location ? (
        <>
          <p className="mb-3 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              <strong>Current:</strong> {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              {accuracy !== null && ` · accuracy ±${Math.round(accuracy)} m`}
            </span>
          </p>
          <TransitMap currentLocation={location} followCurrentLocation />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Live position stays in this browser; map tile requests go to OpenStreetMap. Keep this page open to update your position.
          </p>
        </>
      ) : (
        <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-600 dark:bg-slate-900/40">
          <p className="max-w-lg text-sm text-slate-600 dark:text-slate-300">
            Select <strong>Show my location</strong> and allow browser location access to load the live map and your position.
          </p>
        </div>
      )}
    </section>
  );
};
