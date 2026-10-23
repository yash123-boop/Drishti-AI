import React, { useState } from 'react';
import { Clock, MapPin, Navigation, Route as RouteIcon, ShieldCheck } from 'lucide-react';
import { TransitMap } from './TransitMap';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface MapRoute {
  distance: number;
  duration: number;
  geometry: [number, number][];
  turnCount: number;
}

interface RoutingResponse {
  code: string;
  message?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
    legs: Array<{
      steps: Array<{ maneuver: { type: string } }>;
    }>;
  }>;
}

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface RouteMapPanelProps {
  destinationQuery: string;
  destinationOverride?: Coordinates & { label: string };
}

function getTurnCount(route: NonNullable<RoutingResponse['routes']>[number]) {
  return route.legs.reduce(
    (count, leg) =>
      count +
      leg.steps.filter(({ maneuver }) =>
        ['turn', 'roundabout', 'rotary', 'fork', 'merge'].includes(maneuver.type)
      ).length,
    0
  );
}

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

export const RouteMapPanel: React.FC<RouteMapPanelProps> = ({ destinationQuery, destinationOverride }) => {
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [destinationLabel, setDestinationLabel] = useState('');
  const [routes, setRoutes] = useState<MapRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findRoutes = async () => {
    setError(null);
    setRoutes([]);
    setDestination(null);
    setDestinationLabel('');
    setIsLoading(true);

    try {
      if (!navigator.geolocation) {
        throw new Error('Location is not available in this browser.');
      }

      const currentPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (locationError) => {
            const message =
              locationError.code === locationError.PERMISSION_DENIED
                ? 'Location permission was denied. Allow location access in your browser and try again.'
                : locationError.code === locationError.POSITION_UNAVAILABLE
                  ? 'Your current location could not be determined. Check your device location settings.'
                  : 'Finding your location timed out. Please try again.';
            reject(new Error(message));
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
      });
      const currentLocation = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };
      setOrigin(currentLocation);

      let destinationLocation: Coordinates;
      let resolvedDestinationLabel: string;
      if (destinationOverride) {
        destinationLocation = {
          latitude: destinationOverride.latitude,
          longitude: destinationOverride.longitude,
        };
        resolvedDestinationLabel = destinationOverride.label;
      } else {
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(destinationQuery)}`
        );
        if (!geocodeResponse.ok) {
          throw new Error('Could not look up the destination. Check your connection and try again.');
        }
        const places = (await geocodeResponse.json()) as GeocodingResult[];
        const place = places[0];
        if (!place) {
          throw new Error(`Could not find "${destinationQuery}". Try adding a nearby city or landmark.`);
        }
        destinationLocation = {
          latitude: Number(place.lat),
          longitude: Number(place.lon),
        };
        resolvedDestinationLabel = place.display_name;
      }
      if (!Number.isFinite(destinationLocation.latitude) || !Number.isFinite(destinationLocation.longitude)) {
        throw new Error('The destination lookup returned an invalid location. Please try another search.');
      }
      setDestination(destinationLocation);
      setDestinationLabel(resolvedDestinationLabel);

      const routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${currentLocation.longitude},${currentLocation.latitude};${destinationLocation.longitude},${destinationLocation.latitude}?alternatives=true&steps=true&overview=full&geometries=geojson`
      );
      if (!routeResponse.ok) {
        throw new Error('The route service is unavailable right now. Please try again later.');
      }
      const routeData = (await routeResponse.json()) as RoutingResponse;
      if (routeData.code !== 'Ok' || !routeData.routes?.length) {
        throw new Error(routeData.message || 'No road route was found between these locations.');
      }

      const mappedRoutes = routeData.routes
        .filter((route) => route.geometry.coordinates.length > 1)
        .map((route) => ({
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry.coordinates,
          turnCount: getTurnCount(route),
        }));
      if (!mappedRoutes.length) {
        throw new Error('The route service did not return a usable route. Please try again.');
      }
      setRoutes(mappedRoutes);
      setSelectedRouteIndex(0);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to find routes right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const fastestRouteIndex = routes.reduce(
    (bestIndex, route, index) => (route.duration < routes[bestIndex].duration ? index : bestIndex),
    0
  );
  const simplerRouteIndex = routes.reduce(
    (bestIndex, route, index) =>
      route.turnCount < routes[bestIndex].turnCount ||
      (route.turnCount === routes[bestIndex].turnCount && route.distance < routes[bestIndex].distance)
        ? index
        : bestIndex,
    0
  );

  return (
    <section
      aria-labelledby="route-map-heading"
      className="mb-8 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="route-map-heading" className="text-xl font-extrabold text-slate-900 dark:text-white">
            Map your journey
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Current location to {destinationQuery}
          </p>
        </div>
        <button
          type="button"
          onClick={findRoutes}
          disabled={isLoading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          <Navigation className="h-5 w-5" />
          {isLoading ? 'Finding location & routes…' : 'Use my location & show routes'}
        </button>
      </div>

      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        With your permission, your location and destination are sent to OpenStreetMap search and routing services to find routes.
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </p>
      )}

      {origin && destination && (
        <div className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
          <p className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span><strong>Start:</strong> {origin.latitude.toFixed(5)}, {origin.longitude.toFixed(5)}</span>
          </p>
          <p className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <span><strong>Destination:</strong> {destinationLabel}</span>
          </p>
        </div>
      )}

      {routes.length > 0 && origin && destination && (
        <>
          <div
            className="mb-4"
            role="group"
            aria-label={`OpenStreetMap route map from your current location to ${destinationQuery}`}
          >
            <TransitMap
              currentLocation={origin}
              destination={destination}
              routes={routes.map((route) => route.geometry)}
              selectedRouteIndex={selectedRouteIndex}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSelectedRouteIndex(fastestRouteIndex)}
              aria-pressed={selectedRouteIndex === fastestRouteIndex}
              className={`min-h-20 rounded-xl border-2 p-4 text-left transition-colors ${selectedRouteIndex === fastestRouteIndex ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 dark:border-slate-600'}`}
            >
              <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Clock className="h-4 w-4 text-violet-600" /> Fastest route
              </span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                {formatDuration(routes[fastestRouteIndex].duration)} · {formatDistance(routes[fastestRouteIndex].distance)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRouteIndex(simplerRouteIndex)}
              aria-pressed={selectedRouteIndex === simplerRouteIndex}
              className={`min-h-20 rounded-xl border-2 p-4 text-left transition-colors ${selectedRouteIndex === simplerRouteIndex ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-600'}`}
            >
              <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Safety-focused · fewer turns
              </span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                {formatDuration(routes[simplerRouteIndex].duration)} · {formatDistance(routes[simplerRouteIndex].distance)} · {routes[simplerRouteIndex].turnCount} turns
              </span>
            </button>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
            <RouteIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              The safety-focused option minimizes turns; it is not verified as the safest route. Live crime, lighting, sidewalk, accessibility, and hazard data are not available. These are road-route estimates, not walking or public-transit directions.
            </span>
          </p>
        </>
      )}
    </section>
  );
};
