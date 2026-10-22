# Drishti AI Buildathon Demonstration Script

This script walks judges and evaluators through all 5 required demonstration scenarios in under 3 minutes.

---

## Scenario 1: Successful End-to-End Journey (Hazratganj)

1. **Step 1: Open Application**
   - The app automatically announces the welcome message: *"Welcome to Drishti AI, your accessible travel companion..."*

2. **Step 2: Enter Destination**
   - Click the large blue microphone button and speak: `"Take me to Hazratganj"`, or click the `"Hazratganj"` demonstration chip.
   - The app announces: *"Destination understood: Hazratganj. Searching accessible transit routes."*

3. **Step 3: Route Selection**
   - The system displays matching routes:
     - `Bus 101: Hazratganj Heritage Express` (4 stops, 10 min frequency)
     - `Bus 305: University Central Circular`
   - Click `"Select Route"` on Bus 101.
   - The app speaks: *"Route selected. Please point your camera at the front bus display board or upload an image to confirm Bus 101."*

4. **Step 4: Scan Bus Board**
   - Under Instant Demo Presets, click `"✓ Bus 101 Board"`.
   - The OCR progress bar runs from 10% to 100%.
   - The Candidate Number `"101"` appears with 92% confidence.

5. **Step 5: Confirmation & Matching**
   - The match banner turns emerald: *"Correct Bus Verified! (Bus 101)"*.
   - Click `"Start Journey"`.
   - The app speaks: *"Journey started from Charbagh Railway Station towards Hazratganj."*

6. **Step 6: Stop Progression & Audio/Haptic Alerts**
   - Current Stop: `Charbagh Railway Station`. Next Stop: `Hussainganj Crossing`.
   - Click `"Simulate Next Stop"`.
   - Audio chime plays + tactile pulse triggers. Spoken announcement: *"Current stop: Hussainganj Crossing..."*
   - Click `"Simulate Next Stop"` again to reach `Vidhan Sabha Marg` (penultimate stop).
   - **Approaching Alert Triggers**: Amber alert banner appears + triple vibration pulse + warning chime: *"Attention: Your final destination, Hazratganj, is approaching at the very next stop."*
   - Click `"Simulate Next Stop"` once more.
   - **Destination Reached**: Celebratory emerald screen + arrival chime + continuous vibration: *"You have arrived at your destination: Hazratganj."*

---

## Scenario 2: Wrong-Bus Rejection

1. From the route selection screen, select `Bus 101` to `Hazratganj`.
2. On the scanner screen, click the preset `"⚠ Bus 204 Board"` (Gomti Nagar bus).
3. The confirmation screen detects Bus `204`.
4. The system flags:
   - Status: `WRONG_BUS`
   - Spoken Warning: *"Warning: Scanned bus is #204 heading to Gomti Nagar Extension. Your selected route requires Bus #101 to Hazratganj. Do NOT board!"*
   - Low dissonance error chime sounds + error vibration pulse.
   - The `"Start Journey"` button is blocked, preventing the visually impaired passenger from boarding the incorrect vehicle.

---

## Scenario 3: OCR Failure & Manual Fallback

1. On the scanner screen, click the preset `"✕ Blurry Board"`.
2. OCR runs and reports low confidence with unreadable text.
3. Click `"Having trouble scanning? Enter bus number manually"`.
4. Enter `101` via keyboard or voice.
5. The number is verified and the passenger can proceed safely.

---

## Scenario 4: Accessibility Controls & Screen Reader

1. **Text Size**: Click the `Type` button in the header to cycle from Normal -> Large -> Extra-Large. Observe typography expanding cleanly.
2. **High Contrast**: Click the `SunMoon` toggle (or press `Alt+H`). The interface switches to WCAG AAA compliant pitch-black background with high-visibility yellow and cyan accents.
3. **Keyboard Hotkeys**:
   - `Alt+V`: Activates voice input.
   - `Alt+S`: Opens emergency assistance.
   - `Alt+N`: Advances simulation to next stop.
   - `Alt+R`: Repeats the last spoken announcement.
   - `Escape`: Closes open dialogs.

---

## Scenario 5: Emergency Assistance (SOS)

1. Click the red `"SOS"` button in the header (or press `Alt+S`).
2. An accessible confirmation dialog opens explaining that an audible siren will sound and GPS coordinates will be sent.
3. Click `"Confirm & Sound SOS"`.
4. The audible emergency siren sounds to alert nearby bystanders.
5. Simulated dispatch notices are sent to registered caregiver contacts with current transit coordinates.
6. Click `"End Emergency & Return"` to dismiss the alarm safely.
