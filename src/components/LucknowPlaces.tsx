import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Landmark, LoaderCircle, Search, X } from 'lucide-react';
import { BusRoutesPanel } from './BusRoutesPanel';
import { RouteMapPanel } from './RouteMapPanel';
import { DEMO_PLACES, PLACE_CATEGORIES, getEstimatedPlaceBudget, inferPlaceCategory } from '../modules/places/demoPlaces';
import { findJourneyOptions } from '../modules/routes/journeyPlanner';

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  category: string;
  type: string;
}

interface Place {
  id: string;
  name: string;
  category: string;
  detail: string;
  latitude: number;
  longitude: number;
}

interface LucknowPlacesProps {
  onPlanTrip?: (placeName: string) => void;
  onAskAI?: (question: string) => void;
}

const filters = [
  { label: 'Popular picks', query: '' },
  { label: 'Museums & heritage', query: 'museum' },
  { label: 'Food & shopping', query: 'market restaurant shopping' },
  { label: 'Transport', query: 'railway station bus station' },
  { label: 'Parks', query: 'park' },
  { label: 'Hospitals & health', query: 'hospital' },
  { label: 'Education', query: 'school university college' },
  { label: 'Places of worship', query: 'temple mosque' },
];

let lastSearchAt = 0;

async function searchLucknowPlaces(query: string, signal: AbortSignal) {
  const waitMs = Math.max(0, 1100 - (Date.now() - lastSearchAt));
  if (waitMs) await new Promise((resolve) => window.setTimeout(resolve, waitMs));
  if (signal.aborted) throw new DOMException('Search cancelled', 'AbortError');
  lastSearchAt = Date.now();

  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    limit: '30',
    countrycodes: 'in',
    viewbox: '80.75,27.05,81.15,26.65',
    bounded: '1',
    q: `${query}, Lucknow, Uttar Pradesh, India`,
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal });
  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? 'Place search is busy. Please wait a moment and try again.'
        : `Could not search Lucknow places (server error ${response.status}).`
    );
  }

  return (await response.json()) as SearchResult[];
}

function toPlace(result: SearchResult): Place | null {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const name = result.name || result.display_name.split(',')[0];
  return {
    id: String(result.place_id),
    name,
    category: inferPlaceCategory(result.category, result.type),
    detail: result.display_name,
    latitude,
    longitude,
  };
}

