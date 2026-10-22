import { loadRoutes } from './routes/routeData.js';
import { matchRoutes } from './routes/routeSelector.js';
import { compareBusToRoute } from './routes/routeMatcher.js';
import { speakText } from './voice/speechSynthesis.js';

console.log('Drishti AI Core Application Loaded');

export async function initApp() {
  const routes = await loadRoutes();
  return {
    routes,
    search: (dest) => matchRoutes(dest, routes),
    match: (busNo, route) => compareBusToRoute(busNo, route),
    speak: speakText
  };
}
