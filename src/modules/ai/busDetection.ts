import type { OCRResult } from '../../types/transit';
import { DEMO_BUSES, normalizeDemoBusNumber } from '../routes/demoBusData';
import { DEMO_ROUTES } from '../routes/routeData';
import { getConfidenceLevel, type ConfidenceLevel } from './confidence';

export interface AIBusDetectionResult {
  busDetected: boolean;
  busNumber: string | null;
  route: string | null;
  destination: string | null;
  busType: string | null;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  verification: 'verified' | 'failed' | 'uncertain' | 'not-detected';
  verificationMessage: string;
  simulated: boolean;
}

export function analyzeDemoBusBoard(
  ocrResult: OCRResult,
  simulatedConfidence?: number
): AIBusDetectionResult {
  const confidence = Math.max(0, Math.min(100, Math.round(simulatedConfidence ?? ocrResult.confidence)));
  const candidate = ocrResult.candidateNumber
    ? normalizeDemoBusNumber(ocrResult.candidateNumber)
    : null;

  if (!candidate) {
    return {
      busDetected: false,
      busNumber: null,
      route: null,
      destination: ocrResult.destination ?? null,
      busType: null,
      confidence,
      confidenceLevel: getConfidenceLevel(confidence),
      verification: 'not-detected',
      verificationMessage: 'No bus detected. Please point the camera towards the bus and try again.',
      simulated: simulatedConfidence !== undefined,
    };
  }

  const confidenceLevel = getConfidenceLevel(confidence);
  if (confidenceLevel !== 'high') {
    return {
      busDetected: true,
      busNumber: candidate,
      route: null,
      destination: ocrResult.destination ?? null,
      busType: null,
      confidence,
      confidenceLevel,
      verification: 'uncertain',
      verificationMessage: confidenceLevel === 'medium'
        ? `Bus number may be ${candidate}. Please verify.`
        : 'Bus number is uncertain. Please scan again.',
      simulated: simulatedConfidence !== undefined,
    };
  }

  const bus = DEMO_BUSES[candidate];
  if (!bus) {
    return {
      busDetected: true,
      busNumber: candidate,
      route: null,
      destination: ocrResult.destination ?? null,
      busType: null,
      confidence,
      confidenceLevel,
      verification: 'failed',
      verificationMessage: 'Bus number could not be verified. Please scan again or enter the number manually.',
      simulated: simulatedConfidence !== undefined,
    };
  }

  const routeRecord = DEMO_ROUTES.find((route) => route.busNumber === candidate.slice(4));
  return {
    busDetected: true,
    busNumber: bus.busNumber,
    route: bus.route,
    destination: bus.destination,
    busType: routeRecord?.busType ?? null,
    confidence,
    confidenceLevel,
    verification: 'verified',
    verificationMessage: 'Bus verified against the app demo bus database.',
    simulated: simulatedConfidence !== undefined,
  };
}
