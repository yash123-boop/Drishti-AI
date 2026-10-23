import { useState } from 'react';
import { BusFront, MapPin, RotateCcw, Search, Trash2 } from 'lucide-react';
import { DEMO_BUSES, normalizeDemoBusNumber, type DemoBus } from '../modules/routes/demoBusData';
import { formatMessage, getMessages } from '../modules/messages';
import { speechSynth } from '../modules/voice/speechSynthesis';
import { TransitMap } from './TransitMap';

interface DemoBusLookupProps {
  language: string;
}

export function DemoBusLookup({ language }: DemoBusLookupProps) {
  const t = getMessages(language);
  const [busNumber, setBusNumber] = useState('');
  const [bus, setBus] = useState<DemoBus | null>(null);
  const [error, setError] = useState('');

  const lookupBus = (value = busNumber) => {
    const normalized = normalizeDemoBusNumber(value);
    if (!value.trim()) {
      setBus(null);
      setError(t.emptyBus);
      speechSynth.speak(t.emptyBus);
      return;
    }

    if (!normalized) {
      setBus(null);
      setError(t.invalidBus);
      speechSynth.speak(t.invalidBus);
      return;
    }

    const found = DEMO_BUSES[normalized];
    if (!found) {
      setBus(null);
      setError(t.unknownBus);
      speechSynth.speak(t.unknownBus);
      return;
    }

    setError('');
    setBus(found);
    speechSynth.speak(formatMessage(t.busLocated, {
      busNumber: found.busNumber.replace('BUS-', ''),
      location: found.currentLocation,
      destination: found.destination,
      nextStop: found.nextStop,
    }));
  };

  const clearResult = () => {
    setBusNumber('');
    setBus(null);
    setError('');
  };

  return (
    <section
      aria-labelledby="demo-bus-lookup-title"
      className="space-y-4 rounded-2xl border-2 border-blue-200 bg-white p-5 dark:border-blue-900 dark:bg-slate-800 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <BusFront className="mt-1 h-6 w-6 shrink-0 text-blue-700 dark:text-blue-300" aria-hidden="true" />
        <div>
          <h2 id="demo-bus-lookup-title" className="text-xl font-extrabold">
            {t.demoBusLocation}
          </h2>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{t.simulatedLocation}</p>
        </div>
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          lookupBus();
        }}
      >
        <div className="flex-1">
          <label htmlFor="demo-bus-number" className="mb-1 block text-sm font-bold">
            {t.busNumberLabel}
          </label>
          <input
            id="demo-bus-number"
            type="text"
            inputMode="text"
            autoComplete="off"
            value={busNumber}
            onChange={(event) => {
              setBusNumber(event.target.value);
              if (error) setError('');
            }}
            placeholder={t.busNumberPlaceholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'demo-bus-lookup-error' : 'demo-bus-valid-numbers'}
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-base text-slate-950 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400"
          />
          <p id="demo-bus-valid-numbers" className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Demo numbers: BUS-101, BUS-102, BUS-204, BUS-305, BUS-502
          </p>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
        >
          <Search size={19} aria-hidden="true" />
          {t.lookupBus}
        </button>
      </form>

      {error && (
        <div
          id="demo-bus-lookup-error"
          role="alert"
          aria-live="assertive"
          className="flex flex-col gap-3 rounded-xl border-2 border-rose-600 bg-rose-50 p-4 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError('');
              requestAnimationFrame(() => document.getElementById('demo-bus-number')?.focus());
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-rose-700 px-4 py-2 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
          >
            <RotateCcw size={18} aria-hidden="true" />
            {t.retry}
          </button>
        </div>
      )}

      {bus && (
        <article className="space-y-4 rounded-xl border border-slate-300 p-4 dark:border-slate-600 sm:p-5" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-2xl font-extrabold text-blue-800 dark:text-blue-200">{bus.busNumber}</p>
              <p className="font-semibold">{bus.route}</p>
            </div>
            <button
              type="button"
              onClick={clearResult}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-400 px-3 py-2 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 dark:border-slate-500 dark:hover:bg-slate-700"
            >
              <Trash2 size={17} aria-hidden="true" />
              {t.clearBus}
            </button>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail label={t.destination} value={bus.destination} />
            <Detail label={t.currentLocation} value={bus.currentLocation} />
            <Detail label={t.status} value={bus.status} />
            <Detail label={t.nextStop} value={bus.nextStop} />
            <Detail label={t.estimatedArrival} value={bus.estimatedArrival} />
          </dl>

          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-bold">
              <MapPin size={18} aria-hidden="true" />
              {t.demoBusLocation}
            </h3>
            <TransitMap
              currentLocation={{ latitude: bus.latitude, longitude: bus.longitude }}
              currentLocationLabel={`${bus.busNumber} — ${bus.currentLocation}`}
              routes={[bus.routePoints]}
              markers={[{
                latitude: bus.nextStopLatitude,
                longitude: bus.nextStopLongitude,
                label: `${t.nextStop}: ${bus.nextStop}`,
              }]}
            />
          </div>
        </article>
      )}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-900">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
