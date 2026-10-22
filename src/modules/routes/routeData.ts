/**
 * Route Data Store & Offline Transit Cache
 * Includes Geographic Coordinates and Slippy Tile Calculation for Service Worker Caching
 */

import type { TransitRoute, RouteTileInfo } from '../../types/transit';

export const DEMO_ROUTES: TransitRoute[] = [
  {
    id: 'route-101',
    busNumber: '101',
    routeName: 'Hazratganj Heritage Express',
    origin: 'Charbagh Railway Station',
    destination: 'Hazratganj',
    frequencyMinutes: 10,
    busColor: 'Teal',
    busType: 'Low-floor Electric Bus (Wheelchair Accessible)',
    stops: [
      {
        id: 'stop-1',
        name: 'Charbagh Railway Station',
        landmark: 'Near Main Exit Gate 1 & Tactile Paving',
        distanceMeters: 0,
        estimatedMinutes: 0,
        latitude: 26.8322,
        longitude: 80.9200,
        hapticCues: 'Start of route. Board at Bay 3.',
        audioNotice: 'Starting point: Charbagh Railway Station. Bus 101 is ready at Bay 3.'
      },
      {
        id: 'stop-2',
        name: 'Hussainganj Crossing',
        landmark: 'Opposite Metro Station Pillar 42',
        distanceMeters: 1200,
        estimatedMinutes: 4,
        latitude: 26.8405,
        longitude: 80.9315,
        hapticCues: 'Straight crossing ahead.',
        audioNotice: 'Next stop is Hussainganj Crossing. Doors will open on the left.'
      },
      {
        id: 'stop-3',
        name: 'Vidhan Sabha Marg',
        landmark: 'Assembly Gate 2, tactile curb ramp',
        distanceMeters: 2100,
        estimatedMinutes: 8,
        latitude: 26.8480,
        longitude: 80.9420,
        hapticCues: 'Approaching government zone.',
        audioNotice: 'Now arriving at Vidhan Sabha Marg. Next is Hazratganj.'
      },
      {
        id: 'stop-4',
        name: 'Hazratganj',
        landmark: 'Near GPO Clock Tower & Accessible Metro Underpass',
        distanceMeters: 3200,
        estimatedMinutes: 13,
        latitude: 26.8530,
        longitude: 80.9490,
        hapticCues: 'Destination reached. Triple vibration pulse.',
        audioNotice: 'You have arrived at your destination: Hazratganj GPO. Please disembark safely.'
      }
    ]
  },
  {
    id: 'route-204',
    busNumber: '204',
    routeName: 'Gomti Nagar Tech Shuttle',
    origin: 'Polytechnic Chauraha',
    destination: 'Gomti Nagar Extension',
    frequencyMinutes: 15,
    busColor: 'Deep Blue',
    busType: 'AC City Shuttle',
    stops: [
      {
        id: 'stop-204-1',
        name: 'Polytechnic Chauraha',
        landmark: 'Under the Flyover, Platform B',
        distanceMeters: 0,
        estimatedMinutes: 0,
        latitude: 26.8710,
        longitude: 80.9850,
        hapticCues: 'Starting terminal.',
        audioNotice: 'Route 204 departing from Polytechnic Chauraha.'
      },
      {
        id: 'stop-204-2',
        name: 'Manoj Pandey Chowk',
        landmark: 'Adjacent to Patrakarpuram Market',
        distanceMeters: 1800,
        estimatedMinutes: 6,
        latitude: 26.8580,
        longitude: 80.9920,
        hapticCues: 'Turn right into Patrakarpuram.',
        audioNotice: 'Next stop: Manoj Pandey Chowk.'
      },
      {
        id: 'stop-204-3',
        name: 'City Mall Crossing',
        landmark: 'Pedestrian signal with audible beacon',
        distanceMeters: 3100,
        estimatedMinutes: 11,
        latitude: 26.8490,
        longitude: 81.0010,
        hapticCues: 'Approaching shopping corridor.',
        audioNotice: 'Arriving at City Mall Crossing.'
      },
      {
        id: 'stop-204-4',
        name: 'Gomti Nagar Extension',
        landmark: 'Near Stadium Circle, accessible bus shelter',
        distanceMeters: 4600,
        estimatedMinutes: 18,
        latitude: 26.8380,
        longitude: 81.0150,
        hapticCues: 'Destination reached. Triple vibration pulse.',
        audioNotice: 'Final stop: Gomti Nagar Extension. Please step out carefully.'
      }
    ]
  },
  {
    id: 'route-502',
    busNumber: '502',
    routeName: 'Airport Express Direct',
    origin: 'Hazratganj',
    destination: 'Chaudhary Charan Singh International Airport',
    frequencyMinutes: 20,
    busColor: 'Teal',
    busType: 'Rapid Low-floor Airport Shuttle',
    stops: [
      {
        id: 'stop-502-1',
        name: 'Hazratganj',
        landmark: 'Mayfair bus bay with audio guide kiosk',
        distanceMeters: 0,
        estimatedMinutes: 0,
        latitude: 26.8530,
        longitude: 80.9490,
        hapticCues: 'Board at Mayfair Bay.',
        audioNotice: 'Welcome aboard Airport Direct Bus 502.'
      },
      {
        id: 'stop-502-2',
        name: 'Alambagh Bus Terminal',
        landmark: 'Bay 12, Ramp to inter-state concourse',
        distanceMeters: 4200,
        estimatedMinutes: 12,
        latitude: 26.8150,
        longitude: 80.9020,
        hapticCues: 'Entering transit hub.',
        audioNotice: 'Approaching Alambagh Bus Terminal interchange.'
      },
      {
        id: 'stop-502-3',
        name: 'Transport Nagar',
        landmark: 'Metro gate 1 tactile strip',
        distanceMeters: 7800,
        estimatedMinutes: 21,
        latitude: 26.7900,
        longitude: 80.8850,
        hapticCues: 'Highway bypass corridor.',
        audioNotice: 'Next stop: Transport Nagar Metro.'
      },
      {
        id: 'stop-502-4',
        name: 'Chaudhary Charan Singh International Airport',
        landmark: 'Terminal 2 Departure Ramp & Braille map post',
        distanceMeters: 14500,
        estimatedMinutes: 32,
        latitude: 26.7606,
        longitude: 80.8893,
        hapticCues: 'Destination reached. Continuous pulse.',
        audioNotice: 'Terminal 2 Airport reached. Baggage assistance available on left.'
      }
    ]
  },
  {
    id: 'route-305',
    busNumber: '305',
    routeName: 'University Central Circular',
    origin: 'Charbagh Railway Station',
    destination: 'Hazratganj',
    frequencyMinutes: 12,
    busColor: 'Amber',
    busType: 'Accessible Standard Bus',
    stops: [
      {
        id: 'stop-305-1',
        name: 'Charbagh Railway Station',
        landmark: 'Platform 1 North Concourse',
        distanceMeters: 0,
        estimatedMinutes: 0,
        latitude: 26.8322,
        longitude: 80.9200,
        hapticCues: 'Boarding platform 1.',
        audioNotice: 'Bus 305 Circular ready to depart.'
      },
      {
        id: 'stop-305-2',
        name: 'Kaiserbagh Bus Stand',
        landmark: 'Audible zebra crossing',
        distanceMeters: 1600,
        estimatedMinutes: 5,
        latitude: 26.8540,
        longitude: 80.9320,
        hapticCues: 'Midway intersection.',
        audioNotice: 'Arriving at Kaiserbagh Bus Stand.'
      },
      {
        id: 'stop-305-3',
        name: 'Begum Hazrat Mahal Park',
        landmark: 'Heritage garden gate',
        distanceMeters: 2700,
        estimatedMinutes: 9,
        latitude: 26.8570,
        longitude: 80.9390,
        hapticCues: 'Turning right onto park perimeter.',
        audioNotice: 'Next stop: Begum Hazrat Mahal Park. Hazratganj is next.'
      },
      {
        id: 'stop-305-4',
        name: 'Hazratganj',
        landmark: 'Janpath Market entry crossing',
        distanceMeters: 3500,
        estimatedMinutes: 14,
        latitude: 26.8530,
        longitude: 80.9490,
        hapticCues: 'Final stop reached.',
        audioNotice: 'Arrived at Hazratganj Janpath. Journey finished.'
      }
    ]
  }
];

