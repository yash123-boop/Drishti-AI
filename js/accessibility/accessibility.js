export function toggleHighContrast(enabled) {
  if (enabled) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
}
