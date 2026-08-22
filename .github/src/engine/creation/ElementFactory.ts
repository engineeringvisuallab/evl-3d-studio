/**
 * EVLab 3D Studio - Element Factory (Creation Engine, part 1)
 * Builds a fully-formed SceneObject (parametric geometry + BIM metadata)
 * for a given discipline ToolType, at a caller-supplied placement point.
 * Used by ThreeCanvas's ground-plane click handler when a creation tool
 * (wall, column, door, ...) is active, and by the demo-scene seeder.
 */

import { BimMetadata, ObjectCategory, ParametricData, SceneObject, ToolType, Vector3D } from '../../types';

let sequence = 0;
function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}_${sequence}`;
}

interface CreationTemplate {
  category: ObjectCategory;
  discipline: SceneObject['discipline'];
  namePrefix: string;
  color: string;
  parametric: ParametricData;
  family: string;
  typeName: string;
  material: string;
  loadBearing?: boolean;
  system?: string;
  flowRate?: number;
}

/** One entry per placeable discipline tool. parametric.type intentionally matches the ToolType key for these categories, which ThreeCanvas relies on to count same-type instances for naming. */
const CREATION_TEMPLATES: Partial<Record<ToolType, CreationTemplate>> = {
  wall: {
    category: 'Architectural',
    discipline: 'Architecture',
    namePrefix: 'Wall',
    color: '#cbd5e1',
    parametric: { type: 'wall', length: 4000, height: 3000, thickness: 200 },
    family: 'Basic Wall',
    typeName: 'Generic - 200mm',
    material: 'Concrete Masonry Unit',
  },
  column: {
    category: 'Structure',
    discipline: 'Structure',
    namePrefix: 'Column',
    color: '#94a3b8',
    parametric: { type: 'column', width: 400, thickness: 400, height: 3500 },
    family: 'Concrete Column',
    typeName: '400 x 400mm',
    material: 'Cast-in-Place Concrete',
    loadBearing: true,
  },
  beam: {
    category: 'Structure',
    discipline: 'Structure',
    namePrefix: 'Beam',
    color: '#94a3b8',
    parametric: { type: 'beam', length: 4000, width: 300, height: 500 },
    family: 'Concrete Beam',
    typeName: '300 x 500mm',
    material: 'Cast-in-Place Concrete',
    loadBearing: true,
  },
  slab: {
    category: 'Structure',
    discipline: 'Structure',
    namePrefix: 'Floor',
    color: '#a8a29e',
    parametric: { type: 'slab', length: 5000, width: 5000, thickness: 200 },
    family: 'Floor',
    typeName: 'Generic - 200mm',
    material: 'Cast-in-Place Concrete',
  },
  door: {
    category: 'Architectural',
    discipline: 'Architecture',
    namePrefix: 'Door',
    color: '#8b5e3c',
    parametric: { type: 'door', width: 900, height: 2100, thickness: 45 },
    family: 'Single-Flush',
    typeName: '900 x 2100mm',
    material: 'Painted Wood',
  },
  window: {
    category: 'Architectural',
    discipline: 'Architecture',
    namePrefix: 'Window',
    color: '#7dd3fc',
    parametric: { type: 'window', width: 1200, height: 1500, thickness: 60 },
    family: 'Fixed',
    typeName: '1200 x 1500mm',
    material: 'Aluminum + Glass',
  },
  pipe: {
    category: 'Mechanical',
    discipline: 'MEP',
    namePrefix: 'Pipe',
    color: '#38bdf8',
    parametric: { type: 'pipe', length: 3000, diameter: 150 },
    family: 'Pipe Types',
    typeName: 'PVC - 150mm',
    material: 'PVC',
    system: 'Domestic Cold Water',
    flowRate: 2.5,
  },
  road: {
    category: 'Civil',
    discipline: 'Civil',
    namePrefix: 'Road',
    color: '#475569',
    parametric: { type: 'road', length: 10000, width: 6000, lanes: 2 },
    family: 'Road Corridor',
    typeName: 'Two-Lane Carriageway',
    material: 'Asphalt',
  },
  tank: {
    category: 'Water',
    discipline: 'Civil',
    namePrefix: 'Tank',
    color: '#0ea5e9',
    parametric: { type: 'tank', diameter: 2000, height: 3000 },
    family: 'Storage Tank',
    typeName: '2000mm dia. x 3000mm',
    material: 'HDPE',
  },
};

/** True for any ToolType that places a new BIM element (as opposed to select/modify/sketch tools). */
export function isCreationTool(tool: ToolType): boolean {
  return tool in CREATION_TEMPLATES;
}

/** wall/road/pipe are drawn as a run between two points rather than dropped at a single point. */
export function isLineBasedTool(tool: ToolType): boolean {
  return tool === 'wall' || tool === 'road' || tool === 'pipe';
}

export function listCreatableTools(): ToolType[] {
  return Object.keys(CREATION_TEMPLATES) as ToolType[];
}

/**
 * Builds a new SceneObject for the given creation tool, placed at
 * `position` (project units, mm, ground level y=0 by default).
 * `instanceIndex` becomes the trailing number in the display name
 * ("Wall 1", "Wall 2", ...) - pass count-of-same-type-in-scene + 1.
 * Returns null for tools with no creation template (e.g. 'select').
 */
export function createElementFromTool(
  tool: ToolType,
  position: Vector3D,
  instanceIndex: number,
  layerId: string,
  materialId: string,
  levelName: string = 'Level 01 Ground Floor'
): SceneObject | null {
  const template = CREATION_TEMPLATES[tool];
  if (!template) return null;

  const id = nextId(tool);
  const name = `${template.namePrefix} ${instanceIndex}`;

  const bim: BimMetadata = {
    objectId: id,
    globalId: nextId('GID'),
    name,
    category: template.category,
    family: template.family,
    typeName: template.typeName,
    material: template.material,
    level: levelName,
    phase: 'New Construction',
    loadBearing: template.loadBearing,
    system: template.system,
    flowRate: template.flowRate,
    customProperties: {},
  };

  return {
    id,
    name,
    category: template.category,
    discipline: template.discipline,
    position,
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    visible: true,
    locked: false,
    layerId,
    materialId,
    parametric: { ...template.parametric },
    bim,
    color: template.color,
  };
}

/**
 * Builds a line-based element (wall/road/pipe) spanning `start` to `end`
 * (mm, ground plane). Position becomes the midpoint, length the on-plan
 * distance, and rotation.y the run's heading - matching the convention
 * SnapEngine.getLineEndpoints expects when it re-derives endpoints for
 * chaining/snapping later runs onto this one.
 */
export function createLineElementFromTool(
  tool: ToolType,
  start: Vector3D,
  end: Vector3D,
  instanceIndex: number,
  layerId: string,
  materialId: string,
  levelName: string = 'Level 01 Ground Floor'
): SceneObject | null {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.max(Math.hypot(dx, dz), 50); // floor so a stray double-click can't create a zero-length element
  const headingDeg = (Math.atan2(-dz, dx) * 180) / Math.PI;

  const midpoint: Vector3D = { x: (start.x + end.x) / 2, y: 0, z: (start.z + end.z) / 2 };

  const base = createElementFromTool(tool, midpoint, instanceIndex, layerId, materialId, levelName);
  if (!base) return null;

  base.parametric = { ...base.parametric, length };
  base.rotation = { x: 0, y: headingDeg, z: 0 };
  return base;
}
