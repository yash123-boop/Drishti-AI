export type PlaceCategory =
  | 'Heritage & Culture'
  | 'Parks & Recreation'
  | 'Shopping & Food'
  | 'Transport Hubs'
  | 'Education'
  | 'Attractions'
  | 'Neighbourhoods';

export interface DemoPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  busFareMin: number;
  busFareMax: number;
  foodMin: number;
  foodMax: number;
  entryMin: number;
  entryMax: number;
  localTransportMin: number;
  localTransportMax: number;
  miscellaneousMin: number;
  miscellaneousMax: number;
  bestTime: string;
  tripDuration: string;
  accessibility: string;
  popular: boolean;
}

const defaultBudget = {
  busFareMin: 15,
  busFareMax: 35,
  foodMin: 100,
  foodMax: 200,
  entryMin: 0,
  entryMax: 50,
  localTransportMin: 20,
  localTransportMax: 50,
  miscellaneousMin: 20,
  miscellaneousMax: 50,
  bestTime: 'Morning or late afternoon',
  tripDuration: '2–3 hours',
  accessibility: 'Confirm step-free access and facilities with the venue before travelling.',
};

export const DEMO_PLACES: DemoPlace[] = [
  { id: 'bara-imambara', name: 'Bara Imambara', category: 'Heritage & Culture', description: 'Historic Awadhi complex and landmark.', ...defaultBudget, entryMin: 50, entryMax: 100, bestTime: 'Morning', tripDuration: '2–3 hours', accessibility: 'Historic site; check current step-free access and guided assistance with the venue.', popular: true },
  { id: 'hazratganj', name: 'Hazratganj', category: 'Shopping & Food', description: 'Central shopping and dining district.', ...defaultBudget, entryMin: 0, entryMax: 0, bestTime: 'Late afternoon or evening', tripDuration: '1–2 hours', accessibility: 'Busy streets and crossings; use a companion and confirm accessible crossing options.', popular: true },
  { id: 'gomti-nagar', name: 'Gomti Nagar', category: 'Neighbourhoods', description: 'Large planned residential and commercial district.', ...defaultBudget, entryMin: 0, entryMax: 0, bestTime: 'Morning or evening', tripDuration: '1–3 hours', accessibility: 'Accessibility varies by venue and street; confirm the exact destination before travel.', popular: true },
  { id: 'janeshwar-mishra-park', name: 'Janeshwar Mishra Park', category: 'Parks & Recreation', description: 'Large urban park and recreation area.', ...defaultBudget, entryMin: 0, entryMax: 30, bestTime: 'Early morning or evening', tripDuration: '2–3 hours', accessibility: 'Park paths and facilities may vary; confirm accessible entrances before travel.', popular: true },
  { id: 'chota-imambara', name: 'Chota Imambara', category: 'Heritage & Culture', description: 'Historic monument and cultural landmark.', ...defaultBudget, entryMin: 50, entryMax: 100, bestTime: 'Morning', tripDuration: '1–2 hours', accessibility: 'Historic site; check current step-free access and guided assistance with the venue.', popular: true },
  { id: 'rumi-darwaza', name: 'Rumi Darwaza', category: 'Heritage & Culture', description: 'Well-known historic gateway in old Lucknow.', ...defaultBudget, entryMin: 0, entryMax: 0, bestTime: 'Morning or sunset', tripDuration: '30–60 minutes', accessibility: 'Nearby roads can be busy; plan crossings with care.', popular: true },
  { id: 'the-residency', name: 'The Residency', category: 'Heritage & Culture', description: 'Historic complex and museum grounds.', ...defaultBudget, entryMin: 25, entryMax: 75, bestTime: 'Morning', tripDuration: '2–3 hours', accessibility: 'Ground conditions vary; confirm routes and assistance with the venue.', popular: true },
  { id: 'ambedkar-memorial-park', name: 'Ambedkar Memorial Park', category: 'Parks & Recreation', description: 'Memorial park with landscaped public grounds.', ...defaultBudget, entryMin: 0, entryMax: 30, bestTime: 'Morning or evening', tripDuration: '1–2 hours', accessibility: 'Confirm ramp and accessible restroom availability at the entrance.', popular: true },
  { id: 'lucknow-zoo', name: 'Lucknow Zoo', category: 'Attractions', description: 'City zoological garden and family attraction.', ...defaultBudget, entryMin: 50, entryMax: 150, bestTime: 'Morning', tripDuration: '3–4 hours', accessibility: 'Large grounds; confirm accessible paths, transport and visitor assistance.', popular: true },
  { id: 'aminabad-market', name: 'Aminabad Market', category: 'Shopping & Food', description: 'Traditional market and food area.', ...defaultBudget, entryMin: 0, entryMax: 0, bestTime: 'Late afternoon', tripDuration: '1–2 hours', accessibility: 'Crowded lanes and uneven surfaces may occur; use assistance as needed.', popular: true },
  { id: 'chowk', name: 'Chowk', category: 'Shopping & Food', description: 'Old-city market and food neighbourhood.', ...defaultBudget, entryMin: 0, entryMax: 0, bestTime: 'Late afternoon', tripDuration: '1–2 hours', accessibility: 'Busy, narrow streets may be difficult to navigate; verify route conditions.', popular: true },
  { id: 'kaiserbagh', name: 'Kaiserbagh', category: 'Neighbourhoods', description: 'Central historic district and transport area.', ...defaultBudget, entryMin: 0, entryMax: 0, bestTime: 'Morning or late afternoon', tripDuration: '1–2 hours', accessibility: 'Accessibility varies by destination within the district.', popular: true },
  { id: 'charbagh-railway-station', name: 'Charbagh Railway Station', category: 'Transport Hubs', description: 'Major rail and city transit interchange.', ...defaultBudget, entryMin: 0, entryMax: 0, bestTime: 'Allow extra interchange time', tripDuration: '30–60 minutes', accessibility: 'Station assistance and accessible facilities vary; ask station staff for support.', popular: true },
  { id: 'alambagh', name: 'Alambagh Bus Terminal', category: 'Transport Hubs', description: 'City bus and intercity transport hub.', ...defaultBudget, entryMin: 0, entryMax: 0, bestTime: 'Allow extra interchange time', tripDuration: '30–60 minutes', accessibility: 'Confirm current boarding bay and step-free access with terminal staff.', popular: true },
  { id: 'lucknow-university', name: 'Lucknow University', category: 'Education', description: 'University campus and historic educational institution.', ...defaultBudget, entryMin: 0, entryMax: 0, bestTime: 'Weekday daytime', tripDuration: '1–2 hours', accessibility: 'Campus access depends on the building; confirm visitor entry and accessible paths.', popular: true },
];

