/**
 * EVLab 3D Studio - Demo Scene Seeder
 * Builds a small starter project (a 5m x 5m room: slab, four walls, four
 * corner columns, one door) using the same ElementFactory the viewport's
 * placement tools use, so the opening scene isn't empty and doubles as a
 * live example of every geometry type ObjectMesh renders.
 */

import { createElementFromTool } from '../engine/creation/ElementFactory';
import { SceneObject, Vector3D } from '../types';

const DEFAULT_LAYER_ID = 'layer_default';
const DEFAULT_MATERIAL_ID = 'mat_default';

export function buildDemoScene(): SceneObject[] {
  const objects: SceneObject[] = [];

  const slab = createElementFromTool('slab', { x: 0, y: 0, z: 0 }, 1, DEFAULT_LAYER_ID, DEFAULT_MATERIAL_ID);
  if (slab) objects.push(slab);

  const wallLayout: { position: Vector3D; rotationY: number }[] = [
    { position: { x: 0, y: 0, z: -2500 }, rotationY: 0 },
    { position: { x: 0, y: 0, z: 2500 }, rotationY: 0 },
    { position: { x: -2500, y: 0, z: 0 }, rotationY: 90 },
    { position: { x: 2500, y: 0, z: 0 }, rotationY: 90 },
  ];

  wallLayout.forEach((w, i) => {
    const wall = createElementFromTool('wall', w.position, i + 1, DEFAULT_LAYER_ID, DEFAULT_MATERIAL_ID);
    if (wall) {
      wall.rotation.y = w.rotationY;
      objects.push(wall);
    }
  });

  const columnCorners: Vector3D[] = [
    { x: -2400, y: 0, z: -2400 },
    { x: 2400, y: 0, z: -2400 },
    { x: -2400, y: 0, z: 2400 },
    { x: 2400, y: 0, z: 2400 },
  ];

  columnCorners.forEach((pos, i) => {
    const column = createElementFromTool('column', pos, i + 1, DEFAULT_LAYER_ID, DEFAULT_MATERIAL_ID);
    if (column) objects.push(column);
  });

  const door = createElementFromTool('door', { x: 0, y: 0, z: 2500 }, 1, DEFAULT_LAYER_ID, DEFAULT_MATERIAL_ID);
  if (door) objects.push(door);

  return objects;
}
