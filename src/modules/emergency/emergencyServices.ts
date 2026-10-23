export type EmergencyServiceId = 'police' | 'ambulance' | 'fire' | 'medical' | 'general';

export interface EmergencyService {
  id: EmergencyServiceId;
  number: string;
}

// Central demo configuration. Replace these numbers here if the demo environment changes.
export const EMERGENCY_SERVICES: EmergencyService[] = [
  { id: 'police', number: '112' },
  { id: 'ambulance', number: '108' },
  { id: 'fire', number: '101' },
  { id: 'medical', number: '108' },
  { id: 'general', number: '112' },
];
