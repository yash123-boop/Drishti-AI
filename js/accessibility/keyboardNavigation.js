export function setupKeyboardShortcuts(callbacks) {
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 's') {
      callbacks.onEmergency?.();
    }
  });
}
