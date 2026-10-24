import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Edit3,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { busOCR } from '../modules/ocr/busOCR';
import { speechSynth } from '../modules/voice/speechSynthesis';
import { audioChimes } from '../modules/voice/audioChimes';
import { hapticEngine } from '../modules/voice/hapticEngine';
import { formatMessage, getMessages } from '../modules/messages';
import { analyzeDemoBusBoard, type AIBusDetectionResult } from '../modules/ai/busDetection';
import { getConfidenceLevel } from '../modules/ai/confidence';
import { CAMERA_GUIDANCE_DEMOS, getCameraGuidanceDemo, type CameraGuidanceKind, type CameraGuidanceDemo } from '../modules/ai/cameraGuidance';
import { DemoBusLookup } from './DemoBusLookup';
import type { TransitRoute, OCRResult } from '../types/transit';

interface BusScannerScreenProps {
  selectedRoute: TransitRoute;
  onOCRComplete: (result: OCRResult) => void;
  onManualEntry: (busNumber: string) => void;
  onBack: () => void;
  language: string;
  onScanStateChange: (isScanning: boolean) => void;
  onBusVerificationChange: (busNumber: string | null) => void;
}

export const BusScannerScreen: React.FC<BusScannerScreenProps> = ({
  selectedRoute,
  onOCRComplete,
  onManualEntry,
  onBack,
  language,
  onScanStateChange,
  onBusVerificationChange,
}) => {
  const t = getMessages(language);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [aiDetection, setAIDetection] = useState<AIBusDetectionResult | null>(null);
  const [guidanceKind, setGuidanceKind] = useState<CameraGuidanceKind>('bus');
  const [guidanceResult, setGuidanceResult] = useState<CameraGuidanceDemo | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBusNumber, setManualBusNumber] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualBusInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      busOCR.stopCamera();
    };
  }, []);

  useEffect(() => {
    onScanStateChange(isProcessing);
  }, [isProcessing, onScanStateChange]);

  useEffect(() => () => {
    onScanStateChange(false);
    onBusVerificationChange(null);
  }, [onBusVerificationChange, onScanStateChange]);

  useEffect(() => {
    if (showManualEntry) manualBusInputRef.current?.focus();
  }, [showManualEntry]);

  const handleStartCamera = async () => {
    if (isProcessing) return;
    audioChimes.play('tap');
    hapticEngine.tap();
    setCameraError(null);

    try {
      if (!videoRef.current) throw new Error('Camera preview is not available.');
      await busOCR.startCamera(videoRef.current);
      setCameraActive(true);
      speechSynth.speakMessage('cameraActive');
    } catch (error) {
      setCameraActive(false);
      const errorName = error instanceof DOMException ? error.name : '';
      const message = error instanceof Error ? error.message : '';
      const cameraMessage = errorName === 'NotAllowedError' || errorName === 'SecurityError'
        ? t.cameraDenied
        : errorName === 'NotFoundError' || errorName === 'OverconstrainedError' || message.includes('unavailable')
          ? t.cameraUnavailable
          : t.cameraError;
      setCameraError(cameraMessage);
      speechSynth.speak(cameraMessage);
    }
  };

  const handleStopCamera = () => {
    busOCR.stopCamera();
    setCameraActive(false);
    speechSynth.speak('AI camera stopped.');
  };

  const handleCaptureFromCamera = async () => {
    if (!videoRef.current || isProcessing) return;
    audioChimes.play('tap');
    hapticEngine.tap();

    const frameData = busOCR.captureFrame(videoRef.current);
    if (!frameData) {
      setCameraError(t.cameraError);
      speechSynth.speak(t.cameraError);
      return;
    }

    setPreviewImage(frameData);
    busOCR.stopCamera();
    setCameraActive(false);

    await processImageSource(frameData, 'camera');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file || isProcessing) return;

    audioChimes.play('tap');
    hapticEngine.tap();
    setCameraError(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = typeof evt.target?.result === 'string' ? evt.target.result : null;
      if (!dataUrl) {
        setScanError(t.ocrFailure);
        speechSynth.speak(t.ocrFailure);
        input.value = '';
        return;
      }
      setPreviewImage(dataUrl);
      await processImageSource(file, 'upload');
      input.value = '';
    };
    reader.onerror = () => {
      setScanError(t.ocrFailure);
      speechSynth.speak(t.ocrFailure);
      input.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleDemoPreset = async (presetType: '101' | '204' | 'blurry') => {
    if (isProcessing) return;
    audioChimes.play('tap');
    hapticEngine.tap();

    let dataUrl = '';
    setCameraError(null);
    if (presetType === '101') {
      dataUrl = busOCR.createDemoBoardImage('101', 'Hazratganj');
    } else if (presetType === '204') {
      dataUrl = busOCR.createDemoBoardImage('204', 'Gomti Nagar');
    } else {
      dataUrl = busOCR.createDemoBoardImage('???', 'Unreadable', true);
    }

    setPreviewImage(dataUrl);
    await processImageSource(dataUrl, 'preset');
  };

  const processImageSource = async (source: string | File, sourceType: 'camera' | 'upload' | 'preset') => {
    if (isProcessing) return;
    setScanError(null);
    setOcrResult(null);
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStatus('Initializing OCR...');
    speechSynth.speak(t.ocrProcessing);
    try {
      const result = await busOCR.processImage(source, (pct, status) => {
        setProgressPercent(pct);
        setProgressStatus(status);
      }, sourceType);
      const demoConfidence = sourceType === 'preset'
        ? (result.candidateNumber ? 94 : 34)
        : undefined;
      const detection = analyzeDemoBusBoard(result, demoConfidence);
      const resultWithConfidence = {
        ...result,
        confidence: detection.confidence,
        isReliable: detection.verification === 'verified',
      };
      setOcrResult(resultWithConfidence);
      setAIDetection(detection);
      onBusVerificationChange(detection.verification === 'verified' ? detection.busNumber : null);
      if (detection.verification === 'not-detected') {
        setScanError(t.ocrFailure);
        speechSynth.speak(detection.verificationMessage);
        return;
      }
      if (detection.verification === 'uncertain') {
        speechSynth.speak(detection.verificationMessage);
        return;
      }
      if (detection.verification === 'failed') {
        speechSynth.speak(`Bus number ${detection.busNumber} could not be verified in the demo database.`);
        return;
      }
      const confidenceMessage = `AI Demo Detection. Bus number ${detection.busNumber} detected with ${detection.confidence}% confidence. ${detection.verificationMessage}`;
      speechSynth.speak(confidenceMessage);
    } catch (error) {
      console.error('Bus-board scan failed:', error);
      setScanError(t.ocrFailure);
      speechSynth.speak(t.ocrFailure);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetScan = () => {
    busOCR.stopCamera();
    setCameraActive(false);
    setCameraError(null);
    setScanError(null);
    setPreviewImage(null);
    setOcrResult(null);
    setAIDetection(null);
    onBusVerificationChange(null);
    setGuidanceResult(null);
    setProgressPercent(0);
    setProgressStatus('');
  };

  const retryScan = () => {
    resetScan();
    void handleStartCamera();
  };

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const enteredNumber = manualBusNumber.trim();
    if (!enteredNumber) {
      setScanError(t.emptyBus);
      speechSynth.speak(t.emptyBus);
      manualBusInputRef.current?.focus();
      return;
    }
    onManualEntry(enteredNumber);
  };

  const handleDemoGuidance = () => {
    const result = getCameraGuidanceDemo(guidanceKind);
    setGuidanceResult(result);
    speechSynth.speak(`AI Camera Guidance demo. ${result.announcement}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          aria-label="Back to route selection"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Target Route</span>
          <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
            Bus {selectedRoute.busNumber} • {selectedRoute.destination}
          </span>
        </div>
      </div>

      <div aria-busy={isProcessing} className="card-surface p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">AI Bus Detection</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Scan a bus display with OCR, verify its number against the demo bus database, or try the explicitly simulated camera-guidance samples.
          </p>
          <p className="mx-auto max-w-2xl rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm font-semibold text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
            AI Demo Detection: this prototype uses OCR and simulated sample detections, not a trained computer-vision model. Confidence shown for camera uploads is the OCR engine’s estimate.
          </p>
        </div>

        {/* Video / Preview Frame */}
        <div className="relative aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-700 flex items-center justify-center shadow-inner">
          <video
            ref={videoRef}
            playsInline
            muted
            aria-label="Live camera preview for the bus board"
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />

          {!cameraActive && previewImage && (
            <img
              src={previewImage}
              alt="Bus Board Preview"
              className="w-full h-full object-contain bg-black"
            />
          )}

          {!cameraActive && !previewImage && (
            <div className="text-center p-6 space-y-3 text-slate-400">
              <Camera className="w-12 h-12 mx-auto opacity-40 text-blue-400" />
              <p className="text-sm font-medium">AI camera preview will appear here</p>
            </div>
          )}

          {/* OCR Processing Overlay */}
          {isProcessing && (
            <div role="status" aria-live="polite" className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white space-y-4">
              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin" />
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span>Running OCR</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-slate-300 text-center font-mono" aria-live="polite">{progressStatus}</p>
              </div>
            </div>
          )}
        </div>

        {cameraError && (
          <div role="alert" className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{cameraError}</span>
          </div>
        )}

        {scanError && (
          <div role="alert" aria-live="assertive" className="flex flex-col gap-3 rounded-xl border-2 border-rose-600 bg-rose-50 p-4 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold">{scanError}</p>
            <button
              type="button"
              onClick={retryScan}
              disabled={isProcessing}
              className="min-h-11 rounded-lg border-2 border-rose-700 px-4 py-2 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 disabled:opacity-50"
            >
              Try Again
            </button>
          </div>
        )}

        {ocrResult && (
          <section className="space-y-2 rounded-xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900" aria-live="polite">
            <h2 className="font-extrabold">Extracted bus-board information</h2>
            {ocrResult.candidateNumber && <p><strong>Bus number:</strong> {ocrResult.candidateNumber}</p>}
            {ocrResult.destination && <p><strong>Destination:</strong> {ocrResult.destination}</p>}
            <p><strong>Detected text:</strong> {ocrResult.rawText.trim() || 'No readable text detected.'}</p>
            <p><strong>OCR confidence category:</strong> {getConfidenceLevel(ocrResult.confidence).toUpperCase()} ({ocrResult.confidence}%)</p>
            <button
              type="button"
              onClick={resetScan}
              className="min-h-11 rounded-lg border border-slate-400 px-4 py-2 font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Clear scan result
            </button>
          </section>
        )}

        {aiDetection && (
          <section aria-labelledby="ai-bus-result-heading" aria-live="polite" className={`space-y-3 rounded-2xl border-2 p-5 ${aiDetection.verification === 'verified' ? 'border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100' : aiDetection.verification === 'failed' ? 'border-rose-600 bg-rose-50 text-rose-950 dark:bg-rose-950/40 dark:text-rose-100' : 'border-amber-600 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100'}`}>
            <h2 id="ai-bus-result-heading" className="text-xl font-extrabold">AI Demo Detection</h2>
            <p className="text-lg font-extrabold">Bus detected: {aiDetection.busDetected ? 'Yes' : 'No'}</p>
            <p><strong>Bus number:</strong> {aiDetection.busNumber ?? 'Not detected'}</p>
            <p><strong>Confidence:</strong> {aiDetection.confidence}% ({aiDetection.confidenceLevel.toUpperCase()}){aiDetection.simulated ? ' · Simulated demo confidence' : ' · OCR estimate'}</p>
            {aiDetection.route && <p><strong>Route:</strong> {aiDetection.route}</p>}
            {aiDetection.destination && <p><strong>Destination:</strong> {aiDetection.destination} (confidence category: {aiDetection.confidenceLevel.toUpperCase()})</p>}
            {aiDetection.busType && <p><strong>Bus type:</strong> {aiDetection.busType}</p>}
            <p role={aiDetection.verification === 'verified' ? 'status' : 'alert'} className="font-bold">
              {aiDetection.verification === 'verified' ? '✓ Bus Verified' : aiDetection.verification === 'failed' ? '⚠ Bus Verification Failed' : aiDetection.verificationMessage}
            </p>
            <p className="text-sm">{aiDetection.verificationMessage}</p>
            <div className="flex flex-wrap gap-3">
              {aiDetection.verification === 'verified' && ocrResult && (
                <button type="button" onClick={() => onOCRComplete(ocrResult)} className="min-h-12 rounded-xl bg-emerald-800 px-5 py-3 font-extrabold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
                  Continue to route verification
                </button>
              )}
              <button type="button" onClick={retryScan} className="min-h-12 rounded-xl border-2 border-current px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                Scan Again
              </button>
              {aiDetection.verification !== 'verified' && (
                <button type="button" onClick={() => {
                  setShowManualEntry(true);
                  requestAnimationFrame(() => manualBusInputRef.current?.focus());
                }} className="min-h-12 rounded-xl border-2 border-current px-5 py-3 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                  Enter Manually
                </button>
              )}
            </div>
          </section>
        )}

        {/* Primary Camera & Upload Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cameraActive ? (
            <>
              <button
                onClick={handleCaptureFromCamera}
                disabled={isProcessing}
                className="min-h-[52px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Camera className="w-5 h-5" />
                <span>Capture & Analyze Bus</span>
              </button>
              <button type="button" onClick={handleStopCamera} className="min-h-[52px] rounded-xl border-2 border-slate-400 px-4 font-bold dark:border-slate-600">Stop AI Camera</button>
            </>
          ) : (
            <button
              onClick={handleStartCamera}
              disabled={isProcessing}
              className="min-h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>Start AI Camera</span>
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="min-h-[52px] rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Photo</span>
          </button>
        </div>

        <section aria-labelledby="camera-guidance-heading" className="space-y-3 rounded-xl border border-violet-300 p-4 dark:border-violet-800">
          <div>
            <h2 id="camera-guidance-heading" className="font-extrabold">AI Camera Guidance · Demo</h2>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Choose a sample label to hear one spoken example. This control simulates a detector; it does not visually identify objects in the camera feed and does not give safety instructions.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="camera-guidance-target" className="sr-only">Choose simulated camera guidance target</label>
            <select id="camera-guidance-target" value={guidanceKind} onChange={(event) => setGuidanceKind(event.target.value as CameraGuidanceKind)} className="min-h-12 flex-1 rounded-lg border-2 border-slate-300 bg-white px-3 dark:border-slate-600 dark:bg-slate-900">
              {CAMERA_GUIDANCE_DEMOS.map((demo) => <option key={demo.kind} value={demo.kind}>{demo.label}</option>)}
            </select>
            <button type="button" onClick={handleDemoGuidance} className="min-h-12 rounded-lg bg-violet-700 px-4 py-3 font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300">
              Play guidance sample
            </button>
          </div>
          {guidanceResult && (
            <div role="status" aria-live="polite" className="rounded-lg border-2 border-violet-600 bg-violet-50 p-4 dark:bg-violet-950/40">
              <p className="text-lg font-extrabold">{guidanceResult.label} · {guidanceResult.confidence}% ({getConfidenceLevel(guidanceResult.confidence).toUpperCase()})</p>
              <p className="mt-1">{guidanceResult.announcement}</p>
              <p className="mt-1 text-xs">Simulated sample, not camera AI inference.</p>
            </div>
          )}
        </section>

        <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
          <DemoBusLookup language={language} />
        </div>

        {/* Buildathon Demo Presets (Crucial for evaluation) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Instant Demo Presets</span>
            <span>Test scenarios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoPreset('101')}
              disabled={isProcessing}
              className="p-3 text-left rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100 transition-colors"
            >
              <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200 block">
                ✓ Bus 101 Board
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                Correct Match Scenario
              </span>
            </button>

            <button
              onClick={() => handleDemoPreset('204')}
              disabled={isProcessing}
              className="p-3 text-left rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100 transition-colors"
            >
              <span className="font-bold text-xs text-rose-900 dark:text-rose-200 block">
                ⚠ Bus 204 Board
              </span>
              <span className="text-[11px] text-rose-700 dark:text-rose-400 block mt-0.5">
                Wrong Bus Alert Scenario
              </span>
            </button>

            <button
              onClick={() => handleDemoPreset('blurry')}
              disabled={isProcessing}
              className="p-3 text-left rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 transition-colors"
            >
              <span className="font-bold text-xs text-amber-900 dark:text-amber-200 block">
                ✕ Blurry Board
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 block mt-0.5">
                OCR Failure & Fallback
              </span>
            </button>
          </div>
        </div>

        {/* Manual Number Fallback Button */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setShowManualEntry((visible) => !visible);
              setScanError(null);
            }}
            aria-expanded={showManualEntry}
            aria-controls="manual-bus-entry"
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 p-2 rounded-lg"
          >
            <Edit3 className="w-4 h-4" />
            <span>Having trouble scanning? Enter bus number manually</span>
          </button>
        </div>

        {showManualEntry && (
          <form id="manual-bus-entry" onSubmit={handleManualSubmit} className="space-y-3 rounded-xl border border-slate-300 p-4 dark:border-slate-600">
            <label htmlFor="manual-bus-number" className="block font-bold">{t.manualBusLabel}</label>
            <input
              id="manual-bus-number"
              ref={manualBusInputRef}
              value={manualBusNumber}
              onChange={(event) => setManualBusNumber(event.target.value)}
              placeholder={t.manualBusPlaceholder}
              autoComplete="off"
              className="min-h-12 w-full rounded-lg border-2 border-slate-400 bg-white px-4 text-base text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 dark:border-slate-500 dark:bg-slate-900 dark:text-white"
            />
            <button type="submit" className="min-h-12 w-full rounded-xl bg-blue-700 px-4 py-3 font-bold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
              {t.continueManual}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
