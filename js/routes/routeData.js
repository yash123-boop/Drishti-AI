export async function loadRoutes() {
  try {
    const res = await fetch('/data/routes.json');
    const data = await res.json();
    return data.routes || [];
  } catch {
    return [];
  }
}
