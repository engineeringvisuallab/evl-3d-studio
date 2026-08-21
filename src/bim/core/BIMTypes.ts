/**
 * EVLab BIM Core v1.0 - Core Domain Interfaces & Type Definitions
 * Unifies Element, Category, Family, FamilyType, Instance, Parameters, Relationships, Constraints, Quantities, and OpenBIM IFC Mapping.
 */

export type EngineeringUnit =
  | 'mm'
  | 'cm'
  | 'm'
  | 'in'
  | 'ft'
  | 'mm2'
  | 'm2'
  | 'sqft'
  | 'mm3'
  | 'm3'
  | 'cuft'
  | 'deg'
  | 'rad'
  | 'kg'
  | 'tonne'
  | 'kN'
  | 'N'
  | 'kPa'
  | 'MPa'
  | 'bar'
  | 'L/s'
  | 'm3/h'
  | 'm3/day'
  | 'currency'
  | 'dimensionless';

export type ParameterDataType =
  | 'Text'
  | 'Number'
  | 'Length'
  | 'Area'
  | 'Volume'
  | 'Angle'
  | 'Boolean'
  | 'Integer'
  | 'Material'
  | 'ElementRef'
  | 'LevelRef'
  | 'FamilyRef'
  | 'Formula';

export type ParameterScope = 'Type' | 'Instance';

export interface BIMParameter {
  id: string;
  name: string;
  value: string | number | boolean;
  unit: EngineeringUnit;
  dataType: ParameterDataType;
  scope: ParameterScope;
  isReadOnly?: boolean;
  isComputed?: boolean;
  formula?: string;
  dependencies?: string[]; // Parameter IDs or Element IDs
  description?: string;
  group?: 'Identity' | 'Dimensions' | 'Constraints' | 'Structural' | 'Mechanical' | 'Phasing' | 'Cost' | 'IFC' | 'Custom';
}

export type BIMCategoryType =
  | 'Wall'
  | 'Door'
  | 'Window'
  | 'Floor'
  | 'Roof'
  | 'Stair'
  | 'Column'
  | 'Beam'
  | 'Slab'
  | 'Footing'
  | 'Pipe'
  | 'Duct'
  | 'CableTray'
  | 'Equipment'
  | 'Fitting'
  | 'Road'
  | 'Site'
  | 'Tank'
  | 'Annotation'
  | 'Generic';

export type DisciplineType = 'Architecture' | 'Structure' | 'MEP' | 'Civil';

export type ConstraintType =
  | 'Align'
  | 'Lock'
  | 'Equal'
  | 'Offset'
  | 'Distance'
  | 'Angle'
  | 'Horizontal'
  | 'Vertical'
  | 'Parallel'
  | 'Perpendicular'
  | 'Coincident'
  | 'LevelConstraint'
  | 'GridConstraint'
  | 'HostConstraint';

export interface BIMConstraint {
  id: string;
  type: ConstraintType;
  targetElementId: string;
  referenceId: string; // Element ID, Level ID, Grid ID
  offset?: number;
  isLocked?: boolean;
  value?: number | string;
  description?: string;
  status?: 'Satisfied' | 'Violated' | 'Conflicted';
  conflictReason?: string;
}

export interface BIMConnector {
  id: string;
  ownerElementId: string;
  domain: 'Piping' | 'HVAC' | 'Electrical' | 'Structural';
  type: 'Inlet' | 'Outlet' | 'Bidirectional' | 'Fitting';
  position: { x: number; y: number; z: number };
  direction: { x: number; y: number; z: number };
  sizeMm: number;
  widthMm?: number;
  heightMm?: number;
  systemName?: string;
  connectedToConnectorId?: string;
}

export interface BIMOpening {
  id: string;
  hostElementId: string;
  hostedElementId?: string; // Door, Window, or MEP penetration ID
  type: 'Door' | 'Window' | 'Penetration' | 'Rectangular' | 'Circular' | 'Shaft';
  distanceAlongHostMm: number;
  sillHeightMm: number;
  widthMm: number;
  heightMm: number;
  offsetMm?: number;
}

