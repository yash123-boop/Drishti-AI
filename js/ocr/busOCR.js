import { extractBusNumber } from './textParser.js';

export async function scanBusBoard(imageElement) {
  if (window.Tesseract) {
    const res = await window.Tesseract.recognize(imageElement, 'eng');
    const text = res.data.text;
    return {
      text,
      candidate: extractBusNumber(text),
      confidence: res.data.confidence
    };
  }
  return { text: '', candidate: null, confidence: 0 };
}
