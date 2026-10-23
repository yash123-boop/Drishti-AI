# Drishti AI System Architecture

## Architecture Overview

Drishti AI follows a modular, event-driven architecture designed to operate 100% offline in client browsers. It coordinates speech, computer vision, tactile haptics, and transit routing through a central State Coordinator.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Drishti AI Application                          │
├────────────────────────────────────────────────────────────────────────┤
│                           State Coordinator                            │
│           (Current Route, Confirmed Bus, Stop Index, Status)           │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│  Voice & Audio   │    Bus OCR &     │ Route & Journey  │ Accessibility │
│      Engine      │   Image Parser   │      Engine      │    & Safety   │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ • SpeechRecog    │ • Camera Stream  │ • Route Selector │ • Font Scaler │
│ • SpeechSynth    │ • File Upload    │ • Route Matcher  │ • HighContrast│
│ • WebAudio Chime │ • Tesseract.js   │ • Stop Manager   │ • ARIA Live   │
│ • Haptic Driver  │ • Candidate Clean│ • Timed Simulator│ • SOS Flow    │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │      Demonstration Data     │
                    │   (data/routes.json cache)  │
                    └─────────────────────────────┘
```

## Module Boundaries

1. **`voice/`**:
   - `speechRecognition.ts`: Wraps `webkitSpeechRecognition` / `SpeechRecognition`, uses the selected locale, and sanitizes destination input by stripping conversational filler words.
   - `speechSynthesis.ts`: Manages `SpeechSynthesisUtterance` queues, natural voice selection, and localized speech output.
   - `voiceMessages.ts`: Provides the localized voice prompts and error messages for the ten supported Indian language locales.
   - `supportedLanguages.js`: Shares the supported locale allowlist between the browser and server.
   - `server.js`: Serves the Vite app in development or built assets in production and proxies validated cloud TTS requests without exposing the API key to the browser.
   - `audioChimes.ts`: Web Audio API synthesizer generating earcons (ascending next-stop chimes, alert pings, celebratory arrival chords).
   - `hapticEngine.ts`: Triggers hardware `navigator.vibrate` and broadcasts vibration pulse payloads to UI listeners.

2. **`ocr/`**:
   - `busOCR.ts`: Streams camera video or loads image files, invokes `Tesseract.js` worker, and provides programmatic test board rendering.
   - `textParser.ts`: Regex-based extraction of bus line numbers and confidence scoring.

3. **`routes/` & `journey/`**:
   - `routeData.ts`: Bundles and caches transit corridors.
   - `routeSelector.ts`: Destination search with fuzzy case normalization.
   - `routeMatcher.ts`: Compares scanned bus against selected route.
   - `journeyEngine.ts`: State machine transitioning through START, TRANSIT, APPROACHING, and ARRIVED.
   - `stopManager.ts`: Evaluates current stop, next stop, and remaining distances.

4. **`emergency/` & `accessibility/`**:
   - `emergencyAssist.ts`: 2-step confirmation, siren frequency modulation, and mock SMS/call dispatch.
   - `accessibility.ts`: Manages persistent user preferences (contrast, text size) and screen reader announcements.
   - `keyboardNavigation.ts`: Global keyboard event listener.
   - `validation.ts`: Test suite verifying core user journeys.