export type WallJoinType = 'Butt' | 'Miter' | 'L-Join' | 'T-Join' | 'CornerCleanup';

export interface BIMWallJoin {
  id: string;
  wallAId: string;
  wallBId: string;
  joinType: WallJoinType;
  intersectionPoint: { x: number; y: number; z: number };
}

export interface BIMGridLine {
  id: string;
  name: string; // e.g. 'A', 'B', '1', '2'
  axis: 'X' | 'Z';
  positionMm: number;
}

export interface BIMFormula {
  id: string;
  targetParameterId: string;
  expression: string;
  inputVariables: string[];
  unit: EngineeringUnit;
  description?: string;
}

export interface BIMRelationship {
  id: string;
  type: 'Host' | 'HostedBy' | 'ConnectedTo' | 'Supports' | 'SupportedBy' | 'ConnectsLevels' | 'LocatedOnGrid';
  sourceElementId: string;
  targetElementId: string;
  metadata?: Record<string, any>;
}

export interface BIMQuantity {
  lengthM: number;
  surfaceAreaM2: number;
  volumeM3: number;
  weightKg?: number;
  count: number;
  materialTakeoff?: {
    materialId: string;
    materialName: string;
    volumeM3: number;
    surfaceAreaM2: number;
    estimatedCost: number;
  }[];
  costTotal: number;
}

export interface IFCMappingData {
  ifcEntity: string; // e.g. 'IfcWall', 'IfcColumn', 'IfcDoor'
  ifcGuid: string;
  predefinedType?: string;
  exportAs: string;
  propertySets: {
    name: string; // e.g. 'Pset_WallCommon'
    properties: Record<string, string | number | boolean>;
  }[];
}

export interface ClassificationEntry {
  system: 'OmniClass' | 'Uniclass' | 'MasterFormat' | 'EVLab';
  code: string;
  title: string;
}

export interface BIMLevel {
  id: string;
  name: string;
  elevationM: number; // In meters
  elevationMm: number; // In millimeters
  isStory: boolean;
}

export interface BIMPhase {
  id: string;
  name: string;
  sequenceOrder: number;
  description: string;
}

export interface BIMFamilyType {
  id: string;
  familyId: string;
  name: string;
  category: BIMCategoryType;
  discipline: DisciplineType;
  typeParameters: Record<string, BIMParameter>;
  defaultMaterialId: string;
  ifcEntity: string;
  costPerUnit: number;
}

export interface BIMFamily {
  id: string;
  name: string;
  category: BIMCategoryType;
  discipline: DisciplineType;
  types: BIMFamilyType[];
  isSystemFamily: boolean;
  description?: string;
}

export interface BIMElement {
  id: string; // e.g., 'EVL-WALL-000101'
  globalId: string; // OpenBIM GUID
  name: string;
  category: BIMCategoryType;
  discipline: DisciplineType;
  familyId: string;
  typeId: string;
  instanceName: string;

  // Level & Phase
  levelId: string;
  baseLevelId?: string;
  topLevelId?: string;
  baseOffsetMm?: number;
  topOffsetMm?: number;
  phaseId: string;

  // Host & Relationships
  hostId?: string; // e.g. Wall hosting a Door
  relationships: BIMRelationship[];
  constraints: BIMConstraint[];
  openings?: BIMOpening[];
  connectors?: BIMConnector[];
  formulas?: BIMFormula[];

  // Parameters
  instanceParameters: Record<string, BIMParameter>;

  // Material
  materialId: string;

  // Quantities & Calculation Traceability
  quantities: BIMQuantity;
  calculationTrace?: {
    calcId: string;
    formula: string;
    inputs: Record<string, number | string>;
    lastComputedAt: number;
  };

  // OpenBIM & Classification
  ifcMapping: IFCMappingData;
  classifications: ClassificationEntry[];

  // Validation
  validationStatus: 'Valid' | 'Warning' | 'Error';
  validationMessages?: string[];
}

// ----------------------------------------------------
// EVLab BIM Core v1.2 - BIM View Engine & Documentation
// ----------------------------------------------------

