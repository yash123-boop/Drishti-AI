/**
 * Spoken guidance using the browser Web Speech API.
 */
import {
  getVoiceMessage,
  type VoiceMessageKey,
  type VoiceMessageParameters,
} from './voiceMessages';

class SpeechSynthesisManager {
  private isEnabled = true;
  private lastSpokenText = '';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private playbackId = 0;
  private cloudTtsAvailable = false;
  private onSpeechError: ((message: string) => void) | null = null;
  private rate = 1;
  private pitch = 1;
  private language = 'en-IN';

  public setLanguage(language: string) {
    this.language = language;
  }

  public getMessage(
    key: VoiceMessageKey,
    parameters: VoiceMessageParameters = {}
  ): string {
    return getVoiceMessage(this.language, key, parameters);
  }

  private findVoice(language: string): SpeechSynthesisVoice | undefined {
    if (!this.isSupported()) return undefined;

    const normalizedLanguage = language.replace('_', '-').toLowerCase();
    const languagePrefix = normalizedLanguage.split('-')[0];
    const voices = window.speechSynthesis.getVoices();

    return (
      voices.find(
        (voice) => voice.lang.replace('_', '-').toLowerCase() === normalizedLanguage
      ) ??
      voices.find(
        (voice) =>
          voice.lang.replace('_', '-').toLowerCase().split('-')[0] === languagePrefix
      )
    );
  }

  public hasVoiceForLanguage(language = this.language): boolean {
    return Boolean(this.findVoice(language));
  }

  public setCloudTtsAvailable(available: boolean) {
    this.cloudTtsAvailable = available;
  }

  public setSpeechErrorHandler(handler: ((message: string) => void) | null) {
    this.onSpeechError = handler;
  }

  public speakMessage(
    key: VoiceMessageKey,
    parameters: VoiceMessageParameters = {},
    force = false
  ) {
    this.speak(this.getMessage(key, parameters), force);
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
    this.playbackId += 1;
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.currentAudio?.pause();
    this.currentAudio = null;
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
  }

  public repeat() {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, true);
    }
  }

  public speak(text: string, force = false) {
    if ((!this.isEnabled && !force) || !text.trim() || typeof window === 'undefined') {
      return;
    }

    this.stop();
    this.lastSpokenText = text;
    const playbackId = this.playbackId;

    const preferredVoice = this.findVoice(this.language);
    if (!preferredVoice) {
      if (this.cloudTtsAvailable) {
        void this.speakWithCloudTts(text, playbackId);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.lang = this.language;
    utterance.voice = preferredVoice;
    this.currentUtterance = utterance;
    utterance.onend = () => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
      }
    };
    utterance.onerror = (event) => {
      if (this.currentUtterance === utterance) {
        this.currentUtterance = null;
        console.error('Speech synthesis failed:', event.error);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  private async speakWithCloudTts(text: string, playbackId: number) {
    let errorReported = false;
    const reportError = (error: unknown) => {
      if (errorReported) return;
      errorReported = true;
      console.error('Cloud speech generation or playback failed:', error);
      this.onSpeechError?.(this.getMessage('ttsUnavailable'));
    };

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: this.language }),
      });
      if (!response.ok) {
        throw new Error(`Cloud speech request failed with HTTP ${response.status}.`);
      }

      const audioBlob = await response.blob();
      if (audioBlob.size === 0) {
        throw new Error('Cloud speech response did not contain audio.');
      }
      if (playbackId !== this.playbackId) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      this.currentAudioUrl = audioUrl;

      const cleanup = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.currentAudioUrl = null;
          URL.revokeObjectURL(audioUrl);
        }
      };
      audio.onended = cleanup;
      audio.onerror = () => {
        cleanup();
        if (playbackId === this.playbackId) {
          reportError(new Error('Cloud speech audio playback failed.'));
        }
      };
      await audio.play();
    } catch (error) {
      if (playbackId === this.playbackId) {
        this.currentAudio?.pause();
        this.currentAudio = null;
        if (this.currentAudioUrl) {
          URL.revokeObjectURL(this.currentAudioUrl);
          this.currentAudioUrl = null;
        }
        reportError(error);
      }
    }
  }

  public announceWelcome() {
    this.speakMessage('welcome');
  }

  public announceDestinationRecognized(destination: string) {
    this.speakMessage('destinationRecognized', { destination });
  }

  public announceRoutesFound(count: number, destination: string) {
    this.speakMessage('routesFound', { count, destination });
  }

  public announceNoRoutes(destination: string) {
    this.speakMessage('noRoutes', { destination });
  }

  public announceScanPrompt(busNumber: string) {
    this.speakMessage('scanPrompt', { bus: busNumber });
  }

  public announceRouteSummary(
    busNumber: string,
    routeName: string,
    origin: string,
    destination: string,
    stopCount: number,
    frequencyMinutes: number
  ) {
    this.speakMessage('routeSummary', {
      bus: busNumber,
      route: routeName,
      origin,
      destination,
      stops: stopCount,
      frequency: frequencyMinutes,
    });
  }

  public announceBusMatched(busNumber: string, routeName: string) {
    this.speakMessage('busMatched', { bus: busNumber, route: routeName });
  }

  public announceWrongBus(scannedNumber: string, expectedNumber: string) {
    this.speakMessage('wrongBus', { scanned: scannedNumber, expected: expectedNumber });
  }

  public announceDetectedBus(busNumber: string) {
    this.speakMessage('detectedBus', { bus: busNumber });
  }

  public announceInvalidBus() {
    this.speakMessage('invalidBus');
  }

  public announceJourneyStarted(firstStop: string, destination: string) {
    this.speakMessage('journeyStarted', { origin: firstStop, destination });
  }

  public announceStopProgress(currentStop: string, nextStop: string | null) {
    if (nextStop) {
      this.speakMessage('stopProgressNext', { current: currentStop, next: nextStop });
    } else {
      this.speakMessage('stopProgressFinal', { current: currentStop });
    }
  }

  public announceApproaching(destination: string) {
    this.speakMessage('approaching', { destination });
  }

  public announceDestinationReached(destination: string) {
    this.speakMessage('destinationReached', { destination });
  }

  public announceEmergency() {
    this.speakMessage('emergencyPrompt');
  }
}

export const speechSynth = new SpeechSynthesisManager();