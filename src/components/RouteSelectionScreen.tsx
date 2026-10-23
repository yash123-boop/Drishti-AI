import React from 'react';
import { ArrowLeft, Bus, Clock, MapPin, CheckCircle, Volume2, ShieldCheck } from 'lucide-react';
import type { TransitRoute } from '../types/transit';
import { speechSynth } from '../modules/voice/speechSynthesis';
import { audioChimes } from '../modules/voice/audioChimes';
import { hapticEngine } from '../modules/voice/hapticEngine';
import { RouteMapPanel } from './RouteMapPanel';
import { DEMO_FARES_INR } from '../modules/routes/demoFareData';
import { getUiMessage } from '../modules/voice/uiTranslations';
import type { VoiceLanguage } from '../modules/voice/voiceMessages';

interface RouteSelectionScreenProps {
  language: VoiceLanguage;
  destinationQuery: string;
  routes: TransitRoute[];
  onSelectRoute: (route: TransitRoute) => void;
  onBack: () => void;
}

export const RouteSelectionScreen: React.FC<RouteSelectionScreenProps> = ({
  language,
  destinationQuery,
  routes,
  onSelectRoute,
  onBack,
}) => {
  const text = (
    key: Parameters<typeof getUiMessage>[1],
    parameters: Record<string, string | number> = {}
  ) => getUiMessage(language, key, parameters);

  const handleSelect = (route: TransitRoute) => {
    audioChimes.play('tap');
    hapticEngine.tap();
    speechSynth.announceScanPrompt(route.busNumber);
    onSelectRoute(route);
  };

  const handleSpeakRouteSummary = (route: TransitRoute) => {
    audioChimes.play('tap');
    speechSynth.announceRouteSummary(
      route.busNumber,
      route.routeName,
      route.origin,
      route.destination,
      route.stops.length,
      route.frequencyMinutes
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Back button & Page Heading */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          aria-label="Back to destination search"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {text('routeTitle', { destination: destinationQuery })}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {routes.length === 0
              ? text('noRoutes')
              : text('routesFound', { count: routes.length })}
          </p>
        </div>
      </div>

      <RouteMapPanel destinationQuery={destinationQuery} />

      {routes.length === 0 ? (
        <div className="text-center py-12 px-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <p className="text-base text-slate-700 dark:text-slate-300">
            {text('noRoutes')}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow hover:bg-blue-700 transition-colors"
            >
              {text('tryAnother')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="card-surface p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Route Details */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-blue-600 text-white font-mono font-extrabold text-lg sm:text-xl rounded-xl tracking-wider shadow-sm">
                    BUS {route.busNumber}
                  </span>
                  <span className="font-bold text-lg text-slate-900 dark:text-white">
                    {route.routeName}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{text('from')} <strong>{route.origin}</strong></span>
                  </div>
                  <span className="hidden sm:inline text-slate-400">→</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{text('to')} <strong>{route.destination}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300">
                    <span aria-hidden="true">₹</span>
                    <span>Demo fare: ₹{DEMO_FARES_INR[route.id] ?? '—'} one way</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{text('every', { minutes: route.frequencyMinutes })}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sample fares and frequencies are estimates for demonstration; check with the operator for real information.</p>
                  <div className="flex items-center gap-1">
                    <Bus className="w-3.5 h-3.5 text-slate-400" />
                    <span>{text('stops', { count: route.stops.length })}</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{route.busType}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => handleSpeakRouteSummary(route)}
                  className="min-h-[48px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  aria-label={`${text('listen')} ${route.busNumber}`}
                >
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span>{text('listen')}</span>
                </button>

                <button
                  onClick={() => handleSelect(route)}
                  className="min-h-[48px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
                  aria-label={`${text('selectRoute')} ${route.busNumber} ${route.destination}`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{text('selectRoute')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
