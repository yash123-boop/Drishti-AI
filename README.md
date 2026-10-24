# 🚌 Drishti AI — Accessible Transit Assistant

**Making public transportation more accessible for visually impaired and low-vision commuters.**

Drishti AI is a voice-first accessible transit assistant designed to help visually impaired (VI) and low-vision commuters explore destinations, identify buses, plan trips within their budget, navigate routes using interactive maps, and access emergency assistance.

The application combines voice interaction, bus-board text recognition (OCR), route visualization, journey guidance, and accessibility-focused controls in a unified web interface.

> **Project Status:** Working prototype / demonstration application. Some transit information, route details, fares, and detection results use demonstration data and should not be treated as verified live transit information.

---

## 📸 Application Screenshots

### 1. Travel Dashboard
The main interface provides voice interaction, destination search, quick actions, and destination discovery.

![Drishti AI Travel Dashboard](screenshots/travel-dashboard.png)

### 2. Explore Destinations
Browse popular places, cultural landmarks, shopping areas, parks, transport hubs, and other destinations across Lucknow.

![Destination Explorer](screenshots/destination-explorer.png)

### 3. Trip Planner & Budget
Choose your starting point, destination, budget, travel preferences, and optional travel date to explore suitable demonstration routes.

![Trip Planner](screenshots/trip-planner.png)

### 4. AI Journey Assistant
Interact with the journey assistant to ask questions about buses, destinations, fares, and available demonstration routes.

![AI Journey Assistant](screenshots/journey-assistant.png)

### 5. Live Mapping & Route Visualization
View your location and destination on an interactive map, compare route options, and explore journey information.

![Live Route Map](screenshots/live-route-map.png)

### 6. Emergency Assistance
Access an emergency assistance interface with options for police, ambulance, fire services, and general emergency help.

![Emergency Assistance](screenshots/emergency-assistance.png)

### 7. AI Bus Detection & OCR
Use the camera or upload a photograph of a bus display to extract text and identify a potential bus number and destination.

![AI Bus Detection](screenshots/bus-detection.png)

### 8. Bus Verification
Compare extracted bus information against the application's demonstration bus database before proceeding to route verification.

![Bus Verification](screenshots/bus-verification.png)

### 9. Voice-Guided Journey
Follow a stop-by-stop journey interface with current-stop information, next-stop guidance, journey progress, and voice announcements.

![Voice-Guided Journey](screenshots/voice-guided-journey.png)

---

## ✨ Key Features

### 🗣️ 1. Voice-First Assistance
- Voice interaction for hands-free use.
- Speech-based destination input where browser support permits.
- Spoken journey instructions and stop announcements.
- Read-aloud functionality for assistant responses.
- Keyboard shortcuts for accessibility.
- Language selection for the application's supported interface and speech features.

### 🚌 2. Bus Board Detection Using OCR
- Capture bus-board images using a camera.
- Upload existing bus-board photographs.
- Extract text using Optical Character Recognition (OCR).
- Identify potential bus numbers and destination names.
- Display OCR confidence information.
- Compare extracted information against the demonstration bus database.

**Important:** OCR extracts text from images; it does not independently prove that a bus is the correct bus. Verification depends on the application's available route records. The current prototype does not use a trained computer-vision model for bus detection.

### 🗺️ 3. Interactive Mapping & Route Visualization
- Display maps using map-based visualization.
- Request the user's current location with browser permission.
- Show the starting point and destination.
- Display route alternatives and estimated travel distances and durations.
- Compare route options based on travel time and number of turns.

**Important:** Route estimates may represent road routes rather than walking or public-transit directions. The application does not independently verify real-time traffic, pedestrian accessibility, road conditions, or safety.

### 💰 4. Trip Planner & Budget Estimation
- Select a starting location and destination.
- Choose a predefined budget or enter a custom amount.
- Set travel preferences.
- Optionally select a travel date.
- Explore available demonstration routes within the selected budget.
- View estimated fares and journey durations.

The planner is designed to help commuters make more informed travel decisions while considering their budget.

### 🤖 5. AI Journey Assistant
The journey assistant provides information using the application's available demonstration data.

Users can ask questions about:
- Available buses and routes.
- Destination information.
- Estimated fares.
- Suggested journeys.
- Budget-based travel options.

The assistant should distinguish available route information from unavailable or unverified information.

### 🚨 6. Emergency Assistance System
The emergency assistance interface provides options for:
- Police assistance.
- Ambulance services.
- Fire and rescue services.
- General emergency assistance.

The interface displays relevant emergency contact numbers and provides a way to initiate a phone call.

**Safety notice:** The current demonstration interface does not automatically notify emergency services or dispatch assistance. Users must initiate the appropriate call. Emergency numbers and service availability should be verified for the relevant location.

### ♿ 7. Accessibility-Focused Interface
- Voice-first interaction.
- Read-aloud controls.
- Keyboard navigation and shortcuts.
- High-contrast accessibility options.
- Larger, clearly labeled interactive controls.
- Simplified journey information.
- Stop-by-stop journey progress.

The goal is to reduce reliance on visual interaction and make transit information easier to access.

### 🧭 8. Journey Tracking & Stop Guidance
- Display the current journey and destination.
- Present the current and next stops.
- Show route progress.
- Provide spoken stop announcements.
- Allow users to simulate progression through stops.
- Support manual or timed advancement where implemented.

The current demonstration journey can use predefined stop sequences. This should not be confused with verified GPS-based arrival detection.

---