export type BIMViewType =
  | '3D View'
  | 'Floor Plan'
  | 'Ceiling Plan'
  | 'Elevation'
  | 'Section'
  | 'Detail'
  | 'Drafting View'
  | 'Sheet View'
  | 'Schedule View';

export type DetailLevel = 'Coarse' | 'Medium' | 'Fine';

export type ViewScale = '1:1' | '1:5' | '1:10' | '1:20' | '1:50' | '1:100' | '1:200' | '1:500';

export interface ViewRangeConfig {
  topOffsetMm: number; // e.g. +2300mm above level
  cutPlaneOffsetMm: number; // e.g. +1200mm above level
  bottomOffsetMm: number; // e.g. 0mm (level datum)
  viewDepthOffsetMm: number; // e.g. -500mm below level
}

export interface ViewFilterRule {
  field: string; // e.g. 'category', 'discipline', 'phase', or parameter key
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface ViewFilter {
  id: string;
  name: string;
  enabled: boolean;
  action: 'Show' | 'Hide' | 'OverrideColor';
  overrideColorHex?: string;
  rules: ViewFilterRule[];
}

export interface BIMView {
  id: string;
  name: string;
  type: BIMViewType;
  levelId?: string; // Associated datum level for plans/elevations
  phaseId?: string;
  discipline: DisciplineType | 'Coordination';
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov?: number;
    orthographic?: boolean;
    zoom?: number;
  };
  cropRegion?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    enabled: boolean;
  };
  visibilityRules: {
    categories: Record<string, boolean>; // e.g. Wall: true, Furniture: false
    disciplines: Record<string, boolean>;
    showAnnotations: boolean;
    showGrids: boolean;
    showLevels: boolean;
    showAnalytical: boolean;
  };
  detailLevel: DetailLevel;
  scale: ViewScale;
  viewRange?: ViewRangeConfig;
  sectionPlane?: {
    axis: 'X' | 'Y' | 'Z';
    direction: 1 | -1;
    positionMm: number;
    depthMm: number;
  };
  viewTemplateId?: string;
}

export interface ViewTemplate {
  id: string;
  name: string;
  discipline: DisciplineType | 'Coordination';
  detailLevel: DetailLevel;
  scale: ViewScale;
  visibilityRules: BIMView['visibilityRules'];
  filters: ViewFilter[];
}

// ----------------------------------------------------
// EVLab BIM Core v1.2 - Annotations & Associative Dimensions
// ----------------------------------------------------

export type AnnotationType =
  | 'LinearDimension'
  | 'AlignedDimension'
  | 'SpotElevation'
  | 'SpotCoordinate'
  | 'RoomTag'
  | 'DoorTag'
  | 'WindowTag'
  | 'WallTag'
  | 'LevelTag'
  | 'GridTag'
  | 'TextNote'
  | 'Keynote';

export interface BIMAnnotation {
  id: string;
  type: AnnotationType;
  targetElementId?: string;
  referencedElementIds?: string[]; // Multiple elements for dimensions
  viewId?: string; // Specific view or global
  position: { x: number; y: number; z: number };
  text: string;
  value?: number;
  unit?: EngineeringUnit;
  isAssociated: boolean; // Auto-updates on target change
}

export interface BIMRoom {
  id: string;
  number: string;
  name: string;
  levelId: string;
  boundaryElementIds: string[]; // IDs of bounding walls/slabs
  areaM2: number;
  perimeterM: number;
  volumeM3: number;
  unboundedHeightMm: number;
  department: string;
  occupancyType: string;
  finishFloor?: string;
  finishWall?: string;
  finishCeiling?: string;
}

// ----------------------------------------------------
// EVLab BIM Core v1.2 - Live Schedules 2.0
// ----------------------------------------------------

export interface BIMScheduleColumn {
  id: string;
  field: string;
  header: string;
  unit?: EngineeringUnit;
  widthPx: number;
  formula?: string; // FormulaEngine expression for calculated fields
  isCalculated?: boolean;
  alignment: 'left' | 'center' | 'right';
  showTotal?: boolean;
}

