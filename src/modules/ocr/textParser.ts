/**
 * Text Parser for Bus Number OCR Recognition
 * Cleans noisy OCR outputs and extracts plausible transit line identifiers
 */

export interface ParsedBusResult {
  candidateNumber: string | null;
  confidenceScore: number;
  extractedTokens: string[];
}

export function parseDestinationFromOCR(rawText: string): string | null {
  const destinations = [
    'Hazratganj',
    'Gomti Nagar',
    'Alambagh',
    'Charbagh',
    'Lucknow Airport',
  ];
  const normalizedText = rawText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  return destinations.find((destination) =>
    normalizedText.includes(destination.toLowerCase())
  ) ?? null;
}

export function parseBusNumberFromOCR(rawText: string, tesseractConfidence: number = 0): ParsedBusResult {
  if (!rawText || !rawText.trim()) {
    return {
      candidateNumber: null,
      confidenceScore: 0,
      extractedTokens: []
    };
  }

  // Normalize text: uppercase, replace weird characters
  const cleaned = rawText
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split into tokens
  const tokens = cleaned.split(' ').filter(Boolean);

  // Common bus words to ignore
  const stopWords = new Set(['BUS', 'ROUTE', 'LINE', 'EXPRESS', 'METRO', 'DIRECT', 'SHUTTLE', 'CITY', 'AC', 'TRANSIT']);
  const filteredTokens = tokens.filter((t) => !stopWords.has(t));

  // Pattern 1: Pure 2-4 digits (e.g. "101", "204", "502", "305")
  const digitMatches = filteredTokens.filter((t) => /^[0-9]{2,4}$/.test(t));
  if (digitMatches.length > 0) {
    return {
      candidateNumber: digitMatches[0],
      confidenceScore: tesseractConfidence,
      extractedTokens: tokens
    };
  }

  // LED displays can be segmented by OCR into separate single-digit tokens.
  for (let index = 0; index < filteredTokens.length; index += 1) {
    if (!/^\d$/.test(filteredTokens[index])) continue;
    const digits: string[] = [];
    while (index < filteredTokens.length && /^\d$/.test(filteredTokens[index])) {
      digits.push(filteredTokens[index]);
      index += 1;
    }
    if (digits.length >= 2 && digits.length <= 4) {
      return {
        candidateNumber: digits.join(''),
        confidenceScore: tesseractConfidence,
        extractedTokens: tokens
      };
    }
  }

  // Pattern 2: Digits followed by letter (e.g. "101A", "45B")
  const alphanumericMatches = filteredTokens.filter((t) => /^[0-9]{2,3}[A-Z]$/.test(t));
  if (alphanumericMatches.length > 0) {
    return {
      candidateNumber: alphanumericMatches[0],
      confidenceScore: tesseractConfidence,
      extractedTokens: tokens
    };
  }

  // Pattern 3: Look for numbers inside larger words (e.g. "BUS101", "ROUTE#204")
  const embeddedMatch = cleaned.match(/\b(?:BUS|NO|R)?\s*([0-9]{2,4}[A-Z]?)\b/);
  if (embeddedMatch && embeddedMatch[1]) {
    return {
      candidateNumber: embeddedMatch[1],
      confidenceScore: tesseractConfidence,
      extractedTokens: tokens
    };
  }

  // Fallback: check any token containing digits
  const anyDigit = filteredTokens.find((t) => /[0-9]+/.test(t));
  if (anyDigit) {
    const extractedNum = anyDigit.replace(/[^0-9]/g, '');
    if (extractedNum.length >= 2 && extractedNum.length <= 4) {
      return {
        candidateNumber: extractedNum,
        confidenceScore: tesseractConfidence,
        extractedTokens: tokens
      };
    }
  }

  return {
    candidateNumber: null,
    confidenceScore: tesseractConfidence,
    extractedTokens: tokens
  };
}
