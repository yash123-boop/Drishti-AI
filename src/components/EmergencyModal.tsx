import { useEffect, useRef, useState } from 'react';
import {
  Ambulance,
  Flame,
  HeartPulse,
  LifeBuoy,
  PhoneCall,
  Shield,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { emergencyAssist } from '../modules/emergency/emergencyAssist';
import { EMERGENCY_SERVICES, type EmergencyService, type EmergencyServiceId } from '../modules/emergency/emergencyServices';
import { formatMessage, getMessages } from '../modules/messages';
import { speechSynth } from '../modules/voice/speechSynthesis';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

const serviceIcons: Record<EmergencyServiceId, LucideIcon> = {
  police: Shield,
  ambulance: Ambulance,
  fire: Flame,
  medical: HeartPulse,
  general: LifeBuoy,
};

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, language }) => {
  const t = getMessages(language);
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [alarmOn, setAlarmOn] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) {
      emergencyAssist.stopSiren();
      setAlarmOn(false);
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedService(null);
    setIsConfirmed(false);
    setAlarmOn(false);
    speechSynth.speak(t.emergencyOpened);
    requestAnimationFrame(() => firstActionRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        emergencyAssist.stopSiren();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      emergencyAssist.stopSiren();
      previousFocusRef.current?.focus();
    };
  }, [isOpen, t.emergencyOpened]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => firstActionRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isOpen, selectedService, isConfirmed]);

  if (!isOpen) return null;

  const serviceName = (service: EmergencyService) => t[service.id];
  const serviceDescription = (service: EmergencyService) => t[`${service.id}Description` as
    | 'policeDescription'
    | 'ambulanceDescription'
    | 'fireDescription'
    | 'medicalDescription'
    | 'generalDescription'];

  const handleConfirm = () => {
    if (!selectedService) return;
    setIsConfirmed(true);
    speechSynth.speak(formatMessage(t.sosRecorded, { service: serviceName(selectedService) }));
  };

  const toggleLocalAlarm = () => {
    if (alarmOn) {
      emergencyAssist.stopSiren();
      setAlarmOn(false);
      speechSynth.speak('Local alarm stopped.');
    } else {
      emergencyAssist.startSiren();
      setAlarmOn(true);
      speechSynth.speak('Local alarm started.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-dialog-title"
        aria-describedby="emergency-demo-notice"
        className="max-h-[95vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-3xl border-4 border-rose-600 bg-white p-5 text-slate-950 shadow-2xl dark:bg-slate-900 dark:text-white sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">{t.emergencyTitle}</p>
            <h2 id="emergency-dialog-title" className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {isConfirmed ? serviceName(selectedService!) : t.chooseEmergency}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <p
          id="emergency-demo-notice"
          className="rounded-xl border-2 border-amber-500 bg-amber-50 p-3 text-sm font-medium text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
        >
          {t.demoSosNotice}
        </p>

        {!selectedService ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EMERGENCY_SERVICES.map((service, index) => {
              const Icon = serviceIcons[service.id];
              return (
                <button
                  type="button"
                  key={service.id}
                  ref={index === 0 ? firstActionRef : undefined}
                  onClick={() => {
                    setSelectedService(service);
                    speechSynth.speak(`${serviceName(service)} selected. ${serviceDescription(service)}.`);
                  }}
                  className="flex min-h-24 items-start gap-3 rounded-2xl border-2 border-slate-300 p-4 text-left hover:border-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 dark:border-slate-600 dark:hover:bg-rose-950/30"
                >
                  <Icon size={25} aria-hidden="true" className="mt-1 shrink-0 text-rose-700 dark:text-rose-300" />
                  <span>
                    <span className="block text-lg font-extrabold">{serviceName(service)}</span>
                    <span className="mt-1 block text-sm text-slate-700 dark:text-slate-200">{serviceDescription(service)}</span>
                    <span className="mt-2 block font-mono font-bold">{service.number}</span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : !isConfirmed ? (
          <div className="space-y-4" aria-live="polite">
            <p className="rounded-xl bg-slate-100 p-4 text-lg font-semibold dark:bg-slate-800">
              {formatMessage(t.confirmEmergency, { service: serviceName(selectedService) })}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              {serviceDescription(selectedService)} · <span className="font-mono font-bold">{selectedService.number}</span>
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                ref={firstActionRef}
                onClick={() => {
                  setSelectedService(null);
                  speechSynth.speak(t.chooseEmergency);
                }}
                className="min-h-12 rounded-xl border-2 border-slate-400 px-4 py-3 font-bold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="min-h-12 rounded-xl bg-rose-700 px-4 py-3 font-extrabold text-white hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
              >
                {t.confirmSos}
              </button>
            </div>
          </div>
        ) : selectedService && (
          <div className="space-y-4" role="status" aria-live="assertive">
            <p className="rounded-xl border-2 border-emerald-600 bg-emerald-50 p-4 text-lg font-bold text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100">
              {formatMessage(t.sosRecorded, { service: serviceName(selectedService) })}
            </p>
            <a
              href={`tel:${selectedService.number}`}
              className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-rose-700 px-5 py-4 text-center text-lg font-extrabold text-white hover:bg-rose-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
            >
              <PhoneCall aria-hidden="true" />
              {formatMessage(t.callService, { service: serviceName(selectedService), number: selectedService.number })}
            </a>
            <button
              type="button"
              onClick={toggleLocalAlarm}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-400 px-4 py-3 font-bold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              {alarmOn ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
              {alarmOn ? 'Stop local alarm' : 'Sound local alarm'}
            </button>
            <button
              type="button"
              ref={firstActionRef}
              onClick={() => {
                emergencyAssist.stopSiren();
                setAlarmOn(false);
                setSelectedService(null);
                setIsConfirmed(false);
                speechSynth.speak(t.chooseEmergency);
              }}
              className="min-h-12 w-full rounded-xl border-2 border-slate-400 px-4 py-3 font-bold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              {t.backToServices}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
