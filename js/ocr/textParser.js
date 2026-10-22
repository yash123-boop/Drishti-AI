export function extractBusNumber(text) {
  if (!text) return null;
  const match = text.match(/\b([0-9]{2,4}[A-Z]?)\b/);
  return match ? match[1] : null;
}