## 🛠️ Technology Stack

The application uses browser-based technologies and mapping and OCR capabilities.

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Layout, styling, and responsive interface |
| JavaScript | Application logic and interactions |
| Web Speech API | Browser-supported speech recognition and speech synthesis |
| Tesseract.js / OCR engine | Extracting text from bus-board images |
| Leaflet.js | Interactive map rendering |
| OpenStreetMap | Map data and visualization |
| Browser Geolocation API | Accessing the user's location with permission |
| Browser Media APIs | Camera access where supported |

**Note:** Confirm the actual dependencies in `package.json` before treating this list as the final, verified technology inventory.

---

## ⚙️ Getting Started

Follow these instructions to run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) and npm, if the project uses a Node.js-based development environment.
- [Visual Studio Code](https://code.visualstudio.com/) or another code editor.
- A modern web browser.
- Camera and location permissions for the corresponding features.

### Installation

**1. Clone the repository**

Replace the example URL with your actual GitHub repository URL.

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

**2. Open the project directory**

```bash
cd <YOUR_PROJECT_FOLDER>
```

**3. Install dependencies**

If the project contains a `package.json` file:

```bash
npm install
```

**4. Start the development server**

For a project configured with a Vite development script:

```bash
npm run dev
```

Open the local URL printed in the terminal.

> If the project is a plain HTML, CSS, and JavaScript application without a Node.js development script, use the serving method configured for that project instead.

### Browser Permissions

Some features require explicit browser permissions:

- **Camera:** For capturing bus-board images.
- **Location:** For accessing the user's current coordinates.
- **Microphone:** For speech recognition.
- **Audio:** For spoken instructions and read-aloud functionality.

Use a secure context, such as `localhost` during development or HTTPS when deployed, where required by browser APIs.

---

## 🧪 How to Test the Application

### Test 1: Destination Search
1. Open the Travel & Journey interface.
2. Enter a destination.
3. Submit the search.
4. Review the available demonstration routes.

### Test 2: Trip Planning
1. Open the trip planner.
2. Select a starting point and destination.
3. Choose a budget.
4. Select a travel preference.
5. Generate the available trip options.
6. Review the estimated fare and duration.

### Test 3: Mapping
1. Open a route visualization.
2. Choose the option to use your location.
3. Allow browser location access.
4. Review the map and displayed route alternatives.

### Test 4: Bus Board OCR
1. Open **Bus Board OCR**.
2. Start the camera or upload a bus-board photograph.
3. Capture or submit the image.
4. Review the extracted text and OCR confidence.
5. Check the verification result against the demonstration bus database.

### Test 5: Voice Assistance
1. Enable the required browser permissions.
2. Select a supported language.
3. Try the voice input or read-aloud controls.
4. Check whether speech output and recognition use the intended language.

### Test 6: Emergency Assistance
1. Open the SOS interface.
2. Select an emergency service.
3. Verify the displayed contact information.
4. Check the phone-call action without placing an unintended emergency call.

### Test 7: Journey Guidance
1. Select a demonstration route.
2. Start the journey interface.
3. Review the current stop and next stop.
4. Test manual or timed stop advancement.
5. Confirm that spoken announcements match the displayed stop information.

---

## 🔐 Privacy & Safety

Drishti AI is intended to support accessible travel, but it must not create a false sense of security.

- Location access should occur only after user permission.
- Camera and microphone access should be requested only when needed.
- Location, camera images, and other sensitive information should not be collected or transmitted unnecessarily.
- OCR confidence should not be interpreted as proof of bus identity.
- Demonstration routes and fares should not be presented as verified live information.
- Route visualization should not be described as a guarantee of pedestrian safety or accessibility.
- Emergency functionality should clearly communicate whether a call has actually been initiated.

---

## 🚀 Future Improvements

Potential improvements include:

- Integration with verified live public-transit data.
- More robust multilingual speech recognition and spoken guidance.
- Improved bus identification and destination matching.
- GPS-based stop tracking and arrival notifications.
- Verified walking and public-transit directions.
- Accessibility-aware routing using reliable sidewalk and infrastructure data.
- Better offline support for essential journey information.
- Improved emergency contact workflows.
- More comprehensive testing with visually impaired commuters.
- Stronger privacy controls and secure handling of sensitive information.

These are proposed improvements, not claims that the capabilities are already implemented.

---

## 🎯 Project Objective

Drishti AI aims to make public transportation more accessible by combining voice assistance, bus-board OCR, route visualization, budget-aware trip planning, and emergency contact access in one interface.

By bringing these features together, the project explores how accessible software can help visually impaired and low-vision commuters obtain journey information with greater independence.

---

## 👥 Team & Contributors

Add your verified team details here.

- **Project:** Drishti AI
- **Domain:** Accessibility / Assistive Technology / Smart Mobility
- **Institution:** Dr. Shakuntala Misra National Rehabilitation University
- **Team Name:** TEAM CONTINENTAL
- **Team Members:** RITIK PATHAK
                 ** MOHAMMAD REHAN 
                 ** AKHAND PRATAP SINGH
                 ** YASH SRIVASTAVA
---

## 📄 Disclaimer

Drishti AI is a prototype intended for demonstration and development purposes. Route information, fares, OCR results, and journey guidance may rely on predefined or demonstration data. The application does not guarantee real-time transit accuracy, route safety, accessibility, or emergency response.

Users should independently verify important travel and emergency information.

---

## 📜 License

Choose and add an appropriate open-source license before distributing the project publicly.
