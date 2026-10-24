import { DEMO_BUSES, normalizeDemoBusNumber } from '../routes/demoBusData';
import { DEMO_PLACES, findDemoPlace, getEstimatedPlaceBudget } from '../places/demoPlaces';
import { findJourneyOptions, getSupportedJourneyDestinations } from '../routes/journeyPlanner';
import { DEMO_ROUTES } from '../routes/routeData';
import { getVoiceMessage } from '../voice/voiceMessages';
import type { JourneyState, RouteMatchResult, TransitRoute } from '../../types/transit';

export type JourneyAssistantStage =
  | 'IDLE'
  | 'DESTINATION_SELECTED'
  | 'ROUTE_SELECTED'
  | 'AT_BUS_STOP'
  | 'SCANNING_BUS'
  | 'BUS_VERIFICATION'
  | 'JOURNEY_STARTED'
  | 'APPROACHING_STOP'
  | 'DESTINATION_REACHED'
  | 'EMERGENCY';

export interface JourneyAssistantContext {
  stage: JourneyAssistantStage;
  destination?: string;
  route?: TransitRoute | null;
  journeyState?: JourneyState;
  detectedBusNumber?: string | null;
  matchingRouteCount?: number;
  verificationStatus?: RouteMatchResult['status'];
}

const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

const hindiLocationAliases: Record<string, string> = {
  'चारबाग': 'Charbagh Railway Station',
  'हजरतगंज': 'Hazratganj',
  'हज़रतगंज': 'Hazratganj',
  'गोमती नगर': 'Gomti Nagar',
  'बड़ा इमामबाड़ा': 'Bara Imambara',
  'बड़ा इमामबाड़ा': 'Bara Imambara',
  'छोटा इमामबाड़ा': 'Chota Imambara',
  'छोटा इमामबाड़ा': 'Chota Imambara',
  'अमीनाबाद': 'Aminabad Market',
  'चौक': 'Chowk',
  'अलमबाग': 'Alambagh Bus Terminal',
  'लखनऊ विश्वविद्यालय': 'Lucknow University',
};

function findNamedPlace(text: string) {
  const directMatch = DEMO_PLACES
    .filter((place) => text.toLowerCase().includes(place.name.toLowerCase()))
    .sort((a, b) => b.name.length - a.name.length)[0];
  if (directMatch) return directMatch;

  const normalizedText = text.toLowerCase();
  const alias = Object.entries(hindiLocationAliases)
    .filter(([hindiName]) => normalizedText.includes(hindiName))
    .sort(
      ([firstName], [secondName]) =>
        normalizedText.lastIndexOf(secondName) - normalizedText.lastIndexOf(firstName)
    )[0];
  return alias ? findDemoPlace(alias[1]) : undefined;
}

function findKnownOrigin(text: string) {
  const locations = Array.from(new Set(DEMO_ROUTES.flatMap((route) => [
    route.origin,
    ...route.stops.map((stop) => stop.name),
  ])));
  const normalizedText = text.toLowerCase().trim();
  const alias = Object.entries(hindiLocationAliases).find(([hindiName]) =>
    normalizedText.includes(hindiName)
  );
  if (alias) {
    const matchedLocation = locations.find(
      (location) => location.toLowerCase() === alias[1].toLowerCase()
    );
    if (matchedLocation) return matchedLocation;
  }
  return locations
    .filter((location) => {
      const normalizedLocation = location.toLowerCase();
      return normalizedText.includes(normalizedLocation) || normalizedLocation.includes(normalizedText);
    })
    .sort((a, b) => b.length - a.length)[0];
}

