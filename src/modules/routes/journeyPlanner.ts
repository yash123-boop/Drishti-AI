import type { TransitRoute } from '../../types/transit';
import { DEMO_ROUTES } from './routeData';
import { DEMO_FARES_INR } from './demoFareData';
import { DEMO_PLACES, type DemoPlace } from '../places/demoPlaces';

export interface JourneyQuote {
  route: TransitRoute;
  busFareInr: number;
  travelMinutes: number;
  boardStop: string;
  alightStop: string;
  walkingMinutes: number;
  place: DemoPlace;
  foodEstimateInr: number;
  entryFeeEstimateInr: number;
  localTransportEstimateInr: number;
  miscellaneousInr: number;
  oneWayTotalInr: number;
  roundTripTotalInr: number;
}

const normalize = (value: string) => value.trim().toLowerCase();

function findStopIndex(route: TransitRoute, name: string): number {
  const query = normalize(name);
  if (normalize(route.origin) === query) return 0;
  return route.stops.findIndex((stop) =>
    normalize(stop.name) === query ||
    normalize(stop.name).includes(query) ||
    query.includes(normalize(stop.name))
  );
}

export function findJourneyOptions(origin: string, destination: string): JourneyQuote[] {
  if (!origin.trim() || !destination.trim()) return [];
  const place = DEMO_PLACES.find((candidate) =>
    normalize(candidate.name) === normalize(destination) ||
    normalize(candidate.name).includes(normalize(destination)) ||
    normalize(destination).includes(normalize(candidate.name))
  );
  if (!place) return [];

  const options: JourneyQuote[] = [];
  for (const route of DEMO_ROUTES) {
    const boardIndex = findStopIndex(route, origin);
    const alightIndex = findStopIndex(route, destination);
    if (boardIndex < 0 || alightIndex <= boardIndex) continue;

    const board = route.stops[boardIndex];
    const alight = route.stops[alightIndex];
    const travelMinutes = Math.max(1, alight.estimatedMinutes - board.estimatedMinutes);
    const busFareInr = DEMO_FARES_INR[route.id];
    if (busFareInr === undefined) continue;
    const foodEstimateInr = Math.round((place.foodMin + place.foodMax) / 2);
    const entryFeeEstimateInr = Math.round((place.entryMin + place.entryMax) / 2);
    const localTransportEstimateInr = Math.round((place.localTransportMin + place.localTransportMax) / 2);
    const miscellaneousInr = Math.round((place.miscellaneousMin + place.miscellaneousMax) / 2);
    const visitExpenses = foodEstimateInr + entryFeeEstimateInr + localTransportEstimateInr + miscellaneousInr;
    const oneWayTotalInr = busFareInr + visitExpenses;

    options.push({
      route,
      busFareInr,
      travelMinutes,
      boardStop: board.name,
      alightStop: alight.name,
      walkingMinutes: 5,
      place,
      foodEstimateInr,
      entryFeeEstimateInr,
      localTransportEstimateInr,
      miscellaneousInr,
      oneWayTotalInr,
      roundTripTotalInr: 2 * busFareInr + visitExpenses,
    });
  }
  return options;
}

export function getSupportedJourneyDestinations(origin: string): string[] {
  return DEMO_PLACES
    .filter((place) => findJourneyOptions(origin, place.name).length > 0)
    .map((place) => place.name);
}

export function getDemoOrigins(): string[] {
  return Array.from(new Set(DEMO_ROUTES.flatMap((route) => [route.origin, ...route.stops.map((stop) => stop.name)])));
}

export function findNearestDemoStop(latitude: number, longitude: number): { name: string; distanceMeters: number } | undefined {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
  let nearest: { name: string; distanceMeters: number } | undefined;
  for (const route of DEMO_ROUTES) {
    for (const stop of route.stops) {
      if (typeof stop.latitude !== 'number' || typeof stop.longitude !== 'number') continue;
      const distanceMeters = haversineDistance(latitude, longitude, stop.latitude, stop.longitude);
      if (!nearest || distanceMeters < nearest.distanceMeters) {
        nearest = { name: stop.name, distanceMeters };
      }
    }
  }
  return nearest;
}

function haversineDistance(latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLatitude = radians(latitudeB - latitudeA);
  const deltaLongitude = radians(longitudeB - longitudeA);
  const arc = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(radians(latitudeA)) * Math.cos(radians(latitudeB)) * Math.sin(deltaLongitude / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}
