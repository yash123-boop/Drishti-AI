/**
 * Bus Board OCR Engine using Tesseract.js with Camera Stream & File Upload
 */

import { parseBusNumberFromOCR, parseDestinationFromOCR } from './textParser';
import type { OCRResult } from '../../types/transit';

export type OCRProgressCallback = (progress: number, status: string) => void;

class BusOCRManager {
  private mediaStream: MediaStream | null = null;

  public async processImage(
    imageSource: string | HTMLCanvasElement | File,
    onProgress?: OCRProgressCallback,
    source: 'camera' | 'upload' | 'preset' = 'upload'
  ): Promise<OCRResult> {
    try {
      onProgress?.(10, 'Initializing OCR engine...');

      // Dynamic import of Tesseract to avoid blocking initial load
      const Tesseract = await import('tesseract.js');

      onProgress?.(30, 'Reading visual patterns...');

      const result = await Tesseract.recognize(imageSource, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round(30 + m.progress * 60);
            onProgress?.(pct, `Scanning display board: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      onProgress?.(95, 'Parsing candidate bus number...');

      const rawText = result.data.text || '';
      const confidence = Math.round(result.data.confidence || 0);
      const parsed = parseBusNumberFromOCR(rawText, confidence);
      const destination = parseDestinationFromOCR(rawText);

      onProgress?.(100, 'Recognition complete');

      return {
        rawText,
        candidateNumber: parsed.candidateNumber,
        destination,
        confidence: parsed.confidenceScore,
        isReliable: parsed.candidateNumber !== null && parsed.confidenceScore >= 50,
        source,
      };
    } catch (error) {
      console.error('Unable to process bus-board image with OCR:', error);
      throw new Error('Bus-board OCR processing failed. Please try another image or scan again.');
    }
  }

  // Camera Management
  public async startCamera(videoElement: HTMLVideoElement): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera unavailable on this device or browser.');
    }

    try {
      if (this.mediaStream) {
        this.stopCamera();
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.mediaStream;
      await videoElement.play();
      await videoElement.play();
    } catch (error) {
      this.stopCamera();
      throw error;
    }
  }

  public captureFrame(videoElement: HTMLVideoElement): string | null {
    if (!videoElement.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  public stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  // Built-in synthetic test board generator for reliable demoing without external assets
  public createDemoBoardImage(busNumber: string, destinationText: string, isBlurry: boolean = false): string {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Bus destination display board background (dark LED matrix enclosure)
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Frame border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Dot matrix grid pattern simulation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 20; x < canvas.width - 20; x += 10) {
      for (let y = 20; y < canvas.height - 20; y += 10) {
        ctx.fillRect(x, y, 3, 3);
      }
    }

    if (isBlurry) {
      // Blurry noisy image
      ctx.filter = 'blur(14px)';
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 72px monospace';
      ctx.fillText('?? ???', 150, 140);
      return canvas.toDataURL('image/png');
    }

    // High-visibility Amber/Yellow LED Bus Number
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 96px "JetBrains Mono", monospace';
    ctx.fillText(busNumber, 40, 145);

    // Destination Text
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(destinationText.toUpperCase(), 240, 115);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VIA CONCOURSE & EXPRESSWAY', 240, 160);

    return canvas.toDataURL('image/png');
  }
}

export const busOCR = new BusOCRManager();
