import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Edit3,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Volume2,
  Eye,
  FileImage
} from 'lucide-react';
import { busOCR } from '../modules/ocr/busOCR';
import { speechSynth } from '../modules/voice/speechSynthesis';
import { audioChimes } from '../modules/voice/audioChimes';
import { hapticEngine } from '../modules/voice/hapticEngine';
import type { TransitRoute, OCRResult } from '../types/transit';

interface BusScannerScreenProps {
  selectedRoute: TransitRoute;
  onOCRComplete: (result: OCRResult) => void;
  onManualEntry: () => void;
  onBack: () => void;
}

export const BusScannerScreen: React.FC<BusScannerScreenProps> = ({
  selectedRoute,
  onOCRComplete,
  onManualEntry,
  onBack,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      busOCR.stopCamera();
    };
  }, []);

  const handleStartCamera = async () => {
    audioChimes.play('tap');
    hapticEngine.tap();
    setCameraError(null);

    if (videoRef.current) {
      const ok = await busOCR.startCamera(videoRef.current);
      if (ok) {
        setCameraActive(true);
        speechSynth.speak('Camera active. Align the front bus display board within the frame.');
      } else {
        setCameraActive(false);
        setCameraError('Camera access unavailable or permission denied. Please upload an image or enter the number manually.');
        speechSynth.speak('Camera access was not granted. You can use image upload or manual number entry.');
      }
    }
  };

  const handleCaptureFromCamera = async () => {
    if (!videoRef.current) return;
    audioChimes.play('tap');
    hapticEngine.tap();

    const frameData = busOCR.captureFrame(videoRef.current);
    if (!frameData) return;

    setPreviewImage(frameData);
    busOCR.stopCamera();
    setCameraActive(false);

    await processImageSource(frameData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audioChimes.play('tap');
    hapticEngine.tap();

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target?.result as string;
      setPreviewImage(dataUrl);
      await processImageSource(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDemoPreset = async (presetType: '101' | '204' | 'blurry') => {
    audioChimes.play('tap');
    hapticEngine.tap();

    let dataUrl = '';
    if (presetType === '101') {
      dataUrl = busOCR.createDemoBoardImage('101', 'Hazratganj');
    } else if (presetType === '204') {
      dataUrl = busOCR.createDemoBoardImage('204', 'Gomti Nagar');
    } else {
      dataUrl = busOCR.createDemoBoardImage('???', 'Unreadable', true);
    }

    setPreviewImage(dataUrl);
    await processImageSource(dataUrl);
  };

  const processImageSource = async (source: string | File) => {
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStatus('Initializing OCR...');

    const result = await busOCR.processImage(source, (pct, status) => {
      setProgressPercent(pct);
      setProgressStatus(status);
    });

    setIsProcessing(false);
    onOCRComplete(result);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
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

      <div className="card-surface p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Scan Approaching Bus Board
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Point your camera at the front LED board, upload a photo, or test with sample bus boards below.
          </p>
        </div>

        {/* Video / Preview Frame */}
        <div className="relative aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden border-2 border-slate-700 flex items-center justify-center shadow-inner">
          <video
            ref={videoRef}
            playsInline
            muted
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
              <p className="text-sm font-medium">Camera preview will appear here</p>
            </div>
          )}

          {/* OCR Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white space-y-4">
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
                <p className="text-xs text-slate-300 text-center font-mono">{progressStatus}</p>
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

        {/* Primary Camera & Upload Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cameraActive ? (
            <button
              onClick={handleCaptureFromCamera}
              disabled={isProcessing}
              className="min-h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>Capture & Analyze Board</span>
            </button>
          ) : (
            <button
              onClick={handleStartCamera}
              disabled={isProcessing}
              className="min-h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>Open Device Camera</span>
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
            onClick={onManualEntry}
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 p-2 rounded-lg"
          >
            <Edit3 className="w-4 h-4" />
            <span>Having trouble scanning? Enter bus number manually</span>
          </button>
        </div>
      </div>
    </div>
  );
};