export function getJourneyStateResponse(context: JourneyAssistantContext, language = 'en-IN'): string {
  const route = context.route ?? context.journeyState?.route;
  const destination = context.destination || route?.destination || context.journeyState?.route?.destination || '';
  const bus = context.detectedBusNumber || route?.busNumber || context.journeyState?.confirmedBusNumber || '';

  switch (context.stage) {
    case 'DESTINATION_SELECTED':
      return context.matchingRouteCount
        ? getVoiceMessage(language, 'routesFound', { count: context.matchingRouteCount, destination })
        : getVoiceMessage(language, 'noRoutes', { destination });
    case 'ROUTE_SELECTED':
      return route
        ? getVoiceMessage(language, 'routeSummary', {
            bus: route.busNumber,
            route: route.routeName,
            origin: route.origin,
            destination: route.destination,
            stops: route.stops.length,
            frequency: route.frequencyMinutes,
          })
        : getVoiceMessage(language, 'welcome');
    case 'AT_BUS_STOP':
      return getVoiceMessage(language, 'assistantAtBusStop', {
        stop: route?.origin ?? destination,
      });
    case 'SCANNING_BUS':
      return getVoiceMessage(language, 'assistantScanningBus');
    case 'BUS_VERIFICATION':
      if (context.verificationStatus === 'MATCH') {
        return getVoiceMessage(language, 'busMatched', {
          bus: bus || route?.busNumber || '',
          route: route?.routeName ?? '',
        });
      }
      if (context.verificationStatus === 'WRONG_BUS') {
        return getVoiceMessage(language, 'wrongBus', {
          scanned: bus || 'unknown',
          expected: route?.busNumber ?? '',
        });
      }
      if (context.verificationStatus === 'UNRECOGNIZED') {
        return getVoiceMessage(language, 'invalidBus');
      }
      return getVoiceMessage(language, 'assistantVerifyingBus', {
        bus: bus || 'unknown',
        destination,
      });
    case 'JOURNEY_STARTED': {
      const state = context.journeyState;
      if (state?.status === 'PAUSED') return getVoiceMessage(language, 'journeyPaused');
      const current = state?.currentStop?.name ?? route?.origin ?? '';
      const next = state?.nextStop?.name ?? null;
      return next
        ? getVoiceMessage(language, 'stopProgressNext', { current, next })
        : getVoiceMessage(language, 'journeyStarted', { origin: current, destination });
    }
    case 'APPROACHING_STOP':
      return getVoiceMessage(language, 'approaching', { destination });
    case 'DESTINATION_REACHED':
      return getVoiceMessage(language, 'destinationReached', { destination });
    case 'EMERGENCY':
      return getVoiceMessage(language, 'assistantEmergency');
    case 'IDLE':
    default:
      return getVoiceMessage(language, 'welcome');
  }
}

