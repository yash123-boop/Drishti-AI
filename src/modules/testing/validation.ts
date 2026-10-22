/**
 * Automated Verification & Testing Suite
 * Tests all 5 buildathon demo scenarios as specified in Master Prompt
 */

import { DEMO_ROUTES } from '../routes/routeData';
import { searchRoutesByDestination } from '../routes/routeSelector';
import { matchBusToRoute, normalizeBusNumber } from '../routes/routeMatcher';
import { parseBusNumberFromOCR } from '../ocr/textParser';
import { evaluateStopProgress } from '../journey/stopManager';
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

  return results;
}
