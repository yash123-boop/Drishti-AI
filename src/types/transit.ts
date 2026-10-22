export interface TransitStop {
  id: string;
  name: string;
  landmark: string;
  distanceMeters: number;
  estimatedMinutes: number;
  hapticCues: string;
  audioNotice: string;
  latitude?: number;
  longitude?: number;
}

export interface RouteTileInfo {
  z: number;
  x: number;
  y: number;
  url: string;
  isCached: boolean;
  stopName?: string;
}

export interface RouteTileCacheState {
  routeId: string;
  routeName: string;
  totalTiles: number;
  cachedTiles: number;
  isCaching: boolean;
  isComplete: boolean;
  lastCachedAt: string | null;
  cacheSizeKb: number;
}

export interface TransitRoute {
  id: string;
  busNumber: string;
  routeName: string;
  origin: string;
  destination: string;
  frequencyMinutes: number;
  busColor: string;
  busType: string;
  stops: TransitStop[];
}

export interface OCRResult {
  rawText: string;
  candidateNumber: string | null;
  confidence: number;
  isReliable: boolean;
  source: 'camera' | 'upload' | 'preset' | 'manual';
}

export interface RouteMatchResult {
  status: 'MATCH' | 'WRONG_BUS' | 'UNRECOGNIZED';
  confirmedBusNumber: string;
  expectedBusNumber: string;
  message: string;
}

export type JourneyStatus = 'IDLE' | 'STARTED' | 'TRANSIT' | 'APPROACHING' | 'ARRIVED' | 'PAUSED';

export interface JourneyState {
  route: TransitRoute | null;
  confirmedBusNumber: string | null;
  currentStopIndex: number;
  currentStop: TransitStop | null;
  nextStop: TransitStop | null;
  status: JourneyStatus;
  isApproaching: boolean;
  hasArrived: boolean;
  autoPlayTimer: number | null;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isNotified: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  textSize: 'normal' | 'large' | 'xlarge';
  speechEnabled: boolean;
  hapticsEnabled: boolean;
  chimesEnabled: boolean;
  autoAnnounce: boolean;
}

export interface TestScenarioResult {
  id: string;
  name: string;
  passed: boolean;
  details: string;
}
