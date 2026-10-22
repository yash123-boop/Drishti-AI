export function compareBusToRoute(busNumber, route) {
  const cleanInput = (busNumber || '').trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
  const cleanTarget = (route.busNumber || '').trim().toUpperCase().replace(/[^0-9A-Z]/g, '');

  if (!cleanInput) {
    return { status: 'UNRECOGNIZED', isMatch: false };
  }

  if (cleanInput === cleanTarget) {
    return { status: 'MATCH', isMatch: true };
  }

  return { status: 'WRONG_BUS', isMatch: false };
}
