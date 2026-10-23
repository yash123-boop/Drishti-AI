import React from 'react';
import {
  MapPin,
  ChevronRight,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Flag,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Flame,
  Vibrate
} from 'lucide-react';
import type { JourneyState } from '../types/transit';
import { speechSynth } from '../modules/voice/speechSynthesis';
import { audioChimes } from '../modules/voice/audioChimes';
import { hapticEngine } from '../modules/voice/hapticEngine';
import { DEMO_FARES_INR } from '../modules/routes/demoFareData';

interface JourneyGuidanceScreenProps {
  journeyState: JourneyState;
  onAdvanceStop: () => void;
  onToggleAutoPlay: (enabled: boolean) => void;
  onPauseResume: () => void;
  onEndJourney: () => void;
}

export const JourneyGuidanceScreen: React.FC<JourneyGuidanceScreenProps> = ({
  journeyState,
  onAdvanceStop,
  onToggleAutoPlay,
  onPauseResume,
  onEndJourney,
}) => {
  const { route, currentStopIndex, currentStop, nextStop, status, isApproaching, hasArrived, autoPlayTimer } =
    journeyState;

  if (!route || !currentStop) return null;

  const totalStops = route.stops.length;
  const progressPercent = Math.round(((currentStopIndex + 1) / totalStops) * 100);

  const handleSpeakCurrent = () => {
    audioChimes.play('tap');
    hapticEngine.tap();
    if (hasArrived) {
      speechSynth.speak(`You have arrived at your final destination: ${route.destination}. The sample one-way bus fare was ${DEMO_FARES_INR[route.id] ?? 'not listed'} rupees. Please exit safely.`);
    } else if (isApproaching) {
      speechSynth.speak(`Warning: Destination approaching. Current stop: ${currentStop.name}. Next stop is your final stop: ${route.destination}. Sample one-way bus fare ${DEMO_FARES_INR[route.id] ?? 'not listed'} rupees.`);
    } else {
      speechSynth.speak(`Current stop: ${currentStop.name}. ${currentStop.landmark}. Next stop: ${nextStop?.name || 'Final stop'}. Sample one-way bus fare ${DEMO_FARES_INR[route.id] ?? 'not listed'} rupees.`);
    }
  };

  const handleManualAdvance = () => {
    audioChimes.play('tap');
    hapticEngine.tap();
    onAdvanceStop();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Target Destination & Progress Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs uppercase">
              Bus {route.busNumber}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {route.routeName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Heading to: {route.destination}
          </h2>
          <p className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-300">Estimated demo fare: ₹{DEMO_FARES_INR[route.id] ?? '—'} one way</p>
        </div>

        {/* Progress Pill & Stop Counter */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase block">Progress</span>
            <span className="text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400">
              Stop {currentStopIndex + 1} of {totalStops}
            </span>
          </div>

          <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-700 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600 stroke-current transition-all duration-500"
                strokeWidth="3.5"
                strokeDasharray={`${progressPercent}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono font-bold text-xs text-slate-800 dark:text-white">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Approaching Alert Banner (Penultimate Stop) */}
      {isApproaching && !hasArrived && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-5 rounded-2xl bg-amber-500 text-slate-950 border-2 border-amber-600 shadow-lg flex items-center justify-between gap-4 animate-bounce"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <p className="font-extrabold text-lg sm:text-xl">
                Approaching Destination!
              </p>
              <p className="text-sm font-semibold opacity-90">
                Your final stop <strong>{route.destination}</strong> is the very next stop. Please prepare to disembark.
              </p>
            </div>
          </div>
          <button
            onClick={() => speechSynth.announceApproaching(route.destination)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Hear Warning</span>
          </button>
        </div>
      )}

      {/* Destination Reached Celebration Banner */}
      {hasArrived && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-6 sm:p-8 rounded-3xl bg-emerald-600 text-white border-2 border-emerald-500 shadow-xl text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Destination Reached!
          </h2>
          <p className="text-base sm:text-lg max-w-lg mx-auto opacity-95">
            You have safely arrived at <strong>{route.destination}</strong>. Thank you for traveling with Drishti AI.
          </p>
          <div className="pt-2">
            <button
              onClick={onEndJourney}
              className="px-8 py-3.5 rounded-2xl bg-white text-emerald-950 font-extrabold text-base shadow-lg hover:bg-emerald-50 active:scale-95 transition-all"
            >
              Finish & Start New Journey
            </button>
          </div>
        </div>
      )}

      {/* Main Current Stop & Next Stop Active Card */}
      {!hasArrived && (
        <div className="card-surface p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-blue-600 dark:border-blue-500 shadow-md space-y-6">
          {/* Current Stop */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                Current Stop
              </span>
              <button
                onClick={handleSpeakCurrent}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1 p-1 rounded"
                aria-label="Speak current stop details"
              >
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span>Repeat Voice</span>
              </button>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentStop.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
              Landmark: {currentStop.landmark}
            </p>
            {currentStop.hapticCues && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Vibrate className="w-3.5 h-3.5 text-blue-500" />
                <span>Tactile Cue: {currentStop.hapticCues}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700" />

          {/* Next Stop Preview */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Next Stop
              </span>
              <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
                {nextStop ? nextStop.name : `${route.destination} (Final Stop)`}
              </p>
            </div>
            {nextStop && (
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">
                ~{nextStop.estimatedMinutes - currentStop.estimatedMinutes} mins away
              </span>
            )}
          </div>

          {/* Large Primary Interaction Controls */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Primary Simulate Next Stop Button */}
            <button
              onClick={handleManualAdvance}
              className="min-h-[58px] rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              aria-label="Simulate arriving at next stop (Alt+N)"
            >
              <span>Simulate Next Stop</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Auto-Advance Simulation Toggle */}
            <button
              onClick={() => onToggleAutoPlay(!autoPlayTimer)}
              className={`min-h-[58px] rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                autoPlayTimer
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
              }`}
            >
              {autoPlayTimer ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>Auto-Advance Active (6s)</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 text-blue-600" />
                  <span>Enable Auto-Advance (6s)</span>
                </>
              )}
            </button>
          </div>

          {/* Pause / Resume & End controls */}
          <div className="flex items-center justify-between pt-2 text-xs font-semibold">
            <button
              onClick={onPauseResume}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg"
            >
              {status === 'PAUSED' ? 'Resume Journey' : 'Pause Journey'}
            </button>
            <button
              onClick={onEndJourney}
              className="text-rose-600 hover:text-rose-700 p-2 rounded-lg"
            >
              End Journey Early
            </button>
          </div>
        </div>
      )}

      {/* Stop Progression Timeline */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Route Stops Timeline ({totalStops} stops)
        </h3>
        <div className="space-y-3">
          {route.stops.map((stop, idx) => {
            const isCompleted = idx < currentStopIndex;
            const isCurrent = idx === currentStopIndex;
            const isNext = idx === currentStopIndex + 1;

            return (
              <div
                key={stop.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div>
                    <span
                      className={`font-bold text-sm block ${
                        isCurrent
                          ? 'text-blue-950 dark:text-blue-100'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {stop.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block truncate max-w-xs sm:max-w-md">
                      {stop.landmark}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isCurrent && (
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                  {isNext && (
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                      Next Stop
                    </span>
                  )}
                  {!isCurrent && !isNext && (
                    <span className="text-xs font-mono text-slate-400">
                      +{stop.estimatedMinutes}m
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
