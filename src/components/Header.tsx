import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  SunMoon,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Vibrate,
  Type
} from 'lucide-react';
import { speechSynth } from '../modules/voice/speechSynthesis';
import { hapticEngine } from '../modules/voice/hapticEngine';
import { audioChimes } from '../modules/voice/audioChimes';
import type { AccessibilitySettings } from '../types/transit';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  a11ySettings: AccessibilitySettings;
  onUpdateA11y: (newSettings: Partial<AccessibilitySettings>) => void;
  onOpenEmergency: () => void;
  onOpenValidation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  a11ySettings,
  onUpdateA11y,
  onOpenEmergency,
  onOpenValidation,
}) => {
  const toggleSpeech = () => {
    const next = !a11ySettings.speechEnabled;
    onUpdateA11y({ speechEnabled: next });
    speechSynth.setEnabled(next);
    audioChimes.play('tap');
    if (next) {
      speechSynth.speak('Spoken announcements enabled');
    }
  };

  const toggleContrast = () => {
    const next = !a11ySettings.highContrast;
    onUpdateA11y({ highContrast: next });
    audioChimes.play('tap');
    hapticEngine.tap();
  };

  const cycleTextSize = () => {
    const sizes: ('normal' | 'large' | 'xlarge')[] = ['normal', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(a11ySettings.textSize);
    const next = sizes[(currentIndex + 1) % sizes.length];
    onUpdateA11y({ textSize: next });
    audioChimes.play('tap');
    hapticEngine.tap();
    speechSynth.speak(`Text size set to ${next}`);
  };

  const handleRepeatVoice = () => {
    audioChimes.play('tap');
    hapticEngine.tap();
    speechSynth.repeat();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left rounded-xl p-1.5 focus-visible:ring-4 focus-visible:ring-blue-600"
              aria-label="Drishti AI - Go to Home Navigation"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Volume2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white block leading-none">
                  Drishti AI
                </span>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block mt-1 tracking-wider uppercase">
                  Accessible Transit
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-2 lg:gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[44px] flex items-center ${
                currentView === 'home' || currentView === 'destination' || currentView === 'routes'
                  ? 'text-blue-600 bg-blue-50 dark:bg-slate-800 dark:text-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Travel & Journey
            </button>

            <button
              onClick={() => onNavigate('scanner')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[44px] flex items-center ${
                currentView === 'scanner' || currentView === 'confirmation'
                  ? 'text-blue-600 bg-blue-50 dark:bg-slate-800 dark:text-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bus Board OCR
            </button>

            <button
              onClick={onOpenValidation}
              className="px-3 py-2 rounded-lg hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
              aria-label="Run Automated Verification Test Suite"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verify Suite (All 5 Scenarios)</span>
            </button>
          </nav>

          {/* Zone 3: Accessibility & Safety Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Repeat Audio Announcement */}
            <button
              onClick={handleRepeatVoice}
              title="Repeat last spoken announcement (Alt+R)"
              aria-label="Repeat last spoken announcement"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Font Scale Cycle */}
            <button
              onClick={cycleTextSize}
              title={`Cycle Text Size (Current: ${a11ySettings.textSize})`}
              aria-label={`Cycle Text Size: current is ${a11ySettings.textSize}`}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors shadow-sm gap-0.5 px-2"
            >
              <Type className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">{a11ySettings.textSize.charAt(0)}</span>
            </button>

            {/* High Contrast Mode */}
            <button
              onClick={toggleContrast}
              title="Toggle Ultra High Contrast (Alt+H)"
              aria-label="Toggle High Contrast Mode"
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-colors shadow-sm ${
                a11ySettings.highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 font-extrabold'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
              }`}
            >
              <SunMoon className="w-5 h-5" />
            </button>

            {/* Speech Toggle */}
            <button
              onClick={toggleSpeech}
              title={a11ySettings.speechEnabled ? 'Mute Speech Synthesis' : 'Enable Speech Synthesis'}
              aria-label={a11ySettings.speechEnabled ? 'Mute Speech Synthesis' : 'Enable Speech Synthesis'}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            >
              {a11ySettings.speechEnabled ? (
                <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-rose-500" />
              )}
            </button>

            {/* Primary Safety SOS Button */}
            <button
              onClick={onOpenEmergency}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-rose-600/25 active:scale-95 transition-all"
              aria-label="Emergency SOS Assistance (Alt+S)"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="tracking-wider">SOS</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
