/**
 * Voice Recognition Engine using Web Speech API (SpeechRecognition)
 * Parses spoken travel destinations for visually impaired commuters
 */

export interface SpeechRecognitionResult {
  transcript: string;
  cleanedDestination: string;
}

type SpeechCallback = (result: SpeechRecognitionResult) => void;
type ErrorCallback = (error: string) => void;
type StatusCallback = (isListening: boolean) => void;

class SpeechRecognitionManager {
  private recognition: any = null;
  private isListening: boolean = false;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public cleanDestination(transcript: string): string {
    let clean = transcript.trim().toLowerCase();

    // Remove natural conversation prefixes
    const prefixes = [
      'take me to the',
      'take me to',
      'i want to go to the',
      'i want to go to',
      'go to the',
      'go to',
      'navigate to the',
      'navigate to',
      'heading to the',
      'heading to',
      'destination is',
      'travel to',
      'i need to reach',
      'take to'
    ];

    for (const prefix of prefixes) {
      if (clean.startsWith(prefix)) {
        clean = clean.substring(prefix.length).trim();
        break;
      }
    }

    // Capitalize words
    return clean
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  public startListening(
    onResult: SpeechCallback,
    onError: ErrorCallback,
    onStatusChange?: StatusCallback,
    language: string = 'en-US'
  ) {
    if (!this.isSupported()) {
      onError('Speech recognition is not supported in this browser. Please use manual entry.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      return;
    }

    try {
      const win = window as any;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();

      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = language;

      this.recognition.onstart = () => {
        this.isListening = true;
        onStatusChange?.(true);
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const cleaned = this.cleanDestination(transcript);
        onResult({
          transcript,
          cleanedDestination: cleaned || transcript,
        });
      };

      this.recognition.onerror = (event: any) => {
        let msg = 'Voice recognition error occurred.';
        if (event.error === 'not-allowed') {
          msg = 'Microphone permission was denied. Please allow microphone access or type your destination.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech was detected. Please try speaking again.';
        } else if (event.error === 'network') {
          msg = 'Network connection issue during speech recognition. Using offline text fallback.';
        }
        onError(msg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onStatusChange?.(false);
      };

      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      onStatusChange?.(false);
      onError(err?.message || 'Could not initiate microphone.');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Safe fallback
      }
      this.isListening = false;
    }
  }
}

export const speechRecognition = new SpeechRecognitionManager();
