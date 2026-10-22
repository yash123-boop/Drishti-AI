/**
 * Haptic Vibration Engine with Visual Radar Fallback
 * Implements tactile pulses for visually impaired commuters
 */

export type HapticType =
  | 'tap'
  | 'turn'
  | 'next-stop'
  | 'approaching'
  | 'arrived'
  | 'wrong-bus'
  | 'emergency';

type HapticListener = (pattern: number[], description: string) => void;

class HapticEngine {
  private isEnabled: boolean = true;
  private listeners: Set<HapticListener> = new Set();

  public subscribe(fn: HapticListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  private trigger(pattern: number[], description: string) {
    if (!this.isEnabled) return;

    // Trigger hardware motor if available
    if (this.isSupported()) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe fallback
      }
    }

    // Notify UI listeners for tactile radar/wave animation
    this.listeners.forEach((listener) => listener(pattern, description));
  }

  public tap() {
    this.trigger([40], 'Tactile Tap');
  }

  public turnCue() {
    this.trigger([150, 80, 150], 'Navigation Turn Cue');
  }

  public nextStop() {
    this.trigger([100, 50, 100], 'Approaching Next Stop');
  }

  public approachingDestination() {
    this.trigger([300, 100, 300, 100, 300], 'Destination Approaching (1 Stop Left)');
  }

  public destinationReached() {
    this.trigger([500, 150, 500, 150, 500, 150, 800], 'Destination Reached Safely');
  }

  public wrongBusAlert() {
    this.trigger([400, 100, 400, 100, 400], 'Warning: Wrong Bus Detected');
  }

  public emergencyAlert() {
    this.trigger([800, 200, 800, 200, 800], 'Emergency SOS Alert');
  }
}

export const hapticEngine = new HapticEngine();
