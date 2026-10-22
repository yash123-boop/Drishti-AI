/**
 * Stop Manager Module
 * Computes stop advancement, upcoming landmarks, and destination proximity
 */

import type { TransitRoute, TransitStop } from '../../types/transit';

export interface StopProgressionState {
  currentIndex: number;
  totalStops: number;
  currentStop: TransitStop;
  nextStop: TransitStop | null;
  isPenultimate: boolean;
  isFinal: boolean;
  progressPercent: number;
}

export function evaluateStopProgress(route: TransitRoute, stopIndex: number): StopProgressionState {
  const total = route.stops.length;
  const clampedIndex = Math.max(0, Math.min(stopIndex, total - 1));
  const current = route.stops[clampedIndex];
  const next = clampedIndex < total - 1 ? route.stops[clampedIndex + 1] : null;

  const isPenultimate = clampedIndex === total - 2;
  const isFinal = clampedIndex === total - 1;
  const progressPercent = Math.round(((clampedIndex + 1) / total) * 100);

  return {
    currentIndex: clampedIndex,
    totalStops: total,
    currentStop: current,
    nextStop: next,
    isPenultimate,
    isFinal,
    progressPercent,
  };
}
