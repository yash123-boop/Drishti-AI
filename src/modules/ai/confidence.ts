export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 80) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
}

export function getConfidenceMessage(confidence: number, candidate: string): string {
  switch (getConfidenceLevel(confidence)) {
    case 'high':
      return `Bus number ${candidate} detected with high confidence.`;
    case 'medium':
      return `Bus number may be ${candidate}. Please verify.`;
    case 'low':
      return 'Bus number is uncertain. Please scan again.';
  }
}
