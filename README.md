# Drishti AI — Voice-First Accessible Transit Companion

> **A voice-first, camera-assisted public transportation companion engineered for blind and visually impaired commuters.**

Drishti AI solves the critical everyday challenges faced by visually impaired passengers navigating public transit: identifying upcoming buses, verifying whether an arriving vehicle matches their intended route, tracking stop progression in real-time with spoken landmarks, receiving distinct tactile haptic vibration cues before critical stops, and accessing a confirmation-based emergency SOS safety flow.

---

## 🌟 Key Features

1. **Audio Navigation & Spoken Guidance**:
   - Turn-by-turn spoken guidance via the browser `SpeechSynthesis` API.
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
   - Manual keypad / voice correction fallback if OCR fails.

4. **Public Transit & Offline Mapping**:
   - Demonstration multi-stop transit routes stored in local offline cache (`data/routes.json` / `localStorage`).
   - Stop progression simulator with manual advance ("Simulate Next Stop") and automated timed progression (6s auto-advance).

5. **Emergency SOS Safety Assistance**:
   - Accessible 2-step confirmation to prevent accidental triggers.
   - Piercing siren alarm generated via audio oscillators.
   - Simulated emergency contact dispatch and GPS transit coordinate broadcaster.
   - Explicit disclaimer that no actual 911/112 calls are made.

6. **WCAG 2.2 AAA Accessibility**:
   - Ultra High Contrast mode (pitch black with vivid yellow/cyan accents).
   - Text scaling (Normal 100%, Large 118%, Extra-Large 135%).
   - Dynamic `aria-live` region for screen readers.
   - Global keyboard shortcuts (`Alt+V`, `Alt+S`, `Alt+N`, `Alt+H`, `Alt+R`, `Space`).

7. **Automated Verification Suite**:
   - In-app test runner executing all 5 buildathon scenarios with a single click.

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
   - Observe failure message and click `"Having trouble scanning? Enter bus number manually"`.

4. **Emergency SOS**:
   - Click `"SOS"` (or press `Alt+S`).
   - Click `"Confirm & Sound SOS"` to hear the audible siren and view simulated contact dispatch. Click `"Cancel"` or `"End Emergency"` to dismiss safely.
