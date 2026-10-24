/**
 * Drishti AI — Voice-First Accessible Public Transit Companion
 * Integrated prototype for blind and visually impaired commuters
 *
 * Modules integrated:
 * 1. Frontend & UI (Ritik Pathak)
 * 2. Core Logic, Route Management & Journey Engine (Yash Srivastava)
 * 3. Voice Recognition, Speech Synthesis & Bus Board OCR (Akhand Pratap Singh)
 * 4. Accessibility, Safety SOS & Verification Testing (Mohamad Rehan)
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TactileRadar } from './components/TactileRadar';
import { OfflineMapBanner } from './components/OfflineMapBanner';
import { DestinationScreen } from './components/DestinationScreen';
import { RouteSelectionScreen } from './components/RouteSelectionScreen';
import { BusScannerScreen } from './components/BusScannerScreen';
import { BusConfirmationScreen } from './components/BusConfirmationScreen';
import { JourneyGuidanceScreen } from './components/JourneyGuidanceScreen';
import { EmergencyModal } from './components/EmergencyModal';
import { ValidationModal } from './components/ValidationModal';
import { LanguageSelectionScreen } from './components/LanguageSelectionScreen';
import { JourneyAssistant } from './components/JourneyAssistant';

import { searchRoutesByDestination } from './modules/routes/routeSelector';
import { matchBusToRoute } from './modules/routes/routeMatcher';
import type { JourneyAssistantContext } from './modules/ai/journeyAssistant';
import { journeyEngine } from './modules/journey/journeyEngine';
import { speechSynth } from './modules/voice/speechSynthesis';
import { speechRecognition } from './modules/voice/speechRecognition';
import { audioChimes } from './modules/voice/audioChimes';
import { hapticEngine } from './modules/voice/hapticEngine';
import { accessibilityManager } from './modules/accessibility/accessibility';
import { registerGlobalShortcuts } from './modules/accessibility/keyboardNavigation';
import type { TransitRoute, OCRResult, JourneyState, AccessibilitySettings } from './types/transit';
import { VOICE_LANGUAGES, type VoiceLanguage } from './modules/voice/voiceMessages';
import { getUiMessage } from './modules/voice/uiTranslations';

const LANGUAGE_STORAGE_KEY = 'drishti-selected-language';

function getSavedLanguage(): VoiceLanguage {
  try {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return VOICE_LANGUAGES.includes(savedLanguage as VoiceLanguage)
      ? (savedLanguage as VoiceLanguage)
      : 'en-IN';
  } catch {
    return 'en-IN';
  }
}

async function fetchCloudTtsStatus(): Promise<boolean> {
  const response = await fetch('/api/tts/status');
  if (!response.ok) {
    throw new Error(`Cloud speech status request failed with HTTP ${response.status}.`);
  }

  const result: unknown = await response.json();
  if (
    typeof result !== 'object' ||
    result === null ||
    !('configured' in result) ||
    typeof result.configured !== 'boolean'
  ) {
    throw new Error('Cloud speech status response was invalid.');
  }

  return result.configured;
}

export default function App() { 
  // Navigation View State
  const [currentView, setCurrentView] = useState<'destination' | 'routes' | 'scanner' | 'confirmation' | 'journey'>('destination');

  // Journey & Route State
  const [destinationQuery, setDestinationQuery] = useState('Hazratganj');
  const [matchingRoutes, setMatchingRoutes] = useState<TransitRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [journeyState, setJourneyState] = useState<JourneyState>(journeyEngine.getState());
  const [isScanningBus, setIsScanningBus] = useState(false);
  const [scannedBusNumber, setScannedBusNumber] = useState<string | null>(null);
  const [assistantQuestion, setAssistantQuestion] = useState('');
// Selected app language
const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguage>(getSavedLanguage);
const [showLanguageSelection, setShowLanguageSelection] = useState(true);
const [languagePreferenceError, setLanguagePreferenceError] = useState('');
const [hasSelectedLanguageVoice, setHasSelectedLanguageVoice] = useState<boolean | null>(null);
const [cloudTtsConfigured, setCloudTtsConfigured] = useState<boolean | null>(null);
const [speechError, setSpeechError] = useState('');
useEffect(() => {
  speechSynth.setSpeechErrorHandler(setSpeechError);
  return () => speechSynth.setSpeechErrorHandler(null);
}, []);
useEffect(() => {
  speechSynth.setLanguage(selectedLanguage);
  speechRecognition.setLanguage(selectedLanguage);
  document.documentElement.lang = selectedLanguage;

  const updateVoiceAvailability = () => {
    setHasSelectedLanguageVoice(speechSynth.hasVoiceForLanguage(selectedLanguage));
  };

  updateVoiceAvailability();
  window.speechSynthesis?.addEventListener('voiceschanged', updateVoiceAvailability);
  const voiceLoadTimer = window.setTimeout(updateVoiceAvailability, 1000);

  return () => {
    window.speechSynthesis?.removeEventListener('voiceschanged', updateVoiceAvailability);
    window.clearTimeout(voiceLoadTimer);
  };
}, [selectedLanguage]);

useEffect(() => {
  let isCurrent = true;

  fetchCloudTtsStatus()
    .then((configured) => {
      if (!isCurrent) return;
      speechSynth.setCloudTtsAvailable(configured);
      setCloudTtsConfigured(configured);
    })
    .catch((error: unknown) => {
      console.error('Could not check cloud speech configuration:', error);
      if (!isCurrent) return;
      speechSynth.setCloudTtsAvailable(false);
      setCloudTtsConfigured(false);
    });

  return () => {
    isCurrent = false;
  };
}, []);

const selectLanguage = async (language: VoiceLanguage, enterApp: boolean) => {
  setSpeechError('');
  setSelectedLanguage(language);
  speechSynth.setLanguage(language);
  speechRecognition.setLanguage(language);
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    setLanguagePreferenceError('');
  } catch {
    setLanguagePreferenceError('Language preference could not be saved. It will apply for this visit.');
  }
  if (enterApp) {
    setShowLanguageSelection(false);
  }

  let cloudTtsAvailable = cloudTtsConfigured;
  if (!speechSynth.hasVoiceForLanguage(language) && cloudTtsAvailable === null) {
    try {
      cloudTtsAvailable = await fetchCloudTtsStatus();
      setCloudTtsConfigured(cloudTtsAvailable);
    } catch (error) {
      console.error('Could not check cloud speech configuration:', error);
      cloudTtsAvailable = false;
      setCloudTtsConfigured(false);
    }
    speechSynth.setCloudTtsAvailable(cloudTtsAvailable);
  }

  speechSynth.announceWelcome();
};
  // Modals & Accessibility State
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [a11ySettings, setA11ySettings] = useState<AccessibilitySettings>(accessibilityManager.loadSettings());
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  useEffect(() => {
    speechSynth.setEnabled(a11ySettings.speechEnabled);
  }, [a11ySettings.speechEnabled]);

  // Subscribe to journey engine updates
  useEffect(() => {
    const unsubJourney = journeyEngine.subscribe((state) => {
      setJourneyState(state);
    });

    const unsubAnnouncer = accessibilityManager.subscribeAnnouncer((msg, polite) => {
      setLiveAnnouncement(msg);
      setPoliteness(polite);
    });

    return () => {
      unsubJourney();
      unsubAnnouncer();
    };
  }, []);
  // Keyboard navigation shortcuts
  useEffect(() => {
    const unsubShortcuts = registerGlobalShortcuts({
      onVoiceToggle: () => {
        if (currentView === 'destination') {
          speechRecognition.startListening(
            (res) => {
              handleSearchDestination(res.cleanedDestination);
            },
            (err) => {
              speechSynth.speak(err);
            }
          );
        } else {
          speechSynth.repeat();
        }
      },
      onEmergencyToggle: () => {
        setIsEmergencyOpen((prev) => !prev);
      },
      onNextStop: () => {
        if (currentView === 'journey') {
          journeyEngine.advanceStop();
        }
      },
      onRepeatAudio: () => {
        speechSynth.repeat();
      },
      onContrastToggle: () => {
        handleUpdateA11y({ highContrast: !a11ySettings.highContrast });
      },
      onEscape: () => {
        if (isEmergencyOpen) setIsEmergencyOpen(false);
        if (isValidationOpen) setIsValidationOpen(false);
      },
    });

    return unsubShortcuts;
  }, [currentView, isEmergencyOpen, isValidationOpen, a11ySettings]);

  const handleUpdateA11y = (partial: Partial<AccessibilitySettings>) => {
    const next = { ...a11ySettings, ...partial };
    setA11ySettings(next);
    accessibilityManager.saveSettings(next);
  };

  // Flow Handlers
  const handleSearchDestination = (dest: string) => {
    setDestinationQuery(dest);
    const routes = searchRoutesByDestination(dest);
    setMatchingRoutes(routes);
    setCurrentView('routes');

    if (routes.length > 0) {
      speechSynth.announceRoutesFound(routes.length, dest);
    } else {
      speechSynth.announceNoRoutes(dest);
    }
  };

  const handleSelectRoute = (route: TransitRoute) => {
    setSelectedRoute(route);
    setIsScanningBus(false);
    setScannedBusNumber(null);
    setCurrentView('scanner');
  };

  const handleOpenBusScanner = () => {
    handleSearchDestination('Hazratganj');
  };

  const handleOCRComplete = (result: OCRResult) => {
    setOcrResult(result);
    setIsScanningBus(false);
    setCurrentView('confirmation');
  };

  const handleManualEntryFallback = (busNumber: string) => {
    if (!selectedRoute) return;
    setScannedBusNumber(busNumber.trim().toUpperCase().replace(/^BUS[-\s]?/, ''));
    setOcrResult({
      rawText: busNumber,
      candidateNumber: busNumber.trim().toUpperCase().replace(/^BUS[-\s]?/, ''),
      confidence: 0,
      isReliable: false,
      source: 'manual',
    });
    setIsScanningBus(false);
    setCurrentView('confirmation');
  };

  const handleConfirmMatchAndStart = (confirmedNumber: string) => {
    if (!selectedRoute) return;
    setScannedBusNumber(null);
    journeyEngine.startJourney(selectedRoute, confirmedNumber);
    setCurrentView('journey');
  };

  const handleEndJourney = () => {
    journeyEngine.resetJourney();
    setSelectedRoute(null);
    setOcrResult(null);
    setScannedBusNumber(null);
    setDestinationQuery('');
    setMatchingRoutes([]);
    setCurrentView('destination');
  };

  const journeyAssistantContext: JourneyAssistantContext = (() => {
    if (isEmergencyOpen) return { stage: 'EMERGENCY', destination: destinationQuery, route: selectedRoute };

    if (currentView === 'routes') {
      return {
        stage: 'DESTINATION_SELECTED',
        destination: destinationQuery,
        matchingRouteCount: matchingRoutes.length,
      };
    }
    if (currentView === 'scanner' && selectedRoute) {
      return {
        stage: scannedBusNumber ? 'BUS_VERIFICATION' : isScanningBus ? 'SCANNING_BUS' : 'AT_BUS_STOP',
        destination: selectedRoute.destination,
        route: selectedRoute,
        detectedBusNumber: scannedBusNumber,
      };
    }
    if (currentView === 'confirmation' && selectedRoute) {
      return {
        stage: 'BUS_VERIFICATION',
        destination: selectedRoute.destination,
        route: selectedRoute,
        detectedBusNumber: ocrResult?.candidateNumber,
        verificationStatus: matchBusToRoute(ocrResult?.candidateNumber ?? '', selectedRoute).status,
      };
    }
    if (currentView === 'journey' && journeyState.route) {
      const stage = journeyState.status === 'ARRIVED'
        ? 'DESTINATION_REACHED'
        : journeyState.status === 'APPROACHING'
          ? 'APPROACHING_STOP'
          : 'JOURNEY_STARTED';
      return { stage, destination: journeyState.route.destination, route: journeyState.route, journeyState };
    }
    return { stage: 'IDLE' };
  })();

  // Compute text-size wrapper class
  const textSizeClass =
    a11ySettings.textSize === 'large'
      ? 'text-scale-large'
      : a11ySettings.textSize === 'xlarge'
      ? 'text-scale-xlarge'
      : 'text-scale-normal';

  if (showLanguageSelection) {
    return (
      <LanguageSelectionScreen
        selectedLanguage={selectedLanguage}
        hasVoice={hasSelectedLanguageVoice}
        cloudTtsConfigured={cloudTtsConfigured}
        onSelectLanguage={(language) => selectLanguage(language, true)}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        a11ySettings.highContrast ? 'high-contrast' : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      } ${textSizeClass}`}
    >
      {/* ARIA Live Region for Screen Readers */}
      <div
        aria-live={politeness}
        aria-atomic="true"
        className="sr-only"
        id="a11y-live-announcer"
      >
        {liveAnnouncement}
      </div>

      {/* Top Banner for Offline Transit & Service Worker Map Tile Caching */}
      <OfflineMapBanner currentRoute={selectedRoute} />

      {/* Primary Accessible Navigation Header */}
      <Header
        language={selectedLanguage}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'home') {
            setCurrentView('destination');
          } else if (view === 'scanner' && selectedRoute) {
            setCurrentView('scanner');
          }
        }}
        a11ySettings={a11ySettings}
        onUpdateA11y={handleUpdateA11y}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenValidation={() => setIsValidationOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
      {speechError && (
        <p role="alert" className="mx-auto my-3 max-w-3xl px-4 text-center text-sm text-rose-700 dark:text-rose-300">
          {speechError}
        </p>
      )}
      <div className="flex justify-end p-3">
  <label className="flex flex-wrap items-center gap-2 text-sm">
    <span>🌐 {getUiMessage(selectedLanguage, 'language')}</span>
    <select
      value={selectedLanguage}
      onChange={(event) => void selectLanguage(event.target.value as VoiceLanguage, false)}
      className="rounded-lg border border-violet-300 bg-white px-3 py-2 text-slate-900"
      aria-label={getUiMessage(selectedLanguage, 'language')}
    >
      <option value="en-IN">English</option>
      <option value="hi-IN">हिन्दी</option>
      <option value="bn-IN">বাংলা</option>
      <option value="mr-IN">मराठी</option>
      <option value="ta-IN">தமிழ்</option>
      <option value="te-IN">తెలుగు</option>
      <option value="kn-IN">ಕನ್ನಡ</option>
      <option value="ml-IN">മലയാളം</option>
      <option value="gu-IN">ગુજરાતી</option>
      <option value="pa-IN">ਪੰਜਾਬੀ</option>
    </select>
    {hasSelectedLanguageVoice === false && cloudTtsConfigured === false && (
      <span className="text-xs text-amber-700 dark:text-amber-300" role="status">
        {getUiMessage(selectedLanguage, 'voiceMissing', {
          language: selectedLanguage.split('-')[0],
        })}
      </span>
    )}
    {languagePreferenceError && (
      <span className="text-xs text-rose-700 dark:text-rose-300" role="alert">
        {languagePreferenceError}
      </span>
    )}
  </label>
</div>
        {currentView === 'destination' && (
          <DestinationScreen
            onSearch={handleSearchDestination}
            language={selectedLanguage}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onScanBus={handleOpenBusScanner}
            onStartJourney={handleSelectRoute}
            onAskJourneyAssistant={setAssistantQuestion}
          />
        )}

        {currentView === 'routes' && (
          <RouteSelectionScreen
            language={selectedLanguage}
            destinationQuery={destinationQuery}
            routes={matchingRoutes}
            onSelectRoute={handleSelectRoute}
            onBack={() => setCurrentView('destination')}
          />
        )}

        {currentView === 'scanner' && selectedRoute && (
          <BusScannerScreen
            selectedRoute={selectedRoute}
            onOCRComplete={handleOCRComplete}
            onManualEntry={handleManualEntryFallback}
            onBack={() => setCurrentView('routes')}
            language={selectedLanguage}
            onScanStateChange={setIsScanningBus}
            onBusVerificationChange={setScannedBusNumber}
          />
        )}

        {currentView === 'confirmation' && selectedRoute && ocrResult && (
          <BusConfirmationScreen
            selectedRoute={selectedRoute}
            ocrResult={ocrResult}
            onConfirmMatch={handleConfirmMatchAndStart}
            onRescan={() => {
              setScannedBusNumber(null);
              setCurrentView('scanner');
            }}
            onCancel={() => setCurrentView('routes')}
          />
        )}

        {currentView === 'journey' && journeyState.route && (
          <JourneyGuidanceScreen
            journeyState={journeyState}
            onAdvanceStop={() => journeyEngine.advanceStop()}
            onToggleAutoPlay={(en) => journeyEngine.toggleAutoPlay(en)}
            onPauseResume={() => {
              if (journeyState.status === 'PAUSED') {
                journeyEngine.resumeJourney();
              } else {
                journeyEngine.pauseJourney();
              }
            }}
            onEndJourney={handleEndJourney}
          />
        )}
      </main>

      <div className="w-full max-w-5xl mx-auto px-4 pb-8">
        <JourneyAssistant
          initialQuestion={assistantQuestion}
          onInitialQuestionHandled={() => setAssistantQuestion('')}
          language={selectedLanguage}
          context={journeyAssistantContext}
        />
      </div>

      {/* Tactile Radar Feedback Monitor (Visual Haptic Indicator) */}
      <TactileRadar />

      {/* Emergency Assistance Dialog */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        language={selectedLanguage}
      />

      {/* Automated Verification Test Suite Dialog */}
      <ValidationModal
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
      />

      {/* Accessible Footer with Team Ownership as required by prompt */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Margdarshak AI — Complete Working Prototype for Visually Impaired Commuters
            </p>
            <p className="text-[11px] text-slate-500">
              Keyboard Shortcuts: <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Alt+V</kbd> Voice • <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Alt+S</kbd> SOS • <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Alt+N</kbd> Next Stop • <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Alt+H</kbd> High Contrast
            </p>
          </div>

          <div className="text-[11px] text-slate-500 space-y-0.5">
            <p>
              Team: Ritik Pathak (Frontend) • Yash Srivastava (Core Logic & Journey)
            </p>
            <p>
              Akhand Pratap Singh (Voice & OCR) • Mohamad Rehan (Accessibility & Safety)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
