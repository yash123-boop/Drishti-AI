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
import { getUiMessage } from '../modules/voice/uiTranslations';
import type { VoiceLanguage } from '../modules/voice/voiceMessages';
import type { AccessibilitySettings } from '../types/transit';

interface HeaderProps {
  language: VoiceLanguage;
  currentView: string;
  onNavigate: (view: string) => void;
  a11ySettings: AccessibilitySettings;
  onUpdateA11y: (newSettings: Partial<AccessibilitySettings>) => void;
  onOpenEmergency: () => void;
  onOpenValidation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
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
      speechSynth.speakMessage('spokenEnabled');
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
    speechSynth.speakMessage('textSize', { size: next });
  };

  const handleRepeatVoice = () => {
    audioChimes.play('tap');
    hapticEngine.tap();
    speechSynth.repeat();
  };
  const text = (key: Parameters<typeof getUiMessage>[1]) =>
    getUiMessage(language, key);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center rounded-xl p-1.5 focus-visible:ring-4 focus-visible:ring-blue-600"
              aria-label="Margdarshak AI - Go to Home Navigation"
            >
              <div className="flex items-baseline gap-1 text-left leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-[-0.06em] text-slate-900 dark:text-white">
                  Margdarshak
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-[-0.06em] text-violet-600 dark:text-violet-400">
                  AI
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
              {text('journey')}
            </button>

            <button
              onClick={() => onNavigate('scanner')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[44px] flex items-center ${
                currentView === 'scanner' || currentView === 'confirmation'
                  ? 'text-blue-600 bg-blue-50 dark:bg-slate-800 dark:text-blue-400 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {text('scanner')}
            </button>

            <button
              onClick={onOpenValidation}
              className="px-3 py-2 rounded-lg hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap min-h-[44px] flex items-center gap-1.5 text-slate-700 dark:text-slate-200"
              aria-label={text('verify')}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{text('verify')}</span>
            </button>
          </nav>

          {/* Zone 3: Accessibility & Safety Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Repeat Audio Announcement */}
            <button
              onClick={handleRepeatVoice}
              title={text('repeat')}
              aria-label={text('repeat')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Font Scale Cycle */}
            <button
              onClick={cycleTextSize}
              title={text('textSize')}
              aria-label={text('textSize')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors shadow-sm gap-0.5 px-2"
            >
              <Type className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">{a11ySettings.textSize.charAt(0)}</span>
            </button>

            {/* High Contrast Mode */}
            <button
              onClick={toggleContrast}
              title={text('contrast')}
              aria-label={text('contrast')}
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
              title={a11ySettings.speechEnabled ? text('mute') : text('enableSpeech')}
              aria-label={a11ySettings.speechEnabled ? text('mute') : text('enableSpeech')}
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
              aria-label={text('emergency')}
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
