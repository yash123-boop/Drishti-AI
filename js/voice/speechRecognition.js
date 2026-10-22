export function initSpeechRecognition(onResult, onError) {
  const win = window;
  const SpeechClass = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!SpeechClass) {
    onError('Speech recognition not supported');
    return null;
  }
  const recog = new SpeechClass();
  recog.onresult = (e) => {
    const text = e.results[0][0].transcript;
    onResult(text);
  };
  recog.onerror = (e) => onError(e.error);
  return recog;
}
