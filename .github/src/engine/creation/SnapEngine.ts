/**
 * EVLab 3D Studio - Snap Engine (Creation Engine, part 2)
 * Computes where a raw click/hover point (mm, ground plane) should actually
 * land: onto an existing wall/road/pipe endpoint if one is close enough
 * (so runs connect end-to-end when chain-drawing), otherwise onto the
 * nearest grid intersection.
 */

import { SceneObject, Vector3D } from '../../types';

const LINE_BASED_TYPES = new Set(['wall', 'road', 'pipe']);

export interface SnapResult {
  point: Vector3D;
  type: 'grid' | 'endpoint';
  sourceObjectId?: string;
}

/**
 * World-space start/end points (mm) of a line-based SceneObject, re-derived
 * from its center position + Y-rotation + length. Mirrors the convention
 * ElementFactory.createLineElementFromTool uses when it builds these
 * objects, so a new run's start point can snap exactly onto this one's end.
 */
export function getLineEndpoints(obj: SceneObject): [Vector3D, Vector3D] | null {
  if (!LINE_BASED_TYPES.has(obj.parametric.type)) return null;
  const length = obj.parametric.length ?? 1000;
  const rad = (obj.rotation.y * Math.PI) / 180;
  const dx = Math.cos(rad) * (length / 2);
  const dz = -Math.sin(rad) * (length / 2);
  return [
    { x: obj.position.x - dx, y: obj.position.y, z: obj.position.z - dz },
    { x: obj.position.x + dx, y: obj.position.y, z: obj.position.z + dz },
  ];
}

function planDistance(a: Vector3D, b: Vector3D): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

/**
 * Snaps a raw world point (mm) to the nearest existing line-based element's
 * endpoint within `endpointToleranceMm`; otherwise rounds to the nearest
 * `gridSizeMm` grid intersection.
 */
export function snapPoint(
  raw: Vector3D,
  objects: SceneObject[],
  gridSizeMm = 250,
  endpointToleranceMm = 300
): SnapResult {
  let best: SnapResult | null = null;
  let bestDist = endpointToleranceMm;

  for (const obj of objects) {
    const endpoints = getLineEndpoints(obj);
    if (!endpoints) continue;
    for (const ep of endpoints) {
      const d = planDistance(raw, ep);
      if (d < bestDist) {
        bestDist = d;
        best = { point: ep, type: 'endpoint', sourceObjectId: obj.id };
      }
    }
  }

  if (best) return best;

  return {
    point: {
      x: Math.round(raw.x / gridSizeMm) * gridSizeMm,
      y: raw.y,
      z: Math.round(raw.z / gridSizeMm) * gridSizeMm,
    },
    type: 'grid',
  };
}
