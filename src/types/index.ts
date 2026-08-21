/**
 * EVLab 3D Studio - Core Data Models and Types
 */

export type UnitType = 'mm' | 'cm' | 'm' | 'in' | 'ft';

export type DisplayMode = 
  | 'wireframe' 
  | 'solid' 
  | 'shaded' 
  | 'material' 
  | 'rendered' 
  | 'xray' 
  | 'hiddenline' 
  | 'monochrome';

export type ViewportMode = '3D' | '2D';

export type EditModeType = 'object' | 'vertex' | 'edge' | 'face';

export type ToolType =
  | 'select'
  | 'line'
  | 'polyline'
  | 'rectangle'
  | 'circle'
  | 'arc'
  | 'polygon'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'pushpull'
  | 'offset'
  | 'followme'
  | 'extrude'
  | 'boolean'
  | 'measure'
  | 'dimension'
  | 'text'
  | 'paint'
  | 'section'
  | 'wall'
  | 'column'
  | 'beam'
  | 'pipe'
  | 'road'
  | 'tank'
  | 'door'
  | 'window'
  | 'slab';

export type ObjectCategory =
  | 'General'
  | 'Architectural'
  | 'Civil'
  | 'Water'
  | 'Structure'
  | 'Mechanical'
  | 'Annotation';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

export interface Scale3D {
  x: number;
  y: number;
  z: number;
}

export interface MaterialDef {
  id: string;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  transparent: boolean;
  wireframe: boolean;
  category: string;
}

export interface LayerTag {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
}

export interface BIMLevel {
  id: string;
  name: string;
  elevationM: number; // In meters
  elevationMm: number; // In millimeters
  isStory: boolean;
}

export interface BimMetadata {
  objectId: string;
  globalId: string;
  name: string;
  category: ObjectCategory;
  family: string;
  typeName: string;
  material: string;
  manufacturer?: string;
  description?: string;
  level: string;
  baseLevelId?: string;
  topLevelId?: string; // Level ID or 'unconnected'
  baseOffset?: number; // in mm
  topOffset?: number; // in mm
  unconnectedHeight?: number; // in mm
  isRoomBounding?: boolean;
  phase: string;
  system?: string;
  costEstimate?: number;
  flowRate?: number; // L/s for pipes
  pressure?: number; // bar/kPa
  loadBearing?: boolean;
  customProperties: Record<string, string | number | boolean>;
}

export interface ParametricData {
  type: 
    | 'cube'
    | 'cylinder'
    | 'sphere'
    | 'wall'
    | 'column'
    | 'beam'
    | 'pipe'
    | 'road'
    | 'tank'
    | 'door'
    | 'window'
    | 'slab'
    | 'footing'
    | 'stairs'
    | 'roof'
    | 'duct'
    | 'custom_extrude';
  width?: number;    // mm or project units
  height?: number;   // mm or project units
  length?: number;   // mm or project units
  thickness?: number;// mm
  diameter?: number; // mm for pipe / cylinder
  radius?: number;   // mm
  lanes?: number;    // for roads
  riserCount?: number; // for stairs
  points?: Vector3D[]; // for custom polylines / extruded paths
}

export interface SceneObject {
  id: string;
  name: string;
  category: ObjectCategory;
  discipline?: 'Architecture' | 'Structure' | 'MEP' | 'Civil';
  position: Vector3D;
  rotation: Rotation3D;
  scale: Scale3D;
  visible: boolean;
  locked: boolean;
  layerId: string;
  materialId: string;
  parentId?: string; // Grouping / hierarchy
  componentId?: string; // For instance sharing
  parametric: ParametricData;
  bim: BimMetadata;
  color?: string;
  // Sub-geometry selection state for Edit mode
  subSelection?: {
    vertices: number[];
    edges: number[];
    faces: number[];
  };
}

export interface DimensionAnnotation {
  id: string;
  startPoint: Vector3D;
  endPoint: Vector3D;
  text?: string;
  type: 'linear' | 'aligned' | 'radius' | 'elevation';
  visible: boolean;
}

export interface GuideLine {
  id: string;
  startPoint: Vector3D;
  endPoint: Vector3D;
  type: 'infinite' | 'segment';
  label?: string;
}

export interface SectionPlaneDef {
  id: string;
  name: string;
  position: Vector3D;
  normal: Vector3D;
  active: boolean;
}

export interface SavedScene {
  id: string;
  name: string;
  cameraPosition: Vector3D;
  targetPosition: Vector3D;
  displayMode: DisplayMode;
  layerVisibilities: Record<string, boolean>;
}

export interface SnapResult {
  snapped: boolean;
  point: Vector3D;
  type: 'endpoint' | 'midpoint' | 'center' | 'intersection' | 'edge' | 'face' | 'grid' | 'axis';
  label: string;
}

export interface CommandHistoryItem {
  id: string;
  actionName: string;
  timestamp: number;
  undo: () => void;
  redo: () => void;
}
