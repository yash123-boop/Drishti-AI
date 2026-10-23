/**
 * Spoken Guidance Engine using Web Speech API (SpeechSynthesis)
 * Engineered for blind and visually impaired transit commuters
 */

class SpeechSynthesisManager {
  private isEnabled: boolean = true;
  private lastSpokenText: string = '';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private language: string = 'en-IN';

public setLanguage(language: string) {
  this.language = language;
}

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public stop() {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  public repeat() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, true);
    }
  }

  public speak(text: string, force: boolean = false) {
    if (!this.isEnabled && !force) return;
    if (!this.isSupported()) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending utterances
      this.lastSpokenText = text;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.lang = this.language;
      const voices = window.speechSynthesis.getVoices();

const preferred =
  voices.find(
    (voice) =>
      voice.lang.toLowerCase() === this.language.toLowerCase()
  ) ??
  voices.find(
    (voice) =>
      voice.lang.toLowerCase().startsWith(
        this.language.split('-')[0].toLowerCase()
      )
  );

if (preferred) {
  utterance.voice = preferred;
}



     
    
      
        
  

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Safe fallback
    }
  }

  // Pre-configured accessibility announcements
  public announceWelcome() {
    this.speak(
      'Welcome to Drishti AI, your accessible travel companion. Press the microphone button or press the Space bar to state your destination.'
    );
  }

  public announceDestinationRecognized(destination: string) {
    this.speak(`Destination understood: ${destination}. Searching accessible transit routes.`);
  }

  public announceRoutesFound(count: number, destination: string) {
    this.speak(`Found ${count} demonstration routes to ${destination}. Please select your preferred route.`);
  }

  public announceScanPrompt(busNumber: string) {
    this.speak(`Route selected. Please point your camera at the front bus display board or upload an image to confirm Bus ${busNumber}.`);
  }

  public announceBusMatched(busNumber: string, routeName: string) {
    this.speak(`Bus number ${busNumber} verified for ${routeName}. You may now safely board the bus and start your journey.`);
  }

  public announceWrongBus(scannedNumber: string, expectedNumber: string) {
    this.speak(`Warning: Wrong bus detected. You scanned bus ${scannedNumber}, but your selected route requires bus ${expectedNumber}. Do not board this bus.`);
  }

  public announceJourneyStarted(firstStop: string, destination: string) {
    this.speak(`Journey started from ${firstStop} towards ${destination}. We will announce upcoming stops and vibrate before each stop.`);
  }

  public announceStopProgress(currentStop: string, nextStop: string | null) {
    if (nextStop) {
      this.speak(`Current stop: ${currentStop}. Next stop will be: ${nextStop}.`);
    } else {
      this.speak(`Current stop: ${currentStop}. Preparing for final arrival.`);
    }
  }

  public announceApproaching(destination: string) {
    this.speak(`Attention: Your final destination, ${destination}, is approaching at the very next stop. Please get ready to disembark.`);
  }

  public announceDestinationReached(destination: string) {
    this.speak(`You have arrived at your destination: ${destination}. Please take your belongings and exit carefully.`);
  }

  public announceEmergency() {
    this.speak(`Emergency mode opened. Press confirm to broadcast your location to registered safety contacts, or press cancel to return.`);
  }
}

export const speechSynth = new SpeechSynthesisManager();
