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
import CameraAssistant from './camera/camera/CameraAssistant';
import { JourneyGuidanceScreen } from './components/JourneyGuidanceScreen';
import { EmergencyModal } from './components/EmergencyModal';
import { ValidationModal } from './components/ValidationModal';

import { searchRoutesByDestination } from './modules/routes/routeSelector';
import { journeyEngine } from './modules/journey/journeyEngine';
import { speechSynth } from './modules/voice/speechSynthesis';
import { speechRecognition } from './modules/voice/speechRecognition';
import { audioChimes } from './modules/voice/audioChimes';
import { hapticEngine } from './modules/voice/hapticEngine';
import { accessibilityManager, DEFAULT_ACCESSIBILITY_SETTINGS } from './modules/accessibility/accessibility';
import { registerGlobalShortcuts } from './modules/accessibility/keyboardNavigation';
import type { TransitRoute, OCRResult, JourneyState, AccessibilitySettings } from './types/transit';

export default function App() { 
  // Navigation View State
  const [currentView, setCurrentView] = useState<'destination' | 'routes' | 'scanner' | 'confirmation' | 'journey'>('destination');

  // Journey & Route State
  const [destinationQuery, setDestinationQuery] = useState('Hazratganj');
  const [matchingRoutes, setMatchingRoutes] = useState<TransitRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [journeyState, setJourneyState] = useState<JourneyState>(journeyEngine.getState());
// Selected app language
const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
useEffect(() => {
  speechSynth.setLanguage(selectedLanguage);
}, [selectedLanguage]);
  // Modals & Accessibility State
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [a11ySettings, setA11ySettings] = useState<AccessibilitySettings>(accessibilityManager.loadSettings());
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

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

  // Announce welcome on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      speechSynth.announceWelcome();
    }, 800);
    return () => clearTimeout(timer);
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
      speechSynth.speak(`No demonstration routes found for ${dest}. Try searching for Hazratganj.`);
    }
  };

  const handleSelectRoute = (route: TransitRoute) => {
    setSelectedRoute(route);
    setCurrentView('scanner');
  };

  const handleOCRComplete = (result: OCRResult) => {
    setOcrResult(result);
    setCurrentView('confirmation');
  };

  const handleManualEntryFallback = () => {
    if (!selectedRoute) return;
    setOcrResult({
      rawText: '',
      candidateNumber: selectedRoute.busNumber,
      confidence: 100,
      isReliable: true,
      source: 'manual',
    });
    setCurrentView('confirmation');
  };

  const handleConfirmMatchAndStart = (confirmedNumber: string) => {
    if (!selectedRoute) return;
    journeyEngine.startJourney(selectedRoute, confirmedNumber);
    setCurrentView('journey');
  };

  const handleEndJourney = () => {
    journeyEngine.resetJourney();
    setSelectedRoute(null);
    setOcrResult(null);
    setCurrentView('destination');
  };

  // Compute text-size wrapper class
  const textSizeClass =
    a11ySettings.textSize === 'large'
      ? 'text-scale-large'
      : a11ySettings.textSize === 'xlarge'
      ? 'text-scale-xlarge'
      : 'text-scale-normal';

  return 
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
      <div className="flex justify-end p-3">
  <label className="flex items-center gap-2 text-sm">
    <span>🌐 Language</span>
    <select
      value={selectedLanguage}
      onChange={(event) => setSelectedLanguage(event.target.value)}
      className="rounded-lg border border-violet-300 bg-white px-3 py-2 text-slate-900"
      aria-label="Choose language"
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
  </label>
</div>
        {currentView === 'destination' && (
          <DestinationScreen
  onSearch={handleSearchDestination}
  language={selectedLanguage}
/>
        )}

        {currentView === 'routes' && (
          <RouteSelectionScreen
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
          />
        )}

        {currentView === 'confirmation' && selectedRoute && ocrResult && (
          <BusConfirmationScreen
            selectedRoute={selectedRoute}
            ocrResult={ocrResult}
            onConfirmMatch={handleConfirmMatchAndStart}
            onRescan={() => setCurrentView('scanner')}
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

      {/* Tactile Radar Feedback Monitor (Visual Haptic Indicator) */}
      <TactileRadar />

      {/* Emergency Assistance Dialog */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
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
              Drishti AI — Complete Working Prototype for Visually Impaired Commuters
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