export const PLACE_CATEGORIES: PlaceCategory[] = [
  'Heritage & Culture',
  'Parks & Recreation',
  'Shopping & Food',
  'Transport Hubs',
  'Education',
  'Attractions',
  'Neighbourhoods',
];

export function findDemoPlace(name: string): DemoPlace | undefined {
  const query = name.trim().toLowerCase();
  return DEMO_PLACES.find((place) =>
    place.name.toLowerCase() === query ||
    place.name.toLowerCase().includes(query) ||
    query.includes(place.name.toLowerCase())
  );
}

export function inferPlaceCategory(category: string, type = ''): PlaceCategory {
  const normalized = `${category} ${type}`.toLowerCase();
  if (/museum|historic|heritage|monument|memorial/.test(normalized)) return 'Heritage & Culture';
  if (/park|garden|nature/.test(normalized)) return 'Parks & Recreation';
  if (/market|restaurant|cafe|food|shop/.test(normalized)) return 'Shopping & Food';
  if (/station|terminal|airport|bus|railway|transport/.test(normalized)) return 'Transport Hubs';
  if (/school|college|university|education/.test(normalized)) return 'Education';
  if (/zoo|attraction|tourism/.test(normalized)) return 'Attractions';
  return 'Neighbourhoods';
}

export function getEstimatedPlaceBudget(name: string, category: string): DemoPlace {
  return findDemoPlace(name) ?? {
    id: `estimate-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    category: inferPlaceCategory(category),
    description: `A map-listed Lucknow place. Details are limited to the available map listing.`,
    ...defaultBudget,
    popular: false,
  };
}