export const LucknowPlaces: React.FC<LucknowPlacesProps> = ({ onPlanTrip, onAskAI }) => {
  const [searchText, setSearchText] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('All places');
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      activeRequest.current?.abort();
    },
    []
  );

  const performSearch = async (query: string) => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setError(null);
    setIsLoading(true);
    setHasSearched(true);
    setSelectedPlace(null);

    try {
      const results = await searchLucknowPlaces(query || 'landmark', controller.signal);
      const mapped = results.map(toPlace).filter((place): place is Place => place !== null);
      setPlaces(mapped);
      setSearchCount(mapped.length);
    } catch (caughtError) {
      if (controller.signal.aborted) return;
      setError(caughtError instanceof Error ? caughtError.message : 'Could not search Lucknow places.');
      setPlaces([]);
      setSearchCount(0);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchText.trim();
    if (query) void performSearch(query);
  };

  const handleFilter = (query: string) => {
    if (!query) {
      activeRequest.current?.abort();
      setIsLoading(false);
      setError(null);
      setHasSearched(false);
      setPlaces([]);
      setSearchCount(0);
      setSelectedPlace(null);
      setSearchText('');
      return;
    }
    setSearchText(query);
    void performSearch(query);
  };

  const handlePopularPlace = (name: string) => {
    setSearchText(name);
    void performSearch(name);
  };

  return (
    <section
      aria-labelledby="lucknow-places-heading"
      className="mb-8 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="mb-4">
        <h2 id="lucknow-places-heading" className="text-xl font-extrabold text-slate-900 dark:text-white">
          Explore places across Lucknow
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Search map-listed landmarks, neighbourhoods, markets, transit stops, parks, hospitals, schools and more.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative mb-3">
        <label htmlFor="lucknow-place-search" className="sr-only">Search places in Lucknow</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          id="lucknow-place-search"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search any Lucknow place (e.g. hospital, market, Bara Imambara)…"
          className="h-12 w-full rounded-xl border-2 border-slate-300 bg-white pl-12 pr-28 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={!searchText.trim() || isLoading}
          className="absolute right-1 top-1/2 inline-flex min-h-10 -translate-y-1/2 items-center gap-1 rounded-lg bg-blue-600 px-3 font-bold text-white disabled:opacity-50"
        >
          <Search className="h-4 w-4" /> Search
        </button>
      </form>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2" aria-label="Search Lucknow places by category">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => handleFilter(filter.query || 'Lucknow')}
            className="min-h-10 shrink-0 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-violet-500 hover:bg-violet-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-violet-950/30"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <p role="status" className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Searching mapped Lucknow places…
        </p>
      )}

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => searchText.trim() && void performSearch(searchText.trim())}
            className="mt-3 min-h-10 rounded-lg bg-rose-700 px-4 font-bold text-white"
          >
            Retry search
          </button>
        </div>
      )}

      {selectedPlace && (
        <div className="mb-4 rounded-xl border-2 border-violet-300 p-4 dark:border-violet-800">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{selectedPlace.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {selectedPlace.detail}
                {' · '}
                {selectedPlace.latitude.toFixed(5)}, {selectedPlace.longitude.toFixed(5)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlace(null)}
              aria-label="Close selected place route"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <PlaceBudgetDetails
            placeName={selectedPlace.name}
            category={selectedPlace.category}
            onPlanTrip={onPlanTrip}
            onAskAI={onAskAI}
          />
          <BusRoutesPanel
            key={`buses-${selectedPlace.id}`}
            latitude={selectedPlace.latitude}
            longitude={selectedPlace.longitude}
            placeName={selectedPlace.name}
          />
          <RouteMapPanel
            key={`route-${selectedPlace.id}`}
            destinationQuery={selectedPlace.name}
            destinationOverride={{
              latitude: selectedPlace.latitude,
              longitude: selectedPlace.longitude,
              label: selectedPlace.name,
            }}
          />
        </div>
      )}

      {!hasSearched && (
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-extrabold text-slate-900 dark:text-white">Popular places</h3>
          <div className="mb-5 grid gap-2 sm:grid-cols-3">
            {DEMO_PLACES.filter((place) => ['bara-imambara', 'hazratganj', 'janeshwar-mishra-park'].includes(place.id)).map((place) => (
              <button key={place.id} type="button" onClick={() => handlePopularPlace(place.name)} className="min-h-12 rounded-xl border-2 border-violet-300 bg-violet-50 px-4 py-3 text-left font-bold hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 dark:border-violet-800 dark:bg-violet-950/30 dark:hover:bg-violet-900">
                {place.name}<span className="mt-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">{place.category}</span>
              </button>
            ))}
          </div>
          <h3 className="mb-3 text-lg font-extrabold text-slate-900 dark:text-white">Explore destinations by category</h3>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2" aria-label="Filter curated places by category">
            {['All places', ...PLACE_CATEGORIES].map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={`min-h-11 shrink-0 rounded-full border-2 px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 ${activeCategory === category ? 'border-violet-700 bg-violet-700 text-white' : 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {DEMO_PLACES.filter((place) => place.popular && (activeCategory === 'All places' || place.category === activeCategory)).map((place) => (
              <article key={place.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-300 p-4 dark:border-slate-600">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">{place.category}</span>
                  <h4 className="mt-1 text-lg font-extrabold">{place.name}</h4>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{place.description}</p>
                  <p className="mt-2 text-sm font-semibold">Estimated demo budget: ₹{2 * place.busFareMin + place.foodMin + place.entryMin + place.localTransportMin + place.miscellaneousMin}–₹{2 * place.busFareMax + place.foodMax + place.entryMax + place.localTransportMax + place.miscellaneousMax}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Visit: {place.tripDuration} · Best time: {place.bestTime}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => onPlanTrip?.(place.name)} className="min-h-10 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">Plan trip</button>
                  <button type="button" onClick={() => handlePopularPlace(place.name)} className="min-h-10 rounded-lg border border-slate-400 px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 dark:border-slate-600">View route</button>
                  <button type="button" onClick={() => onAskAI?.(`Plan a trip to ${place.name}`)} className="min-h-10 rounded-lg border border-violet-700 px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300">Ask AI</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {hasSearched && !isLoading && !error && (
        <>
          <p role="status" className="mb-3 text-sm font-semibold text-violet-700 dark:text-violet-300">
            {searchCount.toLocaleString()} mapped result{searchCount === 1 ? '' : 's'} found
          </p>
          {places.length ? (
            <div className="grid max-h-[30rem] gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3" aria-label="Lucknow place search results">
              {places.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => setSelectedPlace(place)}
                  className="flex min-h-16 items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-violet-400 hover:bg-violet-50 dark:border-slate-700 dark:hover:bg-violet-950/30"
                >
                  <Landmark className="h-5 w-5 shrink-0 text-violet-600 dark:text-violet-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-900 dark:text-white">{place.name}</span>
                    <span className="block truncate text-xs capitalize text-slate-500 dark:text-slate-400">
                      {place.category} · {place.detail}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              No mapped places found for this search. Try another name or category.
            </p>
          )}
        </>
      )}

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Search results are returned by OpenStreetMap Nominatim for the Lucknow area. Coverage depends on community map data; results are limited and may not include every address or place.
      </p>
    </section>
  );
};

function PlaceBudgetDetails({
  placeName,
  category,
  onPlanTrip,
  onAskAI,
}: {
  placeName: string;
  category: string;
  onPlanTrip?: (placeName: string) => void;
  onAskAI?: (question: string) => void;
}) {
  const place = getEstimatedPlaceBudget(placeName, category);
  const route = findJourneyOptions('Charbagh Railway Station', place.name)[0];
  const totalMin = 2 * place.busFareMin + place.foodMin + place.entryMin + place.localTransportMin + place.miscellaneousMin;
  const totalMax = 2 * place.busFareMax + place.foodMax + place.entryMax + place.localTransportMax + place.miscellaneousMax;

  return (
    <div className="mb-4 space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
      <div>
        <h4 className="text-lg font-extrabold">Destination details</h4>
        <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">{place.category}</p>
        <p className="mt-1 text-sm">{place.description}</p>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="font-bold">Recommended transport</dt><dd>{route ? `BUS-${route.route.busNumber} · ${route.route.routeName}` : 'No direct bus route in the current demo route data'}</dd></div>
        <div><dt className="font-bold">Estimated travel time</dt><dd>{route ? `About ${route.travelMinutes} minutes from Charbagh Railway Station` : 'Not available from the current route data'}</dd></div>
        <div><dt className="font-bold">Best time to visit</dt><dd>{place.bestTime}</dd></div>
        <div><dt className="font-bold">Suggested visit duration</dt><dd>{place.tripDuration}</dd></div>
        <div className="sm:col-span-2"><dt className="font-bold">Accessibility notes</dt><dd>{place.accessibility}</dd></div>
      </dl>
      <div>
        <h5 className="font-extrabold">Estimated demo budget · INR</h5>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <BudgetItem label="One-way bus fare estimate" value={`₹${place.busFareMin}–₹${place.busFareMax}`} />
          <BudgetItem label="Food" value={`₹${place.foodMin}–₹${place.foodMax}`} />
          <BudgetItem label="Entry fee" value={`₹${place.entryMin}–₹${place.entryMax}`} />
          <BudgetItem label="Local transport" value={`₹${place.localTransportMin}–₹${place.localTransportMax}`} />
          <BudgetItem label="Miscellaneous" value={`₹${place.miscellaneousMin}–₹${place.miscellaneousMax}`} />
          <BudgetItem label="Estimated total" value={`₹${totalMin}–₹${totalMax}`} />
        </dl>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Estimated demo budget only; fares, entry prices and other costs are not verified.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onPlanTrip?.(place.name)} className="min-h-11 rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">Plan trip</button>
        <button type="button" onClick={() => onAskAI?.(`Plan a trip to ${place.name}`)} className="min-h-11 rounded-lg border-2 border-violet-700 px-4 py-2 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300">Ask AI</button>
      </div>
    </div>
  );
}

function BudgetItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-white p-2 dark:bg-slate-800"><dt className="font-semibold">{label}</dt><dd>{value}</dd></div>;
}
