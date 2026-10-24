# Drishti AI — Voice-First Accessible Transit Companion

> **A voice-first, camera-assisted public transportation companion engineered for blind and visually impaired commuters.**

Drishti AI solves the critical everyday challenges faced by visually impaired passengers navigating public transit: identifying upcoming buses, verifying whether an arriving vehicle matches their intended route, tracking stop progression in real-time with spoken landmarks, receiving distinct tactile haptic vibration cues before critical stops, and accessing a confirmation-based emergency SOS safety flow.

---

## 🌟 Key Features

1. **Audio Navigation & Spoken Guidance**:
   - Turn-by-turn spoken guidance via the browser `SpeechSynthesis` API.
   - Localized voice guidance and destination speech recognition in English, Hindi, Bengali, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati, and Punjabi.
   - Uses an installed browser voice when available, with Google Cloud Text-to-Speech as the server-side fallback; microphone recognition requires browser support.
   - A language-selection screen appears when the site opens. Selecting a language speaks the welcome message, opens the app in that language, and saves the preference on the device.
   - Low-latency synthesized earcons (Web Audio API) for stop arrival, destination alerts, and wrong-bus warnings.
   - Hands-free voice destination input via the `SpeechRecognition` API.

2. **Real-Time Haptic Tactile Feedback**:
   - Distinct vibration patterns using `navigator.vibrate`:
     - Approaching stop: `[100, 50, 100]`
     - Destination approaching (1 stop remaining): `[300, 100, 300, 100, 300]`
     - Destination reached: `[500, 150, 500, 150, 500, 150, 800]`
     - Wrong bus alert: `[400, 100, 400, 100, 400]`
     - Emergency SOS: `[800, 200, 800, 200, 800]`
   - Visual Tactile Radar monitor for devices without physical vibration motors.

3. **Bus-Number Camera & OCR Scanner**:
   - Client-side OCR via `Tesseract.js` recognizing LED route display boards.
   - Live camera stream capture + image upload.
   - Instant built-in test board presets (Bus 101, Bus 204, Blurry Board) for rapid buildathon demonstration.
   - OCR reports the detected bus number, destination when recognized, and extracted board text. Failed scans show a retry action; manual bus-number entry is also available.
   - The scanner shows OCR confidence as High/Medium/Low and only offers automatic database verification for high-confidence readings. Uncertain readings request a manual check; a database match alone does not prove the bus is physically present.
   - Camera guidance labels (bus, stop, person, road, entrance, exit, signboard and obstacle) are selectable simulation examples—not computer-vision detections. Test-board confidence is simulated; actual camera/upload confidence comes from OCR.
   - A demo bus lookup accepts `BUS-101`, `BUS-102`, `BUS-204`, `BUS-305`, or `BUS-502` (digits alone are accepted too). The displayed bus location, route, and ETA are simulated sample data, not live GPS.

4. **Public Transit & Offline Mapping**:
   - Demonstration multi-stop transit routes stored in local offline cache (`data/routes.json` / `localStorage`); actual map tiles are cached only when downloaded successfully.
   - Stop progression simulator with manual advance ("Simulate Next Stop") and automated timed progression (6s auto-advance).
   - Interactive OpenStreetMap with zoom and pan, a permission-based live-location map on the destination dashboard, and current-location road-route alternatives in route search.
   - Route alternatives include fastest and fewest-turn choices. Location tracking starts only when the traveler chooses to show their location.
   - Searchable Lucknow city place finder, popular landmark shortcuts, and search filters for heritage, food/markets, transport, parks, healthcare, education, and worship. Selecting a result plots its mapped coordinates and offers a route from the current location.
   - Place search needs internet access and uses OpenStreetMap Nominatim in a bounded Lucknow-area view. Search results are limited by the service and mapped community data; they are not a guarantee of literally every address or point of interest.
   - Each selected place can show four deterministic, generated demo bus numbers, sample hub connections, and illustrative map lines.
   - Generated bus numbers, route lines, estimated distances, and frequencies are fictional demo content, not actual Lucknow bus services, stops, schedules, or navigation. The app does not include an official complete bus GTFS/live fleet feed.
   - The dashboard includes a place catalogue with curated popular Lucknow landmarks, categories, visit/accessibility notes, and indicative INR expense ranges. OpenStreetMap search is still available separately.
   - Route lookup requires an internet connection and shares the chosen origin/destination with OpenStreetMap's Nominatim and OSRM public services. The fewest-turn option is not a verified safety rating; routes are road estimates, not accessible walking or public-transit directions.