// Slippy Map Math Helpers
export function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

export function lat2tile(lat: number, zoom: number): number {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

/**
 * Calculates all map tile URLs needed to cover the route bounding box and stop landmarks
 */
export function getRouteTileUrls(route: TransitRoute, zoomLevels = [13, 14, 15]): RouteTileInfo[] {
  const tileSet = new Map<string, RouteTileInfo>();

  zoomLevels.forEach((zoom) => {
    route.stops.forEach((stop) => {
      const lat = stop.latitude || 26.8467;
      const lon = stop.longitude || 80.9462;

      const tileX = lon2tile(lon, zoom);
      const tileY = lat2tile(lat, zoom);

      // Include center tile and 1 adjacent neighbor tile for smooth map panning buffer
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const x = tileX + dx;
          const y = tileY + dy;
          const key = `${zoom}/${x}/${y}`;

          if (!tileSet.has(key)) {
            tileSet.set(key, {
              z: zoom,
              x,
              y,
              url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
              isCached: false,
              stopName: stop.name
            });
          }
        }
      }
    });
  });

  return Array.from(tileSet.values());
}

export function getCachedRoutes(): TransitRoute[] {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('drishti_cached_routes');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Fallback
    }
  }
  return DEMO_ROUTES;
}

export function saveRoutesToOfflineCache(routes: TransitRoute[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('drishti_cached_routes', JSON.stringify(routes));
    } catch {
      // Safe fallback
    }
  }
}
