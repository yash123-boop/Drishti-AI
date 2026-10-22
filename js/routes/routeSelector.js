export function matchRoutes(destination, routes) {
  if (!destination) return [];
  const clean = destination.trim().toLowerCase();
  return routes.filter((r) =>
    r.destination.toLowerCase().includes(clean) ||
    r.stops.some((s) => s.name.toLowerCase().includes(clean))
  );
}
