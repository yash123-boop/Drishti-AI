
import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, RotateCcw, Volume2 } from 'lucide-react';

export default function CameraAssistant() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [message, setMessage] = useState(
    'Press Start Camera to begin.'
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
    setMessage(text);
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        speak('Camera is unavailable. Please use HTTPS or localhost.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraOn(true);
      speak(
        'Camera is ready. Point your phone toward the person or object you want to photograph.'
      );
    } catch {
      speak(
        'Camera access failed. Please allow camera permission in your browser settings.'
      );
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) videoRef.current.srcObject = null;

    setCameraOn(false);
    setBusy(false);
    speak('Camera stopped.');
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth) {
      speak('Camera is not ready yet. Please wait.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      speak('Unable to capture the photo.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const url = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoUrl(url);
    speak('Photo captured. You can now describe this photo or retake it.');
  };

  const downloadPhoto = () => {
    if (!photoUrl) return;

    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `drishti-photo-${Date.now()}.jpg`;
    link.click();

    speak('Photo saved to your downloads.');
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Drishti AI Camera Assistant
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Voice-guided photography for blind and low-vision users.
        </p>
      </header>

      <div
        className="overflow-hidden rounded-2xl bg-slate-950"
        aria-label="Camera preview"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-[4/3] w-full object-contain"
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div
        className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-violet-950 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100"
        role="status"
        aria-live="polite"
      >
        <p className="font-semibold">Voice guidance</p>
        <p className="mt-1">{message}</p>
        <button
          type="button"
          onClick={() => speak(message)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-violet-300 px-4 py-2"
        >
          <Volume2 size={20} aria-hidden="true" />
          Repeat instruction
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {!cameraOn ? (
          <button
            type="button"
            onClick={startCamera}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
          >
            <Camera aria-hidden="true" />
            Start Camera
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white"
          >
            <CameraOff aria-hidden="true" />
            Stop Camera
          </button>
        )}

        <button
          type="button"
          onClick={capturePhoto}
          disabled={!cameraOn}
          className="min-h-14 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white disabled:opacity-40"
        >
          Capture Photo
        </button>
      </div>

      {photoUrl && (
        <section className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <h2 className="text-lg font-bold">Captured Photo</h2>
          <img
            src={photoUrl}
            alt="Your captured photograph"
            className="max-h-96 w-full rounded-xl object-contain"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadPhoto}
              className="min-h-11 rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white"
            >
              Save Photo
            </button>

            <button
              type="button"
              onClick={capturePhoto}
              className="flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 dark:border-slate-600"
            >
              <RotateCcw size={18} aria-hidden="true" />
              Retake Photo
            </button>
          </div>
        </section>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Safety note: Camera guidance is an aid, not a substitute for a
        human guide when navigating unfamiliar or hazardous areas.
      </p>
    </main>
  );
}
