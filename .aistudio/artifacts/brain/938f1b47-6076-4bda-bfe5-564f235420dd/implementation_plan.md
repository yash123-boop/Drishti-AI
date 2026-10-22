# Drishti AI — Voice-First Travel Companion for Visually Impaired Commuters

Drishti AI is an accessible, voice-guided, camera-assisted public transit travel companion engineered specifically for blind and visually impaired commuters. It provides seamless end-to-end journey guidance through speech recognition, spoken navigation, real-time tactile haptic vibration patterns, offline transit route mapping, bus-number OCR scanning, and emergency assistance.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The application is designed to operate completely offline without external paid APIs, running in-browser speech synthesis, speech recognition, local transit route matching, and client-side Tesseract.js OCR.

- **Audio Navigation & Earcons**: Web Speech API (`SpeechSynthesis` & `SpeechRecognition`) paired with Web Audio API synthetic chimes (ascending frequency for next stop, dual pulse for turns, low tone for warnings) ensures immediate auditory feedback even if system voices are slow.
- **Haptic Feedback Patterns**: Distinct `navigator.vibrate` tactile rhythm signatures (e.g., `[100, 50, 100]` for upcoming stop, `[400, 100, 400, 100, 400]` for wrong bus, `[150, 100, 150]` for turning/boarding cues) with fallback visual soundwave/pulse indicators for non-vibrating devices.
- **Offline Mapping & Public Transit**: Demonstration transit network with multi-stop routes (e.g., Hazratganj Express, Gomti Nagar Line, Airport Shuttle, Charbagh Loop), persistent local caching in browser storage, and an interactive stop progression simulator.
- **Emergency SOS Flow**: High-contrast, confirmation-based emergency flow featuring audible siren tone, GPS coordinate simulator, designated contact dispatch demo, and immediate safety guidance without premature automated calling.

---

## 1. Overview & Core Concept

- **What It Does**: Enables a visually impaired traveler to speak or type a destination, pick from matching accessible transit routes, scan an incoming bus board using their camera or photo upload with OCR, verify the bus number, receive turn-by-turn spoken and haptic stop alerts during the journey, and trigger emergency SOS if needed.
- **Target Audience**: Blind commuters, low-vision passengers needing high contrast and adjustable text sizes, elderly transit users, and anyone needing hands-free, eyes-free audio travel assistance.
- **Key Value**: Eliminates the fear and friction of boarding the wrong bus, missing bus stops, or being stranded without accessible guidance.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│ 1. Welcome &    │  ───> │ 2. Destination Input │  ───> │ 3. Route Selection   │
│ Accessibility   │       │ (Voice / Manual Text)│       │ (Available Routes)   │
└─────────────────┘       └──────────────────────┘       └──────────────────────┘
                                                                    │
┌─────────────────┐       ┌──────────────────────┐                  │
│ 6. Journey      │  <─── │ 5. Route Matching &  │ <────────────────┘
│ Guidance Engine │       │ Bus Confirmation     │   4. Bus Scanner / OCR
└─────────────────┘       └──────────────────────┘      (Camera / Upload)
         │
         ├───> [Next Stop Announcement & Audio/Haptic Alert]
         ├───> [Approaching Destination Alert]
         ├───> [Destination Reached Completion Screen]
         └───> [Emergency SOS Assistance Screen (Always Accessible)]
```

### Visual Identity & Theme
- **WCAG AAA Accessibility Theme**: Default clean high-contrast light theme with an instant toggle for Ultra High Contrast (solid pitch-black `#0A0F1D` background, high-visibility yellow `#FDE047` and cyan `#38BDF8` accents, 7:1+ contrast ratios).
- **Typography**: Clean, robust sans-serif (`Plus Jakarta Sans` / system accessible font) paired with `font-mono tabular-nums` for bus numbers, countdowns, and stop indices. Text scaling controls allow instant scaling from 100% to 150%.
- **Large Touch Targets**: All primary buttons and interactive touchpoints feature hitboxes of at least $56\text{px} \times 56\text{px}$ with visible keyboard focus rings (`focus-visible:ring-4 focus-visible:ring-blue-500`).
- **Screen Reader First**: Full ARIA live regions (`aria-live="polite"` and `aria-live="assertive"`), descriptive labels, logical tabindex flow, and keyboard hotkeys (Space to toggle voice, Escape to cancel, N for next stop).

---

## 3. Key Product Decisions & Trade-Offs

- **Client-Side ES Module Architecture**: Implemented cleanly with modular components (`ui/`, `voice/`, `ocr/`, `routes/`, `journey/`, `emergency/`, `accessibility/`, `testing/`) connecting into a unified state engine.
- **Tesseract.js with Manual Fallback**: Bus OCR runs client-side using Tesseract.js. If image resolution is poor, OCR fails, or camera access is denied, a manual keypad/voice bus number entry is immediately available so the user is never stuck.
- **Dual Tactile & Auditory Signal Engine**: Every transit state transition triggers both an audio speech alert + Web Audio frequency chime AND a distinct `navigator.vibrate` pattern so deaf-blind or noisy-commute travelers remain oriented.
- **Zero Hallucinated Live API Claims**: Explicitly labels demonstration routes and transit timetables as curated offline data for safe, predictable testing during hackathon presentations.

---

## 4. Technical Architecture & System Diagram

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

### Core Modules & Responsibilities
1. **`ui/` (Screens & Notifications)**:
   - `screens.js`: Manages 13 functional view states (Welcome, Destination, Routes, Scanner, OCR Review, Wrong Bus Alert, Journey Guide, Next Stop, Destination Alert, Arrival, SOS, Error states).
   - `components.js`: Accessible large-target buttons, audio chimes visualizer, bus cards, stop progress timeline.
   - `notifications.js`: Accessible ARIA live toasts and visual banners.
2. **`voice/` (Speech & Audio Feedback)**:
   - `speechRecognition.js`: Speech-to-text with auto-punctuation, Hindi/English accent tolerance, and microphone status.
   - `speechSynthesis.js`: Spoken cues for stops, turns, confirmations, and warnings with repeat and mute toggles.
   - `hapticEngine.js`: Standardized vibration patterns for turns, stops, destination alerts, and errors.
   - `audioChimes.js`: Web Audio oscillator chimes for crisp feedback in loud environments.
3. **`ocr/` (Bus Scanner)**:
   - `busOCR.js`: Web camera preview + image file upload + Tesseract OCR worker with confidence meter.
   - `textParser.js`: Bus route number extraction regex, noise removal, and candidate sanitization.
4. **`routes/` & `journey/` (Transit Engine)**:
   - `routeData.js`: Preloaded route network (Hazratganj 101, Gomti Nagar 204, Airport Express 502, Charbagh 305).
   - `routeMatcher.js`: Bus number comparison (matching vs wrong bus alert).
   - `journeyEngine.js`: Stop-by-stop state machine with manual "Simulate Next Stop" + automated timed progression.
   - `destinationAlert.js`: 1-stop-ahead warning chime and destination reached completion modal.
5. **`emergency/` & `accessibility/`**:
   - `emergencyAssist.js`: Two-step SOS confirmation, siren alarm, emergency contacts mock dispatch, and location sharing.
   - `accessibility.js`: Font size scaling, high contrast toggles, screen reader live announcements.
   - `keyboardNavigation.js`: Global keyboard shortcuts (`Alt+V` voice, `Alt+S` SOS, `Alt+N` next stop, `Escape`).
   - `testing/validation.js`: Automated in-app test suite exercising all 5 buildathon scenarios.
