import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { runValidationSuite } from '../modules/testing/validation';
import type { TestScenarioResult } from '../types/transit';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestScenarioResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runValidationSuite();
      setResults(res);
      setIsRunning(false);
    }, 400);
  };

  const allPassed = results ? results.every((r) => r.passed) : false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="validation-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <div>
              <h2 id="validation-dialog-title" className="text-xl sm:text-2xl font-extrabold">
                Automated Verification Suite
              </h2>
              <p className="text-xs text-slate-500">
                Tests all 9 core transit and safety verification scenarios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Scenarios...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run All Verification Tests</span>
              </>
            )}
          </button>

          {results && (
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                allPassed
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {allPassed ? `All ${results.length} Scenarios Passed` : 'Some Tests Failed'}
            </span>
          )}
        </div>

        {/* Results List */}
        {results ? (
          <div className="space-y-3">
            {results.map((res) => (
              <div
                key={res.id}
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  res.passed
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                }`}
              >
                {res.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {res.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {res.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
            <p className="text-sm">Click "Run All Verification Tests" above to execute verification.</p>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full min-h-[46px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
