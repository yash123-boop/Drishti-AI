/**
 * Automated Verification & Testing Suite
 * Tests all 5 buildathon demo scenarios as specified in Master Prompt
 */

import { DEMO_ROUTES } from '../routes/routeData';
import { searchRoutesByDestination } from '../routes/routeSelector';
import { matchBusToRoute, normalizeBusNumber } from '../routes/routeMatcher';
import { parseBusNumberFromOCR } from '../ocr/textParser';
import { evaluateStopProgress } from '../journey/stopManager';
import { analyzeDemoBusBoard } from '../ai/busDetection';
import { findJourneyOptions, findNearestDemoStop } from '../routes/journeyPlanner';
import { answerJourneyQuestion, getJourneyStateResponse, type JourneyAssistantContext } from '../ai/journeyAssistant';
import { getVoiceMessage } from '../voice/voiceMessages';
import type { OCRResult } from '../../types/transit';
import type { TestScenarioResult } from '../../types/transit';

export function runValidationSuite(): TestScenarioResult[] {
  const results: TestScenarioResult[] = [];

  // Test 1: Destination Search for "Hazratganj"
  try {
    const matching = searchRoutesByDestination('Hazratganj');
    const hasRoute101 = matching.some((r) => r.id === 'route-101');
    const hasRoute305 = matching.some((r) => r.id === 'route-305');
    const passed = matching.length >= 2 && hasRoute101 && hasRoute305;
    results.push({
      id: 'test-1-search',
      name: 'Scenario 1.A: Destination Search (Hazratganj)',
      passed,
      details: passed
        ? `Found ${matching.length} matching routes including Route 101 and Route 305.`
        : `Failed to find expected routes for Hazratganj.`,
    });
  } catch (err: any) {
    results.push({
      id: 'test-1-search',
      name: 'Scenario 1.A: Destination Search (Hazratganj)',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  // Test 2: Bus Route Matcher (Correct Bus 101 on Route 101)
  try {
    const route101 = DEMO_ROUTES.find((r) => r.id === 'route-101')!;
    const matchRes = matchBusToRoute('101', route101);
    const passed = matchRes.status === 'MATCH';
    results.push({
      id: 'test-2-match',
      name: 'Scenario 1.B: Correct Bus Verification (Bus 101)',
      passed,
      details: passed
        ? `Bus 101 correctly matched Route 101 with status MATCH.`
        : `Match failed: received ${matchRes.status}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test-2-match',
      name: 'Scenario 1.B: Correct Bus Verification (Bus 101)',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  // Test 3: Wrong Bus Rejection (Bus 204 on Route 101)
  try {
    const route101 = DEMO_ROUTES.find((r) => r.id === 'route-101')!;
    const wrongRes = matchBusToRoute('204', route101);
    const passed = wrongRes.status === 'WRONG_BUS' && wrongRes.message.includes('Do NOT board');
    results.push({
      id: 'test-3-wrong-bus',
      name: 'Scenario 2: Wrong Bus Detection & Rejection',
      passed,
      details: passed
        ? `Detected Bus 204 is for Gomti Nagar and flagged WRONG_BUS.`
        : `Failed to detect wrong bus: status was ${wrongRes.status}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test-3-wrong-bus',
      name: 'Scenario 2: Wrong Bus Detection & Rejection',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  // Test 4: OCR Text Parser from Noisy Board Text
  try {
    const sampleRaw = 'UP-32-AZ ROUTE 101 EXP HAZRATGANJ';
    const parsed = parseBusNumberFromOCR(sampleRaw, 92);
    const passed = parsed.candidateNumber === '101' && parsed.confidenceScore >= 80;
    results.push({
      id: 'test-4-ocr-parser',
      name: 'Scenario 3: OCR Bus Number Extraction & Filtering',
      passed,
      details: passed
        ? `Successfully extracted candidate "101" from noisy display text.`
        : `Failed: extracted candidate was ${parsed.candidateNumber}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test-4-ocr-parser',
      name: 'Scenario 3: OCR Bus Number Extraction & Filtering',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  // Test 5: Stop Progression & Destination Alert
  try {
    const route101 = DEMO_ROUTES.find((r) => r.id === 'route-101')!;
    // Stop 0: Charbagh (Start)
    const step0 = evaluateStopProgress(route101, 0);
    // Stop 2: Vidhan Sabha (Penultimate -> isPenultimate true)
    const step2 = evaluateStopProgress(route101, 2);
    // Stop 3: Hazratganj (Final -> isFinal true)
    const step3 = evaluateStopProgress(route101, 3);

    const passed =
      !step0.isPenultimate &&
      !step0.isFinal &&
      step2.isPenultimate &&
      !step2.isFinal &&
      step3.isFinal;

    results.push({
      id: 'test-5-stops',
      name: 'Scenario 1.C: Journey Stop Progression & Alerts',
      passed,
      details: passed
        ? `Properly identifies start, penultimate (destination approaching), and final stop.`
        : `Stop evaluation logic returned incorrect flags.`,
    });
  } catch (err: any) {
    results.push({
      id: 'test-5-stops',
      name: 'Scenario 1.C: Journey Stop Progression & Alerts',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  // Test 6: Unknown Destination Handled Safely
  try {
    const nonExistent = searchRoutesByDestination('Varanasi Ghat');
    const passed = nonExistent.length === 0;
    results.push({
      id: 'test-6-missing-dest',
      name: 'Scenario 3.B: Graceful Handling for Unknown Destination',
      passed,
      details: passed
        ? `Returns clean empty list for unserved destinations without crashing.`
        : `Unexpectedly returned routes for unknown destination.`,
    });
  } catch (err: any) {
    results.push({
      id: 'test-6-missing-dest',
      name: 'Scenario 3.B: Graceful Handling for Unknown Destination',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  // Test 7: Confidence-gated AI-demo bus detection
  try {
    const baseOCR: OCRResult = {
      rawText: 'BUS 101',
      candidateNumber: '101',
      confidence: 92,
      isReliable: true,
      source: 'upload',
    };
    const verified = analyzeDemoBusBoard(baseOCR);
    const uncertain = analyzeDemoBusBoard({ ...baseOCR, confidence: 59 });
    const unknown = analyzeDemoBusBoard({ ...baseOCR, candidateNumber: '999' });
    const missing = analyzeDemoBusBoard({ ...baseOCR, candidateNumber: null });
    const passed =
      verified.verification === 'verified' &&
      uncertain.verification === 'uncertain' &&
      unknown.verification === 'failed' &&
      missing.verification === 'not-detected';
    results.push({
      id: 'test-7-confidence-detection',
      name: 'AI Demo Detection: Confidence and Bus Verification',
      passed,
      details: passed
        ? 'High-confidence known bus verified; uncertain, unknown, and missing readings were not accepted.'
        : `Unexpected detection states: ${verified.verification}, ${uncertain.verification}, ${unknown.verification}, ${missing.verification}.`,
    });
  } catch (err: any) {
    results.push({
      id: 'test-7-confidence-detection',
      name: 'AI Demo Detection: Confidence and Bus Verification',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  // Test 8: Route-backed trip costs, nearest stop, and no invented connection
  try {
    const options = findJourneyOptions('Charbagh Railway Station', 'Hazratganj');
    const nearest = findNearestDemoStop(26.8322, 80.92);
    const unsupported = answerJourneyQuestion('How can I go from Charbagh Railway Station to Bara Imambara?');
    const budgetAnswer = answerJourneyQuestion('Show trips under ₹500');
    const passed =
      options.some((option) => option.route.busNumber === '101') &&
      options.every((option) => option.roundTripTotalInr === 2 * option.busFareInr + option.foodEstimateInr + option.entryFeeEstimateInr + option.localTransportEstimateInr + option.miscellaneousInr) &&
      nearest?.name === 'Charbagh Railway Station' &&
      nearest.distanceMeters < 1 &&
      unsupported.includes('no direct') &&
      !unsupported.includes('BUS-') &&
      budgetAnswer.includes('route-backed demo trip') &&
      !budgetAnswer.includes('BUS-500');
    results.push({
      id: 'test-8-journey-planning',
      name: 'Trip Planner: Demo Route Costs and Grounded Responses',
      passed,
      details: passed
        ? 'Hazratganj has a route-backed INR estimate, nearest-stop matching is accurate, unsupported trips are not invented, and budget amounts are not parsed as bus numbers.'
        : 'Route, round-trip expense totals, nearest stop, or unsupported-trip handling did not match expectations.',
    });
  } catch (err: any) {
    results.push({
      id: 'test-8-journey-planning',
      name: 'Trip Planner: Demo Route Costs and Grounded Responses',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  // Test 9: Context-aware assistant follows the active journey stage
  try {
    const route = DEMO_ROUTES.find((candidate) => candidate.id === 'route-101')!;
    const contexts: JourneyAssistantContext[] = [
      { stage: 'IDLE' },
      { stage: 'DESTINATION_SELECTED', destination: route.destination, matchingRouteCount: 2 },
      { stage: 'ROUTE_SELECTED', route },
      { stage: 'AT_BUS_STOP', route },
      { stage: 'SCANNING_BUS', route },
      { stage: 'BUS_VERIFICATION', route, detectedBusNumber: '101' },
      { stage: 'JOURNEY_STARTED', route },
      { stage: 'APPROACHING_STOP', route },
      { stage: 'DESTINATION_REACHED', route },
      { stage: 'EMERGENCY', route },
    ];
    const responses = contexts.map((context) => getJourneyStateResponse(context));
    const scanningContext = contexts.find((context) => context.stage === 'SCANNING_BUS')!;
    const nextStep = answerJourneyQuestion('What should I do now?', scanningContext);
    const hindiResponse = getJourneyStateResponse(contexts[3], 'hi-IN');
    const verifiedResponse = getJourneyStateResponse({
      stage: 'BUS_VERIFICATION',
      route,
      detectedBusNumber: '101',
      verificationStatus: 'MATCH',
    });
    const wrongBusResponse = getJourneyStateResponse({
      stage: 'BUS_VERIFICATION',
      route,
      detectedBusNumber: '204',
      verificationStatus: 'WRONG_BUS',
    });
    const passed =
      new Set(responses).size === contexts.length &&
      nextStep === getJourneyStateResponse(scanningContext) &&
      responses[3].includes(route.origin) &&
      responses[5].includes('101') &&
      verifiedResponse.includes('verified') &&
      /do not board/i.test(wrongBusResponse) &&
      hindiResponse.includes('स्कैन');
    results.push({
      id: 'test-9-context-aware-assistant',
      name: 'Voice Assistant: Journey-State-Aware Guidance',
      passed,
      details: passed
        ? 'Assistant guidance changes across all 10 journey stages, including match/mismatch results; Hindi status text is available.'
        : 'The assistant did not return distinct, localized guidance for each journey state.',
    });
  } catch (err: any) {
    results.push({
      id: 'test-9-context-aware-assistant',
      name: 'Voice Assistant: Journey-State-Aware Guidance',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  // Test 10: Hindi and English chatbot responses remain in the selected language
  try {
    const englishTrip = answerJourneyQuestion(
      'How can I go from Charbagh Railway Station to Hazratganj?',
      undefined,
      'en-IN'
    );
    const hindiTrip = answerJourneyQuestion(
      'चारबाग से हजरतगंज कैसे जाऊँ?',
      undefined,
      'hi-IN'
    );
    const englishWelcome = getVoiceMessage('en-IN', 'welcome');
    const hindiWelcome = getVoiceMessage('hi-IN', 'welcome');
    const passed =
      englishTrip.includes('From Charbagh') &&
      hindiTrip.includes('BUS-101') &&
      hindiTrip.includes('डेमो मार्ग') &&
      !hindiTrip.includes('Estimated bus fare') &&
      englishWelcome.includes('plan a trip') &&
      hindiWelcome.includes('यात्रा की योजना');
    results.push({
      id: 'test-10-bilingual-chat',
      name: 'Voice Assistant: English and Hindi Trip Planning',
      passed,
      details: passed
        ? 'The welcome and trip-planning answer are available in English and Hindi without mixing languages.'
        : `Language-specific welcome or trip-planning output was incorrect: ${hindiTrip}`,
    });
  } catch (err: any) {
    results.push({
      id: 'test-10-bilingual-chat',
      name: 'Voice Assistant: English and Hindi Trip Planning',
      passed: false,
      details: `Error: ${err.message}`,
    });
  }

  return results;
}
