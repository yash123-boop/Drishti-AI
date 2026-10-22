export function triggerEmergencySOS() {
  if (navigator.vibrate) {
    navigator.vibrate([800, 200, 800, 200, 800]);
  }
  return {
    status: 'ACTIVE',
    message: 'Emergency siren active. Demo alert sent to registered emergency contacts.'
  };
}
