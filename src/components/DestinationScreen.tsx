import React, { useState } from 'react';
import { Mic, MicOff, Search, Navigation, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { speechRecognition } from '../modules/voice/speechRecognition';
import { speechSynth } from '../modules/voice/speechSynthesis';
import { audioChimes } from '../modules/voice/audioChimes';
import { hapticEngine } from '../modules/voice/hapticEngine';

interface DestinationScreenProps {
  onSearch: (destination: string) => void;
}

export const DestinationScreen: React.FC<DestinationScreenProps> = ({ onSearch }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const handleStartVoice = () => {
    audioChimes.play('tap');
    hapticEngine.tap();
    setVoiceError(null);
    setVoiceTranscript('Listening... Please say your destination.');

    speechRecognition.startListening(
      (result) => {
        setIsListening(false);
        setVoiceTranscript(`Recognized: "${result.transcript}"`);
        setInputText(result.cleanedDestination);
        audioChimes.play('success');
        hapticEngine.tap();
        speechSynth.announceDestinationRecognized(result.cleanedDestination);
        onSearch(result.cleanedDestination);
      },
      (error) => {
        setIsListening(false);
        setVoiceError(error);
        setVoiceTranscript('');
        audioChimes.play('wrong-bus');
        hapticEngine.tap();
        speechSynth.speak(error);
      },
      (status) => {
        setIsListening(status);
      }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    audioChimes.play('tap');
    hapticEngine.tap();
    speechSynth.announceDestinationRecognized(inputText.trim());
    onSearch(inputText.trim());
  };

  const handleQuickSelect = (destination: string) => {
    setInputText(destination);
    audioChimes.play('tap');
    hapticEngine.tap();
    speechSynth.announceDestinationRecognized(destination);
    onSearch(destination);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Title & Accessible Instruction */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold tracking-wide">
          <Navigation className="w-3.5 h-3.5" />
          Voice-First Accessible Transit
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Where would you like to travel?
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Tap the microphone button or press the <kbd className="px-2 py-0.5 font-mono text-xs bg-slate-200 dark:bg-slate-700 rounded">Space bar</kbd> to speak. You can also type your destination below.
        </p>
      </div>

      {/* Primary Voice Mic Action */}
      <div className="flex flex-col items-center justify-center mb-10">
        <button
          onClick={handleStartVoice}
          aria-label={isListening ? 'Microphone active, listening for destination' : 'Tap to speak your destination (Shortcut: Space or Alt+V)'}
          className={`relative group w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all shadow-xl active:scale-95 ${
            isListening
              ? 'bg-rose-600 text-white ring-8 ring-rose-400/40 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
          }`}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-60 pointer-events-none" />
          )}
          {isListening ? (
            <>
              <MicOff className="w-12 h-12 sm:w-16 sm:h-16" />
              <span className="text-xs font-bold mt-1 tracking-wider uppercase">Listening...</span>
            </>
          ) : (
            <>
              <Mic className="w-12 h-12 sm:w-16 sm:h-16 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold mt-1 tracking-wider uppercase">Tap & Speak</span>
            </>
          )}
        </button>

        {/* Live Voice Status Indicator */}
        {voiceTranscript && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 px-4 py-2 bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-blue-200 rounded-xl font-medium text-sm border border-blue-200 dark:border-slate-700 text-center max-w-md shadow-sm"
          >
            {voiceTranscript}
          </div>
        )}

        {voiceError && (
          <div
            role="alert"
            className="mt-4 px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 rounded-xl font-medium text-sm border border-rose-200 dark:border-rose-800 text-center max-w-md shadow-sm"
          >
            {voiceError}
          </div>
        )}
      </div>

      {/* Manual Text Search Input Alternative */}
      <form onSubmit={handleManualSubmit} className="relative max-w-2xl mx-auto mb-10">
        <label htmlFor="destination-input" className="sr-only">
          Enter destination landmark or station name
        </label>
        <div className="relative flex items-center">
          <MapPin className="absolute left-4 w-6 h-6 text-slate-400 pointer-events-none" />
          <input
            id="destination-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type destination (e.g. Hazratganj)..."
            className="w-full h-14 pl-14 pr-32 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base sm:text-lg font-medium focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Find</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick Demonstration Dest Buttons */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Demonstration Destinations</span>
          <span>Click to test instantly</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => handleQuickSelect('Hazratganj')}
            className="p-3 text-left rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-slate-800/80 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-blue-950 dark:text-blue-100">Hazratganj</span>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                Bus 101 / 305
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">Main Buildathon Scenario</p>
          </button>

          <button
            onClick={() => handleQuickSelect('Gomti Nagar Extension')}
            className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Gomti Nagar</span>
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                Bus 204
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Tech Shuttle Line</p>
          </button>

          <button
            onClick={() => handleQuickSelect('Chaudhary Charan Singh International Airport')}
            className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Airport T2</span>
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                Bus 502
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">Express Route</p>
          </button>
        </div>
      </div>
    </div>
  );
};
