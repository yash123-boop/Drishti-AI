export type CameraGuidanceKind =
  | 'bus'
  | 'bus-stop'
  | 'person'
  | 'road'
  | 'entrance'
  | 'exit'
  | 'signboard'
  | 'obstacle'
  | 'unknown';

export interface CameraGuidanceDemo {
  kind: CameraGuidanceKind;
  label: string;
  confidence: number;
  announcement: string;
}

export const CAMERA_GUIDANCE_DEMOS: CameraGuidanceDemo[] = [
  { kind: 'bus', label: 'Bus', confidence: 94, announcement: 'Bus detected in front of you.' },
  { kind: 'bus-stop', label: 'Bus stop', confidence: 91, announcement: 'Bus stop detected.' },
  { kind: 'person', label: 'Person', confidence: 89, announcement: 'Person detected ahead.' },
  { kind: 'road', label: 'Road', confidence: 86, announcement: 'Road detected ahead.' },
  { kind: 'entrance', label: 'Entrance', confidence: 84, announcement: 'Possible entrance detected.' },
  { kind: 'exit', label: 'Exit', confidence: 83, announcement: 'Possible exit detected.' },
  { kind: 'signboard', label: 'Signboard', confidence: 88, announcement: 'Signboard detected.' },
  { kind: 'obstacle', label: 'Obstacle', confidence: 72, announcement: 'Possible obstacle ahead. Move carefully and verify your surroundings.' },
  { kind: 'unknown', label: 'Unknown object', confidence: 34, announcement: 'Unable to identify the object. Please move the camera.' },
];

export function getCameraGuidanceDemo(kind: CameraGuidanceKind): CameraGuidanceDemo {
  return CAMERA_GUIDANCE_DEMOS.find((demo) => demo.kind === kind) ?? CAMERA_GUIDANCE_DEMOS[CAMERA_GUIDANCE_DEMOS.length - 1];
}
