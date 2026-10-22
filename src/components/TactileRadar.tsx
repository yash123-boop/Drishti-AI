import React, { useEffect, useState } from 'react';
import { hapticEngine } from '../modules/voice/hapticEngine';
import { Vibrate, Volume2 } from 'lucide-react';

export const TactileRadar: React.FC = () => {
  const [activePattern, setActivePattern] = useState<number[] | null>(null);
  const [description, setDescription] = useState<string>('');
  const [pulseCount, setPulseCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = hapticEngine.subscribe((pattern, desc) => {
      setActivePattern(pattern);
      setDescription(desc);
      setPulseCount((prev) => prev + 1);

      const totalDuration = pattern.reduce((a, b) => a + b, 0);
      const timer = setTimeout(() => {
        setActivePattern(null);
      }, Math.max(totalDuration, 800));

      return () => clearTimeout(timer);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!activePattern) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-500/50 backdrop-blur-md animate-bounce"
    >
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-600">
        <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75" />
        <Vibrate className="w-5 h-5 text-white relative z-10" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-blue-300 uppercase">Haptic Vibration</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-800">
            {activePattern.join('-')}ms
          </span>
        </div>
        <p className="text-sm font-semibold text-white">{description}</p>
      </div>
    </div>
  );
};
