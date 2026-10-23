import React, { useMemo, useState } from 'react';
import { AlertTriangle, Bus, Clock3, MapPin, Route } from 'lucide-react';
import { TransitMap } from './TransitMap';

interface BusRoutesPanelProps {
  latitude: number;
  longitude: number;
  placeName: string;
}

interface DemoRoute {
  number: string;
  name: string;
  terminal: string;
  terminalLatitude: number;
  terminalLongitude: number;
  frequencyMinutes: number;
  geometry: [number, number][];
}

const lucknowTerminals = [
  { name: 'Charbagh Railway Station', latitude: 26.8322, longitude: 80.9200 },
  { name: 'Alambagh Bus Terminal', latitude: 26.8150, longitude: 80.9020 },
  { name: 'Hazratganj Metro & Bus Hub', latitude: 26.8530, longitude: 80.9490 },
  { name: 'Gomti Nagar Railway Station', latitude: 26.8470, longitude: 81.0060 },
  { name: 'Kaiserbagh Bus Station', latitude: 26.8540, longitude: 80.9320 },
];

function stableHash(value: string) {
  let hash = 2166136261;
  for (const character of value.toLocaleLowerCase()) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildDemoRoutes(latitude: number, longitude: number, placeName: string): DemoRoute[] {
  const hash = stableHash(`${placeName}-${latitude.toFixed(3)}-${longitude.toFixed(3)}`);
  const firstTerminal = hash % lucknowTerminals.length;

  return Array.from({ length: 4 }, (_, index) => {
    const terminal = lucknowTerminals[(firstTerminal + index) % lucknowTerminals.length];
    const busNumber = 101 + ((hash + index * 73) % 799);
    const routeNames = ['City Link', 'Nagar Connect', 'Rapid Corridor', 'Central Shuttle'];
    const bend = (index - 1.5) * 0.003;

    return {
      number: String(busNumber),
      name: `${placeName} ${routeNames[index]}`,
      terminal: terminal.name,
      terminalLatitude: terminal.latitude,
      terminalLongitude: terminal.longitude,
      frequencyMinutes: 10 + ((hash >>> (index * 3)) % 16),
      geometry: [
        [longitude, latitude],
        [longitude + bend, latitude + (terminal.latitude - latitude) * 0.33],
        [terminal.longitude - bend, latitude + (terminal.latitude - latitude) * 0.66],
        [terminal.longitude, terminal.latitude],
      ],
    };
  });
}

function distanceInMeters(latA: number, lonA: number, latB: number, lonB: number) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const latitudeDelta = radians(latB - latA);
  const longitudeDelta = radians(lonB - lonA);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latA)) * Math.cos(radians(latB)) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatDistance(distance: number) {
  return distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${Math.round(distance)} m`;
}

export const BusRoutesPanel: React.FC<BusRoutesPanelProps> = ({ latitude, longitude, placeName }) => {
  const [showRoutes, setShowRoutes] = useState(false);
  const routes = useMemo(
    () => buildDemoRoutes(latitude, longitude, placeName),
    [latitude, longitude, placeName]
  );

  return (
    <section
      className="mb-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
      aria-labelledby="nearby-buses-heading"
    >
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 id="nearby-buses-heading" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Bus className="h-5 w-5 text-violet-600" />
            Demo buses for {placeName}
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            See sample bus numbers and route lines for the selected location.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRoutes((shown) => !shown)}
          aria-expanded={showRoutes}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 font-bold text-white hover:bg-emerald-800"
        >
          <Bus className="h-4 w-4" />
          {showRoutes ? 'Hide demo buses' : 'Show demo buses & routes'}
        </button>
      </div>

      <p className="mb-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        Demo-only generated bus numbers, route lines and frequencies. These are fictional examples, not actual Lucknow services or navigation instructions.
      </p>

      {showRoutes && (
        <>
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            {routes.map((route) => (
              <article
                key={route.number}
                className="rounded-lg border border-violet-200 bg-violet-50/70 p-3 dark:border-violet-900 dark:bg-violet-950/20"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-violet-700 px-2.5 py-1 font-mono font-extrabold text-white">
                    BUS {route.number}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{route.name}</span>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-700 dark:text-slate-200">
                  <Route className="mt-0.5 h-4 w-4 shrink-0" />
                  {placeName} → {route.terminal}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    ~{formatDistance(distanceInMeters(latitude, longitude, route.terminalLatitude, route.terminalLongitude))}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    Demo frequency: {route.frequencyMinutes} min
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mb-3">
            <TransitMap
              currentLocation={{ latitude, longitude }}
              currentLocationLabel={`${placeName} (demo start)`}
              routes={routes.map((route) => route.geometry)}
              markers={routes.map((route) => ({
                latitude: route.terminalLatitude,
                longitude: route.terminalLongitude,
                label: `${route.terminal} · demo terminus`,
              }))}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Lines are illustrative straight connections to sample city hubs, not real bus roads or verified stops.
          </p>
        </>
      )}
    </section>
  );
};
