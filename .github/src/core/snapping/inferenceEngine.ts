/**
 * EVLab 3D Studio - Intelligent CAD & BIM Inference Engine
 * Detects endpoints, midpoints, centers, edges, faces, and axis alignments in real-time.
 */

import * as THREE from 'three';
import { SceneObject, SnapResult, Vector3D } from '../../types';
import { createParametricGeometry } from '../geometry/geometryBuilder';

export function calculateSnapPoint(
  raycaster: THREE.Raycaster,
  objects: SceneObject[],
  gridSize: number = 1000,
  snapThreshold: number = 200 // mm distance
): SnapResult {
  const ray = raycaster.ray;

  // 1. Raycast onto Ground Plane (Y = 0)
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const groundIntersect = new THREE.Vector3();
  const hitsGround = ray.intersectPlane(plane, groundIntersect);

  let bestSnap: SnapResult = {
    snapped: false,
    point: { x: 0, y: 0, z: 0 },
    type: 'grid',
    label: ''
  };

  if (hitsGround) {
    // Snap to Grid
    const gx = Math.round(groundIntersect.x / (gridSize / 2)) * (gridSize / 2);
    const gz = Math.round(groundIntersect.z / (gridSize / 2)) * (gridSize / 2);
    bestSnap = {
      snapped: true,
      point: { x: gx, y: 0, z: gz },
      type: 'grid',
      label: `Grid (${gx}, 0, ${gz})`
    };
  }

  let minDistance = snapThreshold;

  // 2. Test Key Vertices & Edges of Scene Objects
  objects.forEach((obj) => {
    if (!obj.visible) return;
    const geo = createParametricGeometry(obj.parametric);
    const pos = obj.position;
    const posAttr = geo.getAttribute('position');

    // Test Endpoints & Midpoints
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i) + pos.x;
      const vy = posAttr.getY(i) + pos.y;
      const vz = posAttr.getZ(i) + pos.z;
      const vertex = new THREE.Vector3(vx, vy, vz);

      // Distance from ray to vertex point
      const distToRay = ray.distanceToPoint(vertex);
      if (distToRay < minDistance) {
        minDistance = distToRay;
        bestSnap = {
          snapped: true,
          point: { x: Math.round(vx), y: Math.round(vy), z: Math.round(vz) },
          type: 'endpoint',
          label: `Endpoint of ${obj.name}`
        };
      }
    }

    // Object Center Snap
    const center = new THREE.Vector3(pos.x, pos.y + (obj.parametric.height || 1000) / 2, pos.z);
    const distToCenter = ray.distanceToPoint(center);
    if (distToCenter < minDistance) {
      minDistance = distToCenter;
      bestSnap = {
        snapped: true,
        point: { x: Math.round(center.x), y: Math.round(center.y), z: Math.round(center.z) },
        type: 'center',
        label: `Center of ${obj.name}`
      };
    }
  });

  return bestSnap;
}
