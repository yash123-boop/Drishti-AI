import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BusFront, Clock3, IndianRupee, LocateFixed, MapPin, Route, Wallet } from 'lucide-react';
import type { TransitRoute } from '../types/transit';
import { getDemoOrigins, findJourneyOptions, findNearestDemoStop, type JourneyQuote } from '../modules/routes/journeyPlanner';
import { DEMO_PLACES } from '../modules/places/demoPlaces';
import { speechSynth } from '../modules/voice/speechSynthesis';

interface TripPlannerProps {
  initialDestination?: string;
  onInitialDestinationHandled?: () => void;
  onStartJourney?: (route: TransitRoute) => void;
}

const budgetPresets = [100, 250, 500, 1000, 2000];
type Preference = 'cheapest' | 'fastest' | 'accessible' | 'balanced';

export function TripPlanner({ initialDestination = '', onInitialDestinationHandled, onStartJourney }: TripPlannerProps) {
  const origins = useMemo(getDemoOrigins, []);
  const [origin, setOrigin] = useState(origins[0] ?? '');
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(500);
  const [customBudget, setCustomBudget] = useState('');
  const [preference, setPreference] = useState<Preference>('balanced');
  const [travelDate, setTravelDate] = useState('');
  const [hasPlanned, setHasPlanned] = useState(false);
  const [isLocatingOrigin, setIsLocatingOrigin] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const handledDestinationRef = useRef('');

  useEffect(() => {
    if (!initialDestination) {
      handledDestinationRef.current = '';
      return;
    }
    if (handledDestinationRef.current === initialDestination) return;
    handledDestinationRef.current = initialDestination;
    const knownPlace = DEMO_PLACES.find((place) =>
      place.name.toLowerCase() === initialDestination.toLowerCase()
    );
    if (knownPlace) setDestination(knownPlace.name);
    setHasPlanned(true);
    onInitialDestinationHandled?.();
  }, [initialDestination, onInitialDestinationHandled]);

  const options = useMemo(() => {
    if (!destination) return [];
    return sortOptions(findJourneyOptions(origin, destination), preference);
  }, [destination, origin, preference]);

  const affordable = useMemo(() => {
    const destinations = DEMO_PLACES.flatMap((place) =>
      findJourneyOptions(origin, place.name)
    ).filter((quote) => quote.roundTripTotalInr <= budget);
    return sortOptions(destinations, preference);
  }, [origin, budget, preference]);

  const formatRupees = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const plan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasPlanned(true);
    if (destination && options[0]) {
      speechSynth.speak(`Your estimated trip budget is ${options[0].roundTripTotalInr} rupees. The journey takes approximately ${options[0].travelMinutes} minutes one way.`);
    } else if (destination) {
      speechSynth.speak(`No direct bus route from ${origin} to ${destination} is in the demo route data.`);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported by this browser. Choose a listed route stop instead.');
      return;
    }
    setIsLocatingOrigin(true);
    setLocationMessage('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLocatingOrigin(false);
        const nearest = findNearestDemoStop(coords.latitude, coords.longitude);
        if (!nearest || nearest.distanceMeters > 1000) {
          setLocationMessage(nearest
            ? `The nearest demo bus stop is ${nearest.name}, ${Math.round(nearest.distanceMeters)} m away. It is more than 1 km away, so choose a stop manually.`
            : 'No geocoded bus stops are available in the demo route data.');
          return;
        }
        setOrigin(nearest.name);
        setHasPlanned(true);
        setLocationMessage(`Starting point set to nearest listed demo bus stop: ${nearest.name} (${Math.round(nearest.distanceMeters)} m away).`);
      },
      (error) => {
        setIsLocatingOrigin(false);
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. Allow it in browser settings or choose a listed route stop.'
          : error.code === error.POSITION_UNAVAILABLE
            ? 'Your device could not determine a location. Choose a listed route stop instead.'
            : 'The location request timed out. Try again or choose a listed route stop.';
        setLocationMessage(message);
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 }
    );
  };

  const selectBudget = (value: number) => {
    setBudget(value);
    setCustomBudget('');
    setHasPlanned(true);
  };

  return (
    <section id="trip-planner" aria-labelledby="trip-planner-heading" className="scroll-mt-24 space-y-5 rounded-2xl border-2 border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-slate-800 sm:p-6">
      <div className="flex items-start gap-3">
        <Wallet className="mt-1 h-6 w-6 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
        <div>
          <h2 id="trip-planner-heading" className="text-2xl font-extrabold">Trip planner & budget</h2>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Route availability uses the app’s demo transit data. Costs and timings are estimates, not live service or verified prices.</p>
        </div>
      </div>

      <form onSubmit={plan} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="trip-origin" className="mb-1 block font-bold">From</label>
          <select id="trip-origin" value={origin} onChange={(event) => setOrigin(event.target.value)} className="min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
            {origins.map((place) => <option key={place} value={place}>{place}</option>)}
          </select>
          <button type="button" onClick={useCurrentLocation} disabled={isLocatingOrigin} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-emerald-700 px-3 py-2 text-sm font-bold disabled:opacity-60">
            <LocateFixed size={17} aria-hidden="true" /> {isLocatingOrigin ? 'Finding nearest stop…' : 'Use current location'}
          </button>
          {locationMessage && <p role="status" className="mt-2 text-sm">{locationMessage}</p>}
        </div>
        <div>
          <label htmlFor="trip-destination" className="mb-1 block font-bold">To</label>
          <select id="trip-destination" value={destination} onChange={(event) => setDestination(event.target.value)} className="min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
            <option value="">Choose a destination</option>
            {DEMO_PLACES.map((place) => <option key={place.id} value={place.name}>{place.name}</option>)}
          </select>
        </div>
        <fieldset className="md:col-span-2">
          <legend className="mb-2 font-bold">Budget (INR)</legend>
          <div className="flex flex-wrap gap-2">
            {budgetPresets.map((value) => (
              <button key={value} type="button" aria-pressed={budget === value && !customBudget} onClick={() => selectBudget(value)} className={`min-h-11 rounded-lg border-2 px-4 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 ${budget === value && !customBudget ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-400 hover:bg-emerald-50 dark:border-slate-600 dark:hover:bg-emerald-950/40'}`}>
                {formatRupees(value)}
              </button>
            ))}
          </div>
          <div className="mt-3 max-w-sm">
            <label htmlFor="custom-trip-budget" className="mb-1 block text-sm font-semibold">Custom budget (₹ INR)</label>
            <input id="custom-trip-budget" type="number" min="1" step="1" inputMode="numeric" value={customBudget} onChange={(event) => {
              setCustomBudget(event.target.value);
              if (Number(event.target.value) > 0) {
                setBudget(Number(event.target.value));
                setHasPlanned(true);
              }
            }} placeholder="Enter amount in rupees" className="min-h-11 w-full rounded-lg border-2 border-slate-300 bg-white px-3 text-slate-950 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
          </div>
        </fieldset>
        <div>
          <label htmlFor="trip-preference" className="mb-1 block font-bold">Travel preference</label>
          <select id="trip-preference" value={preference} onChange={(event) => setPreference(event.target.value as Preference)} className="min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900">
            <option value="balanced">Balanced</option>
            <option value="cheapest">Cheapest</option>
            <option value="fastest">Fastest</option>
            <option value="accessible">Accessible (prioritize route bus type)</option>
          </select>
        </div>
        <div>
          <label htmlFor="trip-date" className="mb-1 block font-bold">Travel date (optional)</label>
          <input id="trip-date" type="date" value={travelDate} onChange={(event) => setTravelDate(event.target.value)} className="min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900" />
        </div>
        <div className="flex items-end">
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-extrabold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
            Plan this trip <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
      </form>

      <section aria-labelledby="budget-recommendations-heading" aria-live="polite" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="budget-recommendations-heading" className="text-lg font-extrabold">Trips within {formatRupees(budget)}</h3>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{affordable.length} route-backed option{affordable.length === 1 ? '' : 's'} in the demo data</p>
        </div>
        {affordable.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {affordable.map((quote) => (
              <QuoteCard
                key={`${quote.route.id}-${quote.place.id}`}
                quote={quote}
                formatRupees={formatRupees}
                onStartJourney={onStartJourney}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-300 p-4 text-sm dark:border-slate-600">No demo route-backed trip fits this budget and starting point. Try a higher budget or another origin.</p>
        )}
      </section>

      {hasPlanned && destination && (
        <section aria-live="polite" className="space-y-3 rounded-xl border-2 border-blue-300 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <h3 className="text-xl font-extrabold">Trip plan: {origin} → {destination}</h3>
          {options.length ? options.map((quote) => (
            <div key={quote.route.id} className="space-y-3 rounded-lg bg-white p-4 dark:bg-slate-900">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Detail icon={BusFront} label="Recommended bus" value={`BUS-${quote.route.busNumber} · ${quote.route.routeName}`} />
                <Detail icon={IndianRupee} label="One-way bus fare (demo)" value={formatRupees(quote.busFareInr)} />
                <Detail icon={Clock3} label="Estimated bus travel (one way)" value={`About ${quote.travelMinutes} minutes`} />
                <Detail icon={MapPin} label="Board / get down" value={`${quote.boardStop} → ${quote.alightStop}`} />
                <Detail icon={Route} label="Walking estimate" value={`About ${quote.walkingMinutes} minutes`} />
                <Detail icon={Clock3} label="Return journey estimate" value={`About ${quote.travelMinutes} minutes, assuming the same demo route`} />
              </div>
              <BudgetBreakdown quote={quote} formatRupees={formatRupees} />
              <div className="rounded-lg border border-slate-300 p-3 text-sm dark:border-slate-600">
                <h4 className="font-extrabold">Suggested day itinerary (demo timing)</h4>
                <ol className="mt-2 list-inside list-decimal space-y-1">
                  <li>09:30 — Depart from {quote.boardStop}</li>
                  <li>Arrive in about {quote.travelMinutes} minutes; allow about {quote.walkingMinutes} minutes for the final walk</li>
                  <li>Visit {quote.place.name} for the estimated {quote.place.tripDuration}</li>
                  <li>Return journey: allow about {quote.travelMinutes} minutes; no live departure schedule is available</li>
                </ol>
                {travelDate && <p className="mt-2">Chosen travel date: {travelDate}</p>}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">Suggested schedule only; not a live timetable. Return timing assumes the same demo fare and is not a confirmed return service.</p>
              {onStartJourney && (
                <button type="button" onClick={() => onStartJourney(quote.route)} className="min-h-11 rounded-lg bg-blue-700 px-4 py-2 font-bold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                  Start route guidance
                </button>
              )}
            </div>
          )) : <p role="status" className="font-semibold">No direct route from {origin} to {destination} is listed in the demo transit data. Try a supported stop; no bus connection has been assumed.</p>}
        </section>
      )}
    </section>
  );
}

export function BudgetBreakdown({ quote, formatRupees }: { quote: JourneyQuote; formatRupees: (amount: number) => string }) {
  return (
    <div className="space-y-2">
      <h4 className="font-extrabold">Estimated demo budget · INR</h4>
      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <BudgetLine label="Round-trip transport" value={2 * quote.busFareInr} format={formatRupees} />
        <BudgetLine label="Food estimate" value={quote.foodEstimateInr} format={formatRupees} />
        <BudgetLine label="Entry estimate" value={quote.entryFeeEstimateInr} format={formatRupees} />
        <BudgetLine label="Local transport" value={quote.localTransportEstimateInr} format={formatRupees} />
        <BudgetLine label="Miscellaneous" value={quote.miscellaneousInr} format={formatRupees} />
        <BudgetLine label="Estimated round-trip total" value={quote.roundTripTotalInr} format={formatRupees} strong />
      </dl>
    </div>
  );
}

function QuoteCard({ quote, formatRupees, onStartJourney }: { quote: JourneyQuote; formatRupees: (amount: number) => string; onStartJourney?: (route: TransitRoute) => void }) {
  return (
    <article className="space-y-2 rounded-xl border border-slate-300 p-4 dark:border-slate-600">
      <h4 className="font-extrabold">{quote.place.name}</h4>
      <p className="text-sm">BUS-{quote.route.busNumber} · {quote.travelMinutes} min one way · Round trip {formatRupees(quote.roundTripTotalInr)}</p>
      {onStartJourney && <button type="button" onClick={() => onStartJourney(quote.route)} className="min-h-10 rounded-lg border border-emerald-700 px-3 py-2 text-sm font-bold hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 dark:hover:bg-emerald-950/40">Plan trip</button>}
    </article>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof BusFront; label: string; value: string }) {
  return <p className="inline-flex items-start gap-2 text-sm"><Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span><strong>{label}:</strong> {value}</span></p>;
}

function BudgetLine({ label, value, format, strong = false }: { label: string; value: number; format: (amount: number) => string; strong?: boolean }) {
  return <div className={`rounded-md bg-slate-100 p-2 dark:bg-slate-800 ${strong ? 'font-extrabold' : ''}`}><dt>{label}</dt><dd>{format(value)}</dd></div>;
}

function sortOptions(options: JourneyQuote[], preference: Preference): JourneyQuote[] {
  return [...options].sort((a, b) => {
    if (preference === 'fastest') return a.travelMinutes - b.travelMinutes;
    if (preference === 'accessible') {
      const accessibleA = /accessible|low-floor|wheelchair/i.test(a.route.busType) ? 0 : 1;
      const accessibleB = /accessible|low-floor|wheelchair/i.test(b.route.busType) ? 0 : 1;
      return accessibleA - accessibleB || a.roundTripTotalInr - b.roundTripTotalInr;
    }
    if (preference === 'cheapest') return a.roundTripTotalInr - b.roundTripTotalInr;
    return a.travelMinutes + a.roundTripTotalInr / 10 - (b.travelMinutes + b.roundTripTotalInr / 10);
  });
}