export function answerJourneyQuestion(
  question: string,
  context?: JourneyAssistantContext,
  language = 'en-IN'
): string {
  const text = question.trim();
  const isHindi = language === 'hi-IN';
  if (!text) {
    return isHindi
      ? 'यात्रा से जुड़ा सवाल बोलें या लिखें। मैं उपलब्ध डेमो बस मार्गों, किरायों और स्थानों की जानकारी दे सकता हूँ।'
      : 'Type or speak a journey question. I can only answer from the available demo bus routes, fares, and place records.';
  }

  const asksForCurrentState =
    /\b(what should i do|what can i do|what now|what next|next step|journey status|where am i|where am i now)\b/i.test(text) ||
    /(मैं कहाँ हूँ|अभी मैं कहाँ|अब क्या करूँ|अगला कदम|यात्रा की स्थिति|मेरा अगला स्टॉप)/.test(text);
  if (context && asksForCurrentState) return getJourneyStateResponse(context, language);

  if (
    context?.stage === 'BUS_VERIFICATION' &&
    /\b(which bus|my bus|selected route|right bus|correct bus|does this bus)\b/i.test(text)
  ) {
    return getJourneyStateResponse(context, language);
  }

  const busMatch = text.match(/\bBUS[-\s]?(\d{3})\b/i) ??
    (/^\s*(\d{3})\s*$/.exec(text) ? [text, text.trim()] : null);
  if (busMatch) {
    const busKey = normalizeDemoBusNumber(busMatch[0]);
    const bus = busKey ? DEMO_BUSES[busKey] : undefined;
    if (!bus) {
      return isHindi
        ? `BUS-${busMatch[1]} डेमो बस सूची में नहीं है। मैं इसका मार्ग या स्थान सत्यापित नहीं कर सकता।`
        : `BUS-${busMatch[1]} is not present in the demo bus database. I cannot verify its route or location.`;
    }
    if (isHindi) {
      return `${bus.busNumber} डेमो में ${bus.destination} जाने वाले ${bus.route} पर दर्ज है। डेमो स्थान: ${bus.currentLocation}। अगला स्टॉप: ${bus.nextStop}। अनुमानित डेमो किराया: ${money(bus.fareInr)}। स्थान और समय सिम्युलेटेड हैं, लाइव GPS नहीं।`;
    }
    return `${bus.busNumber} is listed on ${bus.route} to ${bus.destination}. Demo location: ${bus.currentLocation}. Next stop: ${bus.nextStop}. Estimated demo fare: ${money(bus.fareInr)}. Its location and ETA are simulated, not live GPS.`;
  }

  const fromMatch = text.match(/\bfrom\s+(.+?)\s+\bto\s+(.+?)(?:[?.!,]|$)/i);
  const hindiFromText = text
    .replace(/^\s*(?:mujhe|मुझे)\s+/i, '')
    .replace(/\s+(?:kaise|कैसे|jaun|जाऊँ|जाऊं|jana|जाना|है).*$/i, '')
    .replace(/[?.!,]+$/, '');
  const hindiFromMatch = hindiFromText.match(/^(.+?)\s+(?:se|से)\s+(.+)$/i);
  const namedPlace = findNamedPlace(text);
  const originText = fromMatch?.[1]?.trim() || hindiFromMatch?.[1]?.trim();
  const from =
    (originText ? findKnownOrigin(originText) : undefined) ||
    findKnownOrigin(text) ||
    'Charbagh Railway Station';
  const to = fromMatch?.[2]?.trim() || namedPlace?.name || hindiFromMatch?.[2]?.trim();

  if (namedPlace && /budget|cost|fare|price|cheap|low.?budget/i.test(text)) {
    const place = namedPlace;
    const direct = findJourneyOptions(from, place.name)[0];
    const transportMin = direct ? 2 * direct.busFareInr : 2 * place.busFareMin;
    const transportMax = direct ? 2 * direct.busFareInr : 2 * place.busFareMax;
    const low = transportMin + place.foodMin + place.entryMin + place.localTransportMin + place.miscellaneousMin;
    const high = transportMax + place.foodMax + place.entryMax + place.localTransportMax + place.miscellaneousMax;
    const routeNote = direct
      ? isHindi
        ? `${from} से उपलब्ध डेमो विकल्प BUS-${direct.route.busNumber} है; एक तरफ़ का अनुमानित किराया ${money(direct.busFareInr)} है।`
        : `From ${from}, a route-backed option is BUS-${direct.route.busNumber}; its demo one-way fare is ${money(direct.busFareInr)}.`
      : isHindi
        ? `डेमो मार्गों में ${from} से इस स्थान तक सीधा बस मार्ग दर्ज नहीं है; परिवहन केवल सामान्य अनुमान है।`
        : `No direct bus route from ${from} to this place is listed in the demo route data; transport is only a generic estimate.`;
    if (isHindi) {
      return `${routeNote} ${place.name} की अनुमानित डेमो यात्रा लागत ${money(low)}–${money(high)} है। इसमें आने-जाने का बस किराया, भोजन, प्रवेश, स्थानीय परिवहन और अन्य खर्च शामिल हैं। कीमतें केवल अनुमान हैं।`;
    }
    return `${routeNote} Estimated demo visit budget for ${place.name}: ${money(low)}–${money(high)} round trip including bus fare estimate, food, entry, local transport and miscellaneous costs. Prices are estimates, not verified.`;
  }

  if (to) {
    const place = findDemoPlace(to);
    const quotes = findJourneyOptions(from, place?.name ?? to);
    if (quotes.length) {
      const quote = quotes[0];
      if (isHindi) {
        return `${from} से ${quote.place.name} तक डेमो मार्ग BUS-${quote.route.busNumber}, ${quote.route.routeName} है। ${quote.boardStop} से बस लें और ${quote.alightStop} पर उतरें। एक तरफ़ का अनुमानित किराया ${money(quote.busFareInr)} और यात्रा समय लगभग ${quote.travelMinutes} मिनट है। भोजन, प्रवेश और अन्य अनुमानित खर्चों सहित आने-जाने का कुल डेमो खर्च ${money(quote.roundTripTotalInr)} है। यह लाइव समय-सारणी या सत्यापित कीमत नहीं है।`;
      }
      return `From ${from} to ${quote.place.name}, the demo route is BUS-${quote.route.busNumber}, ${quote.route.routeName}. Board at ${quote.boardStop} and get down at ${quote.alightStop}. Estimated bus fare: ${money(quote.busFareInr)} one way; travel time: about ${quote.travelMinutes} minutes. Estimated round-trip total including food, entry and miscellaneous expenses: ${money(quote.roundTripTotalInr)}. These are demo estimates, not a live timetable or verified prices.`;
    }
    const budget = getEstimatedPlaceBudget(to, 'place');
    if (isHindi) {
      return `${budget.name} की अनुमानित लागत उपलब्ध है, लेकिन डेमो डेटा में ${from} से वहाँ तक सीधा बस मार्ग नहीं है। बस मार्ग के बिना अनुमानित खर्च: भोजन ${money(budget.foodMin)}–${money(budget.foodMax)}, प्रवेश ${money(budget.entryMin)}–${money(budget.entryMax)}, स्थानीय परिवहन ${money(budget.localTransportMin)}–${money(budget.localTransportMax)}। मैं बस मार्ग का अनुमान नहीं लगाऊँगा।`;
    }
    return `I found ${budget.name} in the place estimates, but there is no direct ${from} to ${budget.name} bus connection in the app's demo route data. Estimated demo visit costs (excluding an unlisted bus route): food ${money(budget.foodMin)}–${money(budget.foodMax)}, entry ${money(budget.entryMin)}–${money(budget.entryMax)}, local transport ${money(budget.localTransportMin)}–${money(budget.localTransportMax)}. I won't invent a bus recommendation.`;
  }

  const budgetMatch = text.match(/(?:₹|rs\.?\s*|rupees?\s*)(\d{2,5})|budget\s*(?:of\s*)?(?:₹|rs\.?\s*)?(\d{2,5})/i);
  if (budgetMatch) {
    const budget = Number(budgetMatch[1] || budgetMatch[2]);
    const origin = findKnownOrigin(text) ?? 'Charbagh Railway Station';
    const results = DEMO_PLACES.flatMap((place) => findJourneyOptions(origin, place.name))
      .filter((quote) => quote.roundTripTotalInr <= budget)
      .sort((a, b) => a.roundTripTotalInr - b.roundTripTotalInr);
    if (!results.length) {
      return isHindi
        ? `${money(budget)} के बजट में ${origin} से कोई डेमो मार्ग वाला सफ़र नहीं मिला। दूसरा शुरुआती स्थान या अधिक बजट आज़माएँ।`
        : `I found no route-backed demo trips from ${origin} within ${money(budget)}. Try another origin or a higher budget.`;
    }
    if (isHindi) {
      return `${origin} से ${money(budget)} के बजट में ${results.length} डेमो यात्राएँ उपलब्ध हैं: ${results.slice(0, 3).map((quote) => `${quote.place.name}, BUS-${quote.route.busNumber}, आने-जाने का अनुमानित खर्च ${money(quote.roundTripTotalInr)}`).join('; ')}। लागत डेमो अनुमान हैं।`;
    }
    return `${results.length} route-backed demo trip${results.length === 1 ? '' : 's'} from ${origin} fit within ${money(budget)}: ${results.slice(0, 3).map((quote) => `${quote.place.name} on BUS-${quote.route.busNumber}, about ${money(quote.roundTripTotalInr)} round trip`).join('; ')}. Costs are estimated demo values.`;
  }

  if (/next bus|when.*bus|next departure|अगली बस|बस कब|अगला प्रस्थान/i.test(text)) {
    const route = DEMO_ROUTES.find((candidate) =>
      text.toLowerCase().includes(candidate.destination.toLowerCase()) ||
      text.toLowerCase().includes(candidate.origin.toLowerCase()) ||
      candidate.stops.some((stop) => text.toLowerCase().includes(stop.name.toLowerCase()))
    );
    if (!route) {
      return isHindi
        ? 'ऐप में बसों के लाइव प्रस्थान की जानकारी नहीं है। किसी समर्थित स्थान या मार्ग का नाम बताएँ, मैं डेमो बस की आवृत्ति बता सकता हूँ।'
        : 'The app has no live departure feed. Tell me a supported place or route name and I can read the sample route frequency.';
    }
    if (isHindi) {
      return `डेमो मार्ग BUS-${route.busNumber} (${route.routeName}) की बस हर ${route.frequencyMinutes} मिनट में चलने का नमूना दिया गया है। यह अगली लाइव बस का समय नहीं है; रियल-टाइम बस जानकारी उपलब्ध नहीं है।`;
    }
    return `BUS-${route.busNumber} (${route.routeName}) is a demo route with a sample frequency of every ${route.frequencyMinutes} minutes. This is not the next live departure; no real-time bus feed is connected.`;
  }

  if (/which bus|bus should|route|how long|travel time|get down|stop|कौन सी बस|कौनसी बस|बस मार्ग|कितना समय|कहाँ उतर|स्टॉप|कैसे जा|कैसे पहुँच|कैसे पहुंच|बस से जाना/i.test(text)) {
    const origin = findKnownOrigin(text) ?? 'Charbagh Railway Station';
    const destination = namedPlace?.name;
    if (destination) {
      const quote = findJourneyOptions(origin, destination)[0];
      if (quote) {
        if (isHindi) {
          return `${origin} से ${destination} जाने के लिए डेमो बस BUS-${quote.route.busNumber} लें। ${quote.boardStop} से चढ़ें और ${quote.alightStop} पर उतरें। अनुमानित बस समय लगभग ${quote.travelMinutes} मिनट और एक तरफ़ का डेमो किराया ${money(quote.busFareInr)} है।`;
        }
        return `From ${origin} to ${destination}, take demo BUS-${quote.route.busNumber}. Board at ${quote.boardStop}, get down at ${quote.alightStop}. Estimated bus time: about ${quote.travelMinutes} minutes; demo fare: ${money(quote.busFareInr)} one way.`;
      }
      if (isHindi) {
        return `ऐप के डेमो मार्गों में ${origin} से ${destination} तक सीधा बस मार्ग नहीं है। समर्थित बस स्टॉपों में से कोई गंतव्य आज़माएँ।`;
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
      if (isHindi) {
        return `मिलता-जुलता डेमो मार्ग BUS-${route.busNumber}, ${route.routeName} है। यह ${route.origin} से ${route.destination} तक जाता है। अनुमानित समय ${route.stops.at(-1)?.estimatedMinutes ?? 'उपलब्ध नहीं'} मिनट है और बस हर ${route.frequencyMinutes} मिनट में चलने का नमूना है।`;
      }
      return `The matching demo route is BUS-${route.busNumber}, ${route.routeName}, from ${route.origin} to ${route.destination}. Sample duration: about ${route.stops.at(-1)?.estimatedMinutes ?? 'unknown'} minutes; departure frequency: every ${route.frequencyMinutes} minutes.`;
    }
    if (isHindi) {
      return `मैं केवल डेमो डेटाबेस के मार्ग बता सकता हूँ। उपलब्ध बस मार्ग: ${DEMO_ROUTES.map((route) => `BUS-${route.busNumber} (${route.origin} से ${route.destination})`).join('; ')}।`;
    }
    return `I can only recommend routes in the demo database. Supported route buses: ${DEMO_ROUTES.map((route) => `BUS-${route.busNumber} (${route.origin} to ${route.destination})`).join('; ')}.`;
  }

  if (/place|visit|plan a trip|bara imambara|hazratganj|यात्रा की योजना|कहाँ घूम|जाना चाहता|जाना चाहती/i.test(text)) {
    const options = getSupportedJourneyDestinations('Charbagh Railway Station');
    if (isHindi) {
      return `मैं उपलब्ध डेमो मार्गों से चारबाग रेलवे स्टेशन से ${options.join(', ')} तक यात्रा की योजना बना सकता हूँ। अपना गंतव्य या बजट बताइए।`;
    }
    return `I can plan a route-backed trip from Charbagh Railway Station to ${options.join(', ')} using the available demo routes. Tell me a destination or a budget.`;
  }

  if (isHindi) {
    return 'मैं ऐप की जानकारी से बस मार्ग, बस नंबर, डेमो किराया, यात्रा समय और स्थानों का अनुमानित बजट बता सकता हूँ। उदाहरण: “Charbagh से Hazratganj कैसे जाऊँ?” या “₹500 के अंदर यात्राएँ दिखाएँ।”';
  }
  return 'I can help with routes, bus numbers, demo fares, travel times and estimated place budgets from the app data. Try “How can I go from Charbagh Railway Station to Hazratganj?” or “Show trips under ₹500.”';
}
