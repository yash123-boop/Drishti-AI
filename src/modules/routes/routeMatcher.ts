/**
 * Route Matcher Module
 * Validates candidate bus numbers against selected route specifications
 */

import type { RouteMatchResult, TransitRoute } from '../../types/transit';
import { getCachedRoutes } from './routeData';

export function normalizeBusNumber(input: string): string {
  if (!input) return '';
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

export function matchBusToRoute(
  candidateBusNumber: string,
  selectedRoute: TransitRoute
): RouteMatchResult {
  const normalizedCandidate = normalizeBusNumber(candidateBusNumber);
  const normalizedExpected = normalizeBusNumber(selectedRoute.busNumber);

  if (!normalizedCandidate) {
    return {
      status: 'UNRECOGNIZED',
      confirmedBusNumber: '',
      expectedBusNumber: selectedRoute.busNumber,
      message: 'No bus number could be recognized. Please enter or rescan the number.',
    };
  }

  // Exact or normalized match
  if (normalizedCandidate === normalizedExpected) {
    return {
      status: 'MATCH',
      confirmedBusNumber: selectedRoute.busNumber,
      expectedBusNumber: selectedRoute.busNumber,
      message: `Verified: Bus ${selectedRoute.busNumber} matches route "${selectedRoute.routeName}". Safe to board!`,
    };
  }

  // Check if candidate belongs to another known route
  const allRoutes = getCachedRoutes();
  const otherRoute = allRoutes.find(
    (r) => normalizeBusNumber(r.busNumber) === normalizedCandidate
  );

  if (otherRoute) {
    return {
      status: 'WRONG_BUS',
      confirmedBusNumber: candidateBusNumber,
      expectedBusNumber: selectedRoute.busNumber,
      message: `Warning: Scanned bus is #${candidateBusNumber} heading to "${otherRoute.destination}". Your selected route requires Bus #${selectedRoute.busNumber} to "${selectedRoute.destination}". Do NOT board!`,
    };
  }

  // Not matching and not a known bus
  return {
    status: 'WRONG_BUS',
    confirmedBusNumber: candidateBusNumber,
    expectedBusNumber: selectedRoute.busNumber,
    message: `Warning: Scanned bus #${candidateBusNumber} does not match expected Bus #${selectedRoute.busNumber}. Please wait for the correct vehicle.`,
  };
}