5. **Trip Planner & Journey Assistant**:
   - Compare route-backed trips by estimated INR budget, one-way travel time, cheapest/fastest/balanced preference, and the demo bus type's accessibility description. Set a preset/custom budget and optional travel date; use current location to select a nearby geocoded demo stop (within 1 km), then receive an estimated one-way/return fare and a sample day itinerary.
   - Budget breakdowns include round-trip bus fare, food, entry, local transport, and miscellaneous estimates. Values and itinerary timings are illustrative, not verified venue prices, live schedules, or guaranteed accessible service.
   - Ask typed or spoken questions about available routes, supported stops, demo buses, fares, frequency, travel time, and place expenses; listen to answers with speech synthesis. The assistant remains available across app screens and changes its guidance for destination selection, boarding, scanning, verification, journey progress, arrival, and emergency states.
   - Assistant journey status is derived from the app's selected route and journey simulator, not a live bus/GPS feed. Answers use local app data and state when a route is missing—there is no generative AI or live fare lookup. Text answers remain available if speech output is unavailable; users can type if speech recognition is unsupported.

6. **Emergency SOS Safety Assistance**:
   - Select a service (Police, Ambulance, Fire, Medical, or General Help), review a confirmation step, and explicitly confirm a demo SOS.
   - Emergency phone numbers are configured centrally in `src/modules/emergency/emergencyServices.ts`; a separate user-initiated `tel:` link is available after confirmation.
   - Confirmation records a demo state in the UI only. It does not send an alert, share location, or place a call automatically. A local audible alarm can be started or stopped explicitly.
   - English and Hindi messages are provided for the SOS and bus-lookup flows.

7. **WCAG 2.2 AAA Accessibility**:
   - Ultra High Contrast mode (pitch black with vivid yellow/cyan accents).
   - Text scaling (Normal 100%, Large 118%, Extra-Large 135%).
   - Dynamic `aria-live` region for screen readers.
   - Global keyboard shortcuts (`Alt+V`, `Alt+S`, `Alt+N`, `Alt+H`, `Alt+R`, `Space`).

8. **Automated Verification Suite**:
   - In-app test runner executing all 9 transit and safety verification scenarios with a single click, including confidence-gated bus detection, route-backed trip-cost checks, and journey-state-aware assistant responses.

---

## 👥 Team Responsibilities

- **Ritik Pathak**: Frontend and UI development (all 13 accessible screens, touch-friendly layouts, responsive design).
- **Yash Srivastava**: Core application logic, route management, journey engine, and module integration.
- **Akhand Pratap Singh**: Voice recognition, speech synthesis, bus-number OCR, audio chimes, and text parsing.
- **Mohamad Rehan**: Accessibility, keyboard navigation, screen-reader live announcements, emergency SOS safety, and validation suite.

---

## 🚀 Running the Project

### Development Server
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Multilingual Cloud Speech
To enable spoken output when the device has no matching installed voice:

1. Enable the Google Cloud Text-to-Speech API for a Google Cloud project and create an API key restricted to that API.
2. Copy `.env.example` to `.env` and set `GOOGLE_CLOUD_TTS_API_KEY` locally. Never expose this key in frontend code or commit it.
3. Run `npm run dev`; the server reports cloud speech availability at `/api/tts/status`.
4. For production, build with `npm run build`, configure `GOOGLE_CLOUD_TTS_API_KEY` as a server secret, and run `npm start`.

Cloud speech requires internet access and a Google Cloud project with billing/API access configured. Without the key, the app continues using installed browser voices.

### Production Build
```bash
npm run build
npm run preview
```

### Browser Permissions
- **Microphone**: For voice destination input (`SpeechRecognition`).
- **Camera**: For live bus board scanning (`navigator.mediaDevices.getUserMedia`).
- **Audio**: For synthetic earcons and siren alarm (`AudioContext`).
- **Vibration**: For tactile cues (`navigator.vibrate`).
- **Location**: Optional, requested when the traveler selects "Use my location & show routes". Map tiles and route search require an internet connection.

---

## 🧪 Demo Scenarios Guide

1. **Successful Journey**:
   - Destination: Speak or select `"Hazratganj"`.
   - Select: `"Bus 101 - Hazratganj Heritage Express"`.
   - Scan: Click `"✓ Bus 101 Board"` preset.
   - Confirm: Bus 101 matches Route 101 -> Click `"Start Journey"`.
   - Progress: Click `"Simulate Next Stop"` until `"Hazratganj"` is reached.

2. **Wrong Bus Detection**:
   - Select Route 101 to Hazratganj.
   - Click `"⚠ Bus 204 Board"` preset (Gomti Nagar bus).
   - Observe WRONG_BUS warning: journey is prevented from starting.

3. **OCR Failure & Manual Fallback**:
   - Click `"✕ Blurry Board"` preset.
   - Observe failure message and click `"Having trouble scanning? Enter bus number manually"` to enter the number shown on the board.

4. **Emergency SOS**:
   - Click `"SOS"` (or press `Alt+S`).
   - Select a service, review the confirmation, then click `"Confirm SOS"`. This records a demo request only. The `Call` link is a separate, user-initiated phone action; use `"Sound local alarm"` only when you want the device to make an audible alert.

5. **Demo bus lookup**:
   - Navigate to Bus Board OCR, enter one of `BUS-101`, `BUS-102`, `BUS-204`, `BUS-305`, or `BUS-502`, and select `"Find demo bus"`.
   - Check the sample route/location card and map. An unknown or invalid number displays an accessible retry message. All shown positions and ETAs are simulated.
