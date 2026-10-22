/**
 * Accessibility State & Screen Reader Announcer
 */

import type { AccessibilitySettings } from '../../types/transit';

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  textSize: 'normal',
  speechEnabled: true,
  hapticsEnabled: true,
  chimesEnabled: true,
  autoAnnounce: true,
};

type AnnounceListener = (message: string, politeness: 'polite' | 'assertive') => void;

class AccessibilityManager {
  private listeners: Set<AnnounceListener> = new Set();

  public subscribeAnnouncer(fn: AnnounceListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
    this.listeners.forEach((fn) => fn(message, politeness));
  }

  public loadSettings(): AccessibilitySettings {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('drishti_a11y_settings');
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }

  public saveSettings(settings: AccessibilitySettings) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('drishti_a11y_settings', JSON.stringify(settings));
      } catch {
        // Fallback
      }
    }
  }
}

export const accessibilityManager = new AccessibilityManager();
