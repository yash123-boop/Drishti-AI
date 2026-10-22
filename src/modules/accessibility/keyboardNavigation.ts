/**
 * Global Keyboard Navigation & Accessibility Shortcuts
 */

export interface ShortcutHandlers {
  onVoiceToggle: () => void;
  onEmergencyToggle: () => void;
  onNextStop: () => void;
  onRepeatAudio: () => void;
  onContrastToggle: () => void;
  onEscape: () => void;
}

export function registerGlobalShortcuts(handlers: ShortcutHandlers): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Avoid triggering when focused inside an input/textarea
    const target = e.target as HTMLElement;
    const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (e.key === 'Escape') {
      handlers.onEscape();
      return;
    }

    // Alt + V : Voice input
    if (e.altKey && (e.key === 'v' || e.key === 'V')) {
      e.preventDefault();
      handlers.onVoiceToggle();
      return;
    }

    // Alt + S : Emergency SOS
    if (e.altKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      handlers.onEmergencyToggle();
      return;
    }

    // Alt + N : Advance Next Stop
    if (e.altKey && (e.key === 'n' || e.key === 'N')) {
      e.preventDefault();
      handlers.onNextStop();
      return;
    }

    // Alt + R : Repeat last spoken instruction
    if (e.altKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      handlers.onRepeatAudio();
      return;
    }

    // Alt + H : Toggle High Contrast
    if (e.altKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      handlers.onContrastToggle();
      return;
    }

    // Space key: Quick Voice Toggle when not typing
    if (e.code === 'Space' && !isEditing && target.tagName !== 'BUTTON') {
      e.preventDefault();
      handlers.onVoiceToggle();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}
