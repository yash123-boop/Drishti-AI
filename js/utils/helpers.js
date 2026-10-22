export function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

export function sanitizeText(text) {
  return (text || '').trim().toLowerCase();
}
