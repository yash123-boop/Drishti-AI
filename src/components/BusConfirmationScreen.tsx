import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Edit2,
  ShieldAlert,
  Volume2,
  Sparkles
} from 'lucide-react';
import type { TransitRoute, OCRResult } from '../types/transit';
import { matchBusToRoute } from '../modules/routes/routeMatcher';
import { speechSynth } from '../modules/voice/speechSynthesis';
import { audioChimes } from '../modules/voice/audioChimes';
import { hapticEngine } from '../modules/voice/hapticEngine';

interface BusConfirmationScreenProps {
  selectedRoute: TransitRoute;
  ocrResult: OCRResult;
  onConfirmMatch: (confirmedNumber: string) => void;
  onRescan: () => void;
  onCancel: () => void;
}

export const BusConfirmationScreen: React.FC<BusConfirmationScreenProps> = ({
  selectedRoute,
  ocrResult,
  onConfirmMatch,
  onRescan,
  onCancel,
}) => {
  const [candidateNumber, setCandidateNumber] = useState(
    ocrResult.candidateNumber || ''
  );
  const [isEditing, setIsEditing] = useState(!ocrResult.candidateNumber);

  // Evaluate match
  const matchResult = matchBusToRoute(candidateNumber, selectedRoute);
  const isMatch = matchResult.status === 'MATCH';
  const isWrongBus = matchResult.status === 'WRONG_BUS';

  const handleConfirm = () => {
    if (!candidateNumber.trim()) return;

    if (isMatch) {
      audioChimes.play('success');
      hapticEngine.tap();
      speechSynth.announceBusMatched(candidateNumber, selectedRoute.routeName);
      onConfirmMatch(candidateNumber);
    } else {
      // Wrong bus alert
      audioChimes.play('wrong-bus');
      hapticEngine.wrongBusAlert();
      speechSynth.announceWrongBus(candidateNumber, selectedRoute.busNumber);
    }
  };

  const handleSpeakStatus = () => {
    audioChimes.play('tap');
    if (isMatch) {
      speechSynth.speak(`Detected Bus ${candidateNumber}. This matches your selected route.`);
    } else if (isWrongBus) {
      speechSynth.speak(matchResult.message);
    } else {
      speechSynth.speak('No valid bus number detected. Please edit or enter manually.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="card-surface p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Step 2: Verify Bus Board
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Confirm Bus Number
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Target Route requires <strong>Bus {selectedRoute.busNumber}</strong> to {selectedRoute.destination}
          </p>
        </div>

        {/* Display OCR Result & Editable Box */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-700 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            {ocrResult.source === 'manual' ? 'Manually Entered Bus Number' : 'Scanned Bus Candidate'}
          </span>

          {isEditing ? (
            <div className="max-w-xs mx-auto">
              <label htmlFor="edit-bus-number" className="sr-only">Edit Bus Number</label>
              <input
                id="edit-bus-number"
                type="text"
                value={candidateNumber}
                onChange={(e) => setCandidateNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 101"
                className="w-full text-center text-4xl sm:text-5xl font-mono font-extrabold tracking-widest py-3 rounded-2xl border-2 border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-inner focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl sm:text-6xl font-mono font-extrabold text-slate-900 dark:text-white tracking-widest">
                {candidateNumber || '— —'}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                title="Edit bus number"
                aria-label="Edit bus number"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {ocrResult.confidence > 0 && !isEditing && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>OCR Confidence: <strong>{ocrResult.confidence}%</strong></span>
              {ocrResult.isReliable && (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Clarity
                </span>
              )}
            </div>
          )}
        </div>

        {ocrResult.source !== 'manual' && (
          <section
            aria-label="Extracted bus board text"
            className="space-y-2 rounded-xl border border-slate-300 bg-slate-50 p-4 text-left dark:border-slate-600 dark:bg-slate-900"
            aria-live="polite"
          >
            <h2 className="font-bold">Extracted information</h2>
            <p><strong>Bus number:</strong> {ocrResult.candidateNumber ?? 'Not detected'}</p>
            <p><strong>Destination:</strong> {ocrResult.destination ?? 'Not detected'}</p>
            <p><strong>Recognized text:</strong> {ocrResult.rawText.trim() || 'No readable text detected.'}</p>
          </section>
        )}

        {/* Dynamic Match Warning / Banner */}
        {candidateNumber && (
          <div>
            {isMatch ? (
              <div
                role="status"
                className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 flex items-start gap-3"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-sm sm:text-base">
                    Correct Bus Verified! (Bus {candidateNumber})
                  </p>
                  <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                    Matches your route: <strong>{selectedRoute.routeName}</strong> towards {selectedRoute.destination}. You can safely board now.
                  </p>
                </div>
              </div>
            ) : isWrongBus ? (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 dark:border-rose-700 text-rose-950 dark:text-rose-100 flex items-start gap-3"
              >
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-sm sm:text-base">
                    Warning: Wrong Bus Detected!
                  </p>
                  <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-200">
                    {matchResult.message}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Read Out Loud Control */}
        <div className="flex justify-center">
          <button
            onClick={handleSpeakStatus}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Read Status Aloud</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={onRescan}
            className="min-h-[50px] rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rescan or Retry</span>
          </button>

          {isMatch ? (
            <button
              onClick={handleConfirm}
              className="min-h-[50px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
            >
              <span>Start Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={!candidateNumber.trim()}
              className="min-h-[50px] rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>Verify Bus Number</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