export interface BIMScheduleDefinition {
  id: string;
  title: string;
  targetCategory: BIMCategoryType | 'All' | 'MaterialTakeoff' | 'Room';
  discipline?: DisciplineType;
  columns: BIMScheduleColumn[];
  filters: {
    field: string;
    operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains';
    value: any;
  }[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  groupByField?: string;
  grandTotal?: boolean;
}

// ----------------------------------------------------
// EVLab BIM Core v1.2 - Sheets & Viewport Documentation
// ----------------------------------------------------

export interface BIMViewport {
  id: string;
  viewId: string;
  title: string;
  positionOnSheetMm: { x: number; y: number }; // X, Y in mm on sheet paper (e.g. 420x297 for A3)
  scale: ViewScale;
  detailNumber: number;
}

export interface BIMSheet {
  id: string;
  sheetNumber: string; // e.g. 'A101', 'S101', 'M101'
  sheetName: string; // e.g. 'Ground Floor Architectural Plan'
  size: 'A0' | 'A1' | 'A2' | 'A3' | 'A4';
  titleBlock: {
    projectName: string;
    projectNumber: string;
    client: string;
    drawnBy: string;
    checkedBy: string;
    approvedBy: string;
    date: string;
    revision: string;
    status: 'Preliminary' | 'For Construction' | 'As-Built' | 'Permit';
  };
  viewports: BIMViewport[];
}

// ----------------------------------------------------
// EVLab BIM Core v1.2 - Advanced MEP Systems
// ----------------------------------------------------

export type MEPSystemClassification =
  | 'Domestic Cold Water'
  | 'Domestic Hot Water'
  | 'Sanitary Drainage'
  | 'HVAC Supply Air'
  | 'HVAC Return Air'
  | 'HVAC Exhaust'
  | 'Fire Protection'
  | 'Electrical Power'
  | 'Data Communications';

export interface MEPSystemDefinition {
  id: string;
  name: string;
  systemType: MEPSystemClassification;
  elementIds: string[];
  flowRateL_s?: number;
  airVolumeM3_h?: number;
  designVelocityM_s?: number;
  headLossKPa?: number;
  fluidTemperatureC?: number;
  colorHex: string;
}

// ----------------------------------------------------
// EVLab BIM Core v1.2 - Structural Analytical Model
// ----------------------------------------------------

export interface AnalyticalNode {
  id: string;
  physicalElementId: string;
  position: { x: number; y: number; z: number };
  supportType?: 'Fixed' | 'Pinned' | 'Roller' | 'Free';
}

export interface AnalyticalMember {
  id: string;
  physicalElementId: string;
  type: 'Column' | 'Beam' | 'Brace';
  startNodeId: string;
  endNodeId: string;
  sectionProfile: string;
  materialId: string;
  axialStiffnessEA_kN?: number;
  bendingStiffnessEI_kNm2?: number;
}

export interface AnalyticalSurface {
  id: string;
  physicalElementId: string;
  type: 'Slab' | 'Wall';
  boundaryNodeIds: string[];
  thicknessMm: number;
  materialId: string;
}

export interface StructuralAnalyticalModel {
  nodes: Map<string, AnalyticalNode>;
  members: Map<string, AnalyticalMember>;
  surfaces: Map<string, AnalyticalSurface>;
  diagnostics: {
    type: 'UnconnectedMember' | 'FloatingNode' | 'MissingSupport' | 'TopologyIssue';
    elementId: string;
    message: string;
  }[];
}

// ----------------------------------------------------
// EVLab BIM Core v1.2 - BCF Coordination & Clash Issues
// ----------------------------------------------------

export type BCFIssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type BCFIssuePriority = 'Low' | 'Normal' | 'High' | 'Critical';

export interface BCFComment {
  id: string;
  author: string;
  date: string;
  comment: string;
}

export interface BCFIssue {
  id: string;
  title: string;
  description: string;
  status: BCFIssueStatus;
  priority: BCFIssuePriority;
  author: string;
  assignedTo: string;
  discipline: DisciplineType | 'Coordination';
  elementIds: string[];
  clashRefId?: string;
  viewpoint?: {
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
  };
  createdAt: string;
  updatedAt: string;
  comments: BCFComment[];
}

