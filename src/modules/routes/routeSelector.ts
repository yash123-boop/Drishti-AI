/**
 * Route Selector Module
 * Searches and filters accessible transit routes matching user destinations
 */

import { getCachedRoutes } from './routeData';
import type { TransitRoute } from '../../types/transit';

export function searchRoutesByDestination(query: string): TransitRoute[] {
  if (!query || !query.trim()) return [];

  const normalized = query.toLowerCase().trim();
  const routes = getCachedRoutes();

  return routes.filter((route) => {
    const destMatch = route.destination.toLowerCase().includes(normalized);
    const originMatch = route.origin.toLowerCase().includes(normalized);
    const nameMatch = route.routeName.toLowerCase().includes(normalized);
    const stopMatch = route.stops.some((s) => s.name.toLowerCase().includes(normalized));

    return destMatch || originMatch || nameMatch || stopMatch;
  });
}

export function getAllAvailableDestinations(): string[] {
  const routes = getCachedRoutes();
  const destSet = new Set<string>();
  routes.forEach((r) => {
    destSet.add(r.destination);
    r.stops.forEach((s) => destSet.add(s.name));
  });
  return Array.from(destSet);
}
