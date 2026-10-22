export function checkDestinationAlert(route, stopIndex) {
  if (!route || !route.stops) return 'NORMAL';
  if (stopIndex === route.stops.length - 1) return 'ARRIVED';
  if (stopIndex === route.stops.length - 2) return 'APPROACHING';
  return 'NORMAL';
}
