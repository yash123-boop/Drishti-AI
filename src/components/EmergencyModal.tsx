import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Volume2,
  VolumeX,
  X,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  Send
} from 'lucide-react';
import { emergencyAssist, DEFAULT_EMERGENCY_CONTACTS, type EmergencyLocation } from '../modules/emergency/emergencyAssist';
import { audioChimes } from '../modules/voice/audioChimes';
import { speechSynth } from '../modules/voice/speechSynthesis';
import type { EmergencyContact } from '../types/transit';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'confirm' | 'active'>('confirm');
  const [contacts, setContacts] = useState<EmergencyContact[]>(DEFAULT_EMERGENCY_CONTACTS);
  const [location, setLocation] = useState<EmergencyLocation | null>(null);
  const [sirenOn, setSirenOn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setSirenOn(false);
      speechSynth.announceEmergency();
      emergencyAssist.getCurrentLocation().then(setLocation);
    } else {
      emergencyAssist.stopSiren();
      setSirenOn(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmSOS = () => {
    setStep('active');
    setSirenOn(true);
    const updated = emergencyAssist.triggerEmergencyBroadcast(contacts);
    setContacts(updated);
  };

  const handleToggleSiren = () => {
    if (sirenOn) {
      emergencyAssist.stopSiren();
      setSirenOn(false);
      speechSynth.speak('Audible siren stopped.');
    } else {
      emergencyAssist.startSiren();
      setSirenOn(true);
      speechSynth.speak('Audible siren resumed.');
    }
  };

  const handleCancel = () => {
    emergencyAssist.cancelEmergency();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-4 border-rose-600 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white">
        {step === 'confirm' ? (
          /* Step 1: Confirmation */
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-10 h-10 animate-bounce" />
              </div>
              <h2 id="emergency-dialog-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Emergency Assistance Confirmation
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to trigger emergency safety assistance? This will sound an audible siren alarm and broadcast your transit coordinates.
              </p>
            </div>

            {/* Explicit Demo Limitation Notice as required by prompt */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Demonstration Safety Feature
              </p>
              <p>
                In this prototype, no real 911 or 112 emergency calls are placed. Alerts are simulated to test accessibility flows safely.
              </p>
            </div>

            {location && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono space-y-1">
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Current GPS Coordinates:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {location.latitude}° N, {location.longitude}° E ({location.nearestStop})
                </p>
              </div>
            )}

            {/* Two Action Buttons: Cancel vs Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleCancel}
                className="min-h-[52px] rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors"
              >
                Cancel (Return Safely)
              </button>

              <button
                onClick={handleConfirmSOS}
                className="min-h-[52px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
              >
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm & Sound SOS</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Emergency Active */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold uppercase tracking-wider inline-block animate-pulse">
                Siren Active • Help Dispatched
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                Emergency Alert Broadcast
              </h2>
              <p className="text-xs text-slate-500">
                Audio alarm is sounding to alert bystanders and nearby transit officials.
              </p>
            </div>

            {/* Siren Toggle */}
            <div className="flex justify-center">
              <button
                onClick={handleToggleSiren}
                className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md transition-all ${
                  sirenOn
                    ? 'bg-rose-600 text-white ring-4 ring-rose-300 dark:ring-rose-900 animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                }`}
              >
                {sirenOn ? (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Mute Siren Alarm</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-5 h-5" />
                    <span>Resume Siren Alarm</span>
                  </>
                )}
              </button>
            </div>

            {/* Emergency Contacts Dispatch Status */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Safety Contacts Alerted
              </span>
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {contact.name}
                      </p>
                      <p className="text-xs text-slate-500">{contact.relationship} • {contact.phone}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Notified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dismiss Button */}
            <div className="pt-2">
              <button
                onClick={handleCancel}
                className="w-full min-h-[50px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
              >
                End Emergency & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
