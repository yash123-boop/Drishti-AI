export function getStopInfo(route, index) {
  if (!route || !route.stops) return null;
  const current = route.stops[index] || null;
  const next = route.stops[index + 1] || null;
  const isPenultimate = index === route.stops.length - 2;
  const isFinal = index === route.stops.length - 1;

  return { current, next, isPenultimate, isFinal };
}
