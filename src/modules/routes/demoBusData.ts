export interface DemoBus {
  busNumber: string;
  route: string;
  destination: string;
  currentLocation: string;
  latitude: number;
  longitude: number;
  status: string;
  nextStop: string;
  nextStopLatitude: number;
  nextStopLongitude: number;
  estimatedArrival: string;
  fareInr: number;
  routePoints: Array<[number, number]>;
}

export const DEMO_BUSES: Record<string, DemoBus> = {
  'BUS-101': {
    busNumber: 'BUS-101',
    route: 'Hazratganj Heritage Express',
    destination: 'Hazratganj',
    currentLocation: 'Vidhan Sabha Marg',
    latitude: 26.848,
    longitude: 80.942,
    status: 'On Route',
    nextStop: 'Hazratganj',
    nextStopLatitude: 26.853,
    nextStopLongitude: 80.949,
    estimatedArrival: '6 minutes',
    fareInr: 15,
    routePoints: [[80.920, 26.8322], [80.9315, 26.8405], [80.942, 26.848], [80.949, 26.853]],
  },
  'BUS-102': {
    busNumber: 'BUS-102',
    route: 'Charbagh City Link',
    destination: 'Alambagh',
    currentLocation: 'Charbagh Railway Station',
    latitude: 26.8315,
    longitude: 80.921,
    status: 'On Route',
    nextStop: 'Hussainganj Crossing',
    nextStopLatitude: 26.8405,
    nextStopLongitude: 80.9315,
    estimatedArrival: '8 minutes',
    fareInr: 20,
    routePoints: [[80.921, 26.8315], [80.9315, 26.8405], [80.902, 26.815]],
  },
  'BUS-204': {
    busNumber: 'BUS-204',
    route: 'Gomti Nagar Tech Shuttle',
    destination: 'Gomti Nagar Extension',
    currentLocation: 'Manoj Pandey Chowk',
    latitude: 26.858,
    longitude: 80.992,
    status: 'On Route',
    nextStop: 'City Mall Crossing',
    nextStopLatitude: 26.849,
    nextStopLongitude: 81.001,
    estimatedArrival: '5 minutes',
    fareInr: 20,
    routePoints: [[80.985, 26.871], [80.992, 26.858], [81.001, 26.849], [81.015, 26.838]],
  },
  'BUS-305': {
    busNumber: 'BUS-305',
    route: 'University Central Circular',
    destination: 'Hazratganj',
    currentLocation: 'Kaiserbagh Bus Stand',
    latitude: 26.854,
    longitude: 80.932,
    status: 'On Route',
    nextStop: 'Begum Hazrat Mahal Park',
    nextStopLatitude: 26.857,
    nextStopLongitude: 80.939,
    estimatedArrival: '4 minutes',
    fareInr: 25,
    routePoints: [[80.920, 26.8322], [80.932, 26.854], [80.939, 26.857], [80.949, 26.853]],
  },
  'BUS-502': {
    busNumber: 'BUS-502',
    route: 'Airport Express Direct',
    destination: 'Lucknow Airport',
    currentLocation: 'Alambagh Bus Terminal',
    latitude: 26.815,
    longitude: 80.902,
    status: 'On Route',
    nextStop: 'Transport Nagar',
    nextStopLatitude: 26.79,
    nextStopLongitude: 80.885,
    estimatedArrival: '9 minutes',
    fareInr: 35,
    routePoints: [[80.949, 26.853], [80.902, 26.815], [80.885, 26.79], [80.8893, 26.7606]],
  },
};

export function normalizeDemoBusNumber(value: string): string | null {
  const match = value.trim().toUpperCase().match(/^(?:BUS[-\s]?)?(\d{3})$/);
  return match ? `BUS-${match[1]}` : null;
}
