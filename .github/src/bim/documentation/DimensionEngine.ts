/**
 * EVLab BIM Core v1.2 - Associative Dimension Engine
 * Generates linear and aligned dimensions between BIM elements and auto-updates when elements change.
 */

import { BIMAnnotation, BIMElement } from '../core/BIMTypes';

export interface DimensionPoint {
  elementId: string;
  position: { x: number; y: number; z: number };
}

export class DimensionEngine {
  public static createLinearDimension(
    elemA: BIMElement,
    elemB: BIMElement,
    posA: { x: number; y: number; z: number },
    posB: { x: number; y: number; z: number },
    viewId?: string
  ): BIMAnnotation {
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const dz = posB.z - posA.z;
    const distMm = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 1000);

    const midPos = {
      x: (posA.x + posB.x) / 2,
      y: (posA.y + posB.y) / 2 + 0.3,
      z: (posA.z + posB.z) / 2
    };

    return {
      id: `dim_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'LinearDimension',
      targetElementId: elemA.id,
      referencedElementIds: [elemA.id, elemB.id],
      viewId,
      position: midPos,
      value: distMm,
      unit: 'mm',
      text: `${distMm} mm`,
      isAssociated: true
    };
  }

  public static updateDimension(
    dimension: BIMAnnotation,
    posA: { x: number; y: number; z: number },
    posB: { x: number; y: number; z: number }
  ): BIMAnnotation {
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const dz = posB.z - posA.z;
    const distMm = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 1000);

    return {
      ...dimension,
      value: distMm,
      text: `${distMm} mm`,
      position: {
        x: (posA.x + posB.x) / 2,
        y: (posA.y + posB.y) / 2 + 0.3,
        z: (posA.z + posB.z) / 2
      }
    };
  }
}
