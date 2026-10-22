export function announceToScreenReader(message) {
  const liveRegion = document.getElementById('a11y-live-announcer');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}
