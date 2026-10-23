import { DEMO_BUSES, normalizeDemoBusNumber } from '../routes/demoBusData';
import { DEMO_PLACES, findDemoPlace, getEstimatedPlaceBudget } from '../places/demoPlaces';
import { findJourneyOptions, getSupportedJourneyDestinations } from '../routes/journeyPlanner';
import { DEMO_ROUTES } from '../routes/routeData';

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

function findNamedPlace(text: string) {
  return DEMO_PLACES
    .filter((place) => text.toLowerCase().includes(place.name.toLowerCase()))
    .sort((a, b) => b.name.length - a.name.length)[0];
}

function findKnownOrigin(text: string) {
  const locations = Array.from(new Set(DEMO_ROUTES.flatMap((route) => [
    route.origin,
    ...route.stops.map((stop) => stop.name),
  ])));
  return locations
    .filter((location) => text.toLowerCase().includes(location.toLowerCase()))
    .sort((a, b) => b.length - a.length)[0];
}

export function answerJourneyQuestion(question: string): string {
  const text = question.trim();
  if (!text) return 'Type or speak a journey question. I can only answer from the available demo bus routes, fares, and place records.';

  const busMatch = text.match(/\bBUS[-\s]?(\d{3})\b/i) ??
    (/^\s*(\d{3})\s*$/.exec(text) ? [text, text.trim()] : null);
  if (busMatch) {
    const busKey = normalizeDemoBusNumber(busMatch[0]);
    const bus = busKey ? DEMO_BUSES[busKey] : undefined;
    if (!bus) return `BUS-${busMatch[1]} is not present in the demo bus database. I cannot verify its route or location.`;
    return `${bus.busNumber} is listed on ${bus.route} to ${bus.destination}. Demo location: ${bus.currentLocation}. Next stop: ${bus.nextStop}. Estimated demo fare: ${money(bus.fareInr)}. Its location and ETA are simulated, not live GPS.`;
  }

  const fromMatch = text.match(/\bfrom\s+(.+?)\s+\bto\s+(.+?)(?:[?.!,]|$)/i);
  const namedPlace = findNamedPlace(text);
  const from = (fromMatch?.[1]?.trim() || findKnownOrigin(text)) ?? 'Charbagh Railway Station';
  const to = fromMatch?.[2]?.trim() || namedPlace?.name;

  if (namedPlace && /budget|cost|fare|price|cheap|low.?budget/i.test(text)) {
    const place = namedPlace;
    const direct = findJourneyOptions(from, place.name)[0];
    const transportMin = direct ? 2 * direct.busFareInr : 2 * place.busFareMin;
    const transportMax = direct ? 2 * direct.busFareInr : 2 * place.busFareMax;
    const low = transportMin + place.foodMin + place.entryMin + place.localTransportMin + place.miscellaneousMin;
    const high = transportMax + place.foodMax + place.entryMax + place.localTransportMax + place.miscellaneousMax;
    const routeNote = direct
      ? `From ${from}, a route-backed option is BUS-${direct.route.busNumber}; its demo one-way fare is ${money(direct.busFareInr)}.`
      : `No direct bus route from ${from} to this place is listed in the demo route data; transport is only a generic estimate.`;
    return `${routeNote} Estimated demo visit budget for ${place.name}: ${money(low)}–${money(high)} round trip including bus fare estimate, food, entry, local transport and miscellaneous costs. Prices are estimates, not verified.`;
  }

  if (to) {
    const place = findDemoPlace(to);
    const quotes = findJourneyOptions(from, place?.name ?? to);
    if (quotes.length) {
      const quote = quotes[0];
      return `From ${from} to ${quote.place.name}, the demo route is BUS-${quote.route.busNumber}, ${quote.route.routeName}. Board at ${quote.boardStop} and get down at ${quote.alightStop}. Estimated bus fare: ${money(quote.busFareInr)} one way; travel time: about ${quote.travelMinutes} minutes. Estimated round-trip total including food, entry and miscellaneous expenses: ${money(quote.roundTripTotalInr)}. These are demo estimates, not a live timetable or verified prices.`;
    }
    const budget = getEstimatedPlaceBudget(to, 'place');
    return `I found ${budget.name} in the place estimates, but there is no direct ${from} to ${budget.name} bus connection in the app's demo route data. Estimated demo visit costs (excluding an unlisted bus route): food ${money(budget.foodMin)}–${money(budget.foodMax)}, entry ${money(budget.entryMin)}–${money(budget.entryMax)}, local transport ${money(budget.localTransportMin)}–${money(budget.localTransportMax)}. I won't invent a bus recommendation.`;
  }

  const budgetMatch = text.match(/(?:₹|rs\.?\s*|rupees?\s*)(\d{2,5})|budget\s*(?:of\s*)?(?:₹|rs\.?\s*)?(\d{2,5})/i);
  if (budgetMatch) {
    const budget = Number(budgetMatch[1] || budgetMatch[2]);
    const origin = findKnownOrigin(text) ?? 'Charbagh Railway Station';
    const results = DEMO_PLACES.flatMap((place) => findJourneyOptions(origin, place.name))
      .filter((quote) => quote.roundTripTotalInr <= budget)
      .sort((a, b) => a.roundTripTotalInr - b.roundTripTotalInr);
    if (!results.length) return `I found no route-backed demo trips from ${origin} within ${money(budget)}. Try another origin or a higher budget.`;
    return `${results.length} route-backed demo trip${results.length === 1 ? '' : 's'} from ${origin} fit within ${money(budget)}: ${results.slice(0, 3).map((quote) => `${quote.place.name} on BUS-${quote.route.busNumber}, about ${money(quote.roundTripTotalInr)} round trip`).join('; ')}. Costs are estimated demo values.`;
  }

  if (/next bus|when.*bus|next departure/i.test(text)) {
    const route = DEMO_ROUTES.find((candidate) =>
      text.toLowerCase().includes(candidate.destination.toLowerCase()) ||
      text.toLowerCase().includes(candidate.origin.toLowerCase()) ||
      candidate.stops.some((stop) => text.toLowerCase().includes(stop.name.toLowerCase()))
    );
    if (!route) return 'The app has no live departure feed. Tell me a supported place or route name and I can read the sample route frequency.';
    return `BUS-${route.busNumber} (${route.routeName}) is a demo route with a sample frequency of every ${route.frequencyMinutes} minutes. This is not the next live departure; no real-time bus feed is connected.`;
  }

  if (/which bus|bus should|route|how long|travel time|get down|stop/i.test(text)) {
    const origin = findKnownOrigin(text) ?? 'Charbagh Railway Station';
    const destination = namedPlace?.name;
    if (destination) {
      const quote = findJourneyOptions(origin, destination)[0];
      if (quote) {
        return `From ${origin} to ${destination}, take demo BUS-${quote.route.busNumber}. Board at ${quote.boardStop}, get down at ${quote.alightStop}. Estimated bus time: about ${quote.travelMinutes} minutes; demo fare: ${money(quote.busFareInr)} one way.`;
      }
      return `There is no direct ${origin} to ${destination} bus connection in the app's demo route data. Try a destination listed among the supported route stops.`;
    }
    const matches = DEMO_ROUTES.filter((route) =>
      text.toLowerCase().includes(route.destination.toLowerCase()) ||
      text.toLowerCase().includes(route.origin.toLowerCase()) ||
      route.stops.some((stop) => text.toLowerCase().includes(stop.name.toLowerCase()))
    );
    if (matches.length) {
      const route = matches[0];
      return `The matching demo route is BUS-${route.busNumber}, ${route.routeName}, from ${route.origin} to ${route.destination}. Sample duration: about ${route.stops.at(-1)?.estimatedMinutes ?? 'unknown'} minutes; departure frequency: every ${route.frequencyMinutes} minutes.`;
    }
    return `I can only recommend routes in the demo database. Supported route buses: ${DEMO_ROUTES.map((route) => `BUS-${route.busNumber} (${route.origin} to ${route.destination})`).join('; ')}.`;
  }

  if (/place|visit|plan a trip|bara imambara|hazratganj/i.test(text)) {
    const options = getSupportedJourneyDestinations('Charbagh Railway Station');
    return `I can plan a route-backed trip from Charbagh Railway Station to ${options.join(', ')} using the available demo routes. Tell me a destination or a budget.`;
  }

  return 'I can help with routes, bus numbers, demo fares, travel times and estimated place budgets from the app data. Try “How can I go from Charbagh Railway Station to Hazratganj?” or “Show trips under ₹500.”';
}
