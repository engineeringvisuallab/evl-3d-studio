/**
 * EVLab BIM Core v1.3 - Construction States & 4D Visualization Layer
 * Non-destructive state overlay mapping BIM elements to construction phases and visual statuses.
 */

export type ConstructionState =
  | 'Not Started'
  | 'Planned'
  | 'In Progress'
  | 'Completed'
  | 'Delayed'
  | 'Approved'
  | 'Rejected';

export interface VisualState4D {
  state: ConstructionState;
  colorHex: string;
  opacity: number;
  wireframe: boolean;
  pulseAnimation?: boolean;
}

export const CONSTRUCTION_VISUAL_MAP: Record<ConstructionState, VisualState4D> = {
  'Not Started': {
    state: 'Not Started',
    colorHex: '#334155', // Slate 700
    opacity: 0.15,
    wireframe: true
  },
  'Planned': {
    state: 'Planned',
    colorHex: '#38bdf8', // Cyan 400
    opacity: 0.45,
    wireframe: false
  },
  'In Progress': {
    state: 'In Progress',
    colorHex: '#f59e0b', // Amber 500
    opacity: 0.85,
    wireframe: false,
    pulseAnimation: true
  },
  'Completed': {
    state: 'Completed',
    colorHex: '#10b981', // Emerald 500 (or true physical material)
    opacity: 1.0,
    wireframe: false
  },
  'Delayed': {
    state: 'Delayed',
    colorHex: '#f43f5e', // Rose 500
    opacity: 0.9,
    wireframe: false,
    pulseAnimation: true
  },
  'Approved': {
    state: 'Approved',
    colorHex: '#06b6d4', // Cyan 500
    opacity: 1.0,
    wireframe: false
  },
  'Rejected': {
    state: 'Rejected',
    colorHex: '#ef4444', // Red 500
    opacity: 0.8,
    wireframe: false
  }
};
