/**
 * EVLab BIM Core v1.1 - Precision Parametric Geometry Regenerator
 * Generates authoritative Three.js BufferGeometries from BIM parameters, voids, openings, stairs, roofs, and framing.
 */

import * as THREE from 'three';
import { BIMOpening } from '../core/BIMTypes';

export class GeometryRegenerator {
  /**
   * Generates Wall geometry with integrated parametric voids / openings for doors & windows
   */
  public static generateWallGeometry(
    length = 5000,
    height = 3000,
    thickness = 250,
    openings: BIMOpening[] = []
  ): THREE.BufferGeometry {
    // If no openings, standard solid wall
    if (!openings || openings.length === 0) {
      const geo = new THREE.BoxGeometry(length, height, thickness);
      geo.translate(0, height / 2, 0);
      return geo;
    }

    // Wall with parametric openings: construct composite geometry segments
    // Sort openings along wall length (X axis from -length/2 to +length/2)
    const validOpenings = openings
      .filter((op) => op.widthMm > 0 && op.heightMm > 0)
      .sort((a, b) => a.distanceAlongHostMm - b.distanceAlongHostMm);

    if (validOpenings.length === 0) {
      const geo = new THREE.BoxGeometry(length, height, thickness);
      geo.translate(0, height / 2, 0);
      return geo;
    }

    const geometries: THREE.BufferGeometry[] = [];
    let currentX = -length / 2;

    validOpenings.forEach((op) => {
      const opCenterX = -length / 2 + op.distanceAlongHostMm;
      const opLeft = Math.max(-length / 2, opCenterX - op.widthMm / 2);
      const opRight = Math.min(length / 2, opCenterX + op.widthMm / 2);

      // 1. Left Wall Segment before this opening
      const leftSegmentWidth = opLeft - currentX;
      if (leftSegmentWidth > 10) {
        const segGeo = new THREE.BoxGeometry(leftSegmentWidth, height, thickness);
        segGeo.translate(currentX + leftSegmentWidth / 2, height / 2, 0);
        geometries.push(segGeo);
      }

      // 2. Sill segment below opening (for windows)
      const sillH = op.sillHeightMm || 0;
      if (sillH > 10) {
        const sillGeo = new THREE.BoxGeometry(opRight - opLeft, sillH, thickness);
        sillGeo.translate(opLeft + (opRight - opLeft) / 2, sillH / 2, 0);
        geometries.push(sillGeo);
      }

      // 3. Lintel segment above opening
      const openingTop = sillH + op.heightMm;
      const lintelH = Math.max(0, height - openingTop);
      if (lintelH > 10) {
        const lintelGeo = new THREE.BoxGeometry(opRight - opLeft, lintelH, thickness);
        lintelGeo.translate(opLeft + (opRight - opLeft) / 2, openingTop + lintelH / 2, 0);
        geometries.push(lintelGeo);
      }

      currentX = opRight;
    });

    // 4. Final Right Wall Segment
    const remainingWidth = length / 2 - currentX;
    if (remainingWidth > 10) {
      const endGeo = new THREE.BoxGeometry(remainingWidth, height, thickness);
      endGeo.translate(currentX + remainingWidth / 2, height / 2, 0);
      geometries.push(endGeo);
    }

    if (geometries.length > 0) {
      return this.mergeGeometries(geometries);
    }

    const fallback = new THREE.BoxGeometry(length, height, thickness);
    fallback.translate(0, height / 2, 0);
    return fallback;
  }

  /**
   * Generates Door geometry (Frame + Inset Panel)
   */
  public static generateDoorGeometry(width = 900, height = 2100, frameDepth = 120): THREE.BufferGeometry {
    const frameT = 50;
    const geometries: THREE.BufferGeometry[] = [];

    // Left Jamb
    const leftJamb = new THREE.BoxGeometry(frameT, height, frameDepth);
    leftJamb.translate(-width / 2 + frameT / 2, height / 2, 0);
    geometries.push(leftJamb);

    // Right Jamb
    const rightJamb = new THREE.BoxGeometry(frameT, height, frameDepth);
    rightJamb.translate(width / 2 - frameT / 2, height / 2, 0);
    geometries.push(rightJamb);

    // Head Frame
    const headFrame = new THREE.BoxGeometry(width, frameT, frameDepth);
    headFrame.translate(0, height - frameT / 2, 0);
    geometries.push(headFrame);

    // Leaf / Panel
    const panelW = width - 2 * frameT;
    const panelH = height - frameT;
    const panelT = 40;
    const panel = new THREE.BoxGeometry(panelW, panelH, panelT);
    panel.translate(0, panelH / 2, 0);
    geometries.push(panel);

    return this.mergeGeometries(geometries);
  }

  /**
   * Generates Window geometry (Frame + Glass Panel)
   */
  public static generateWindowGeometry(width = 1200, height = 1500, frameDepth = 100): THREE.BufferGeometry {
    const frameT = 45;
    const geometries: THREE.BufferGeometry[] = [];

    // Outer Frame
    const left = new THREE.BoxGeometry(frameT, height, frameDepth);
    left.translate(-width / 2 + frameT / 2, height / 2, 0);
    geometries.push(left);

    const right = new THREE.BoxGeometry(frameT, height, frameDepth);
    right.translate(width / 2 - frameT / 2, height / 2, 0);
    geometries.push(right);

    const bottom = new THREE.BoxGeometry(width, frameT, frameDepth);
    bottom.translate(0, frameT / 2, 0);
    geometries.push(bottom);

    const top = new THREE.BoxGeometry(width, frameT, frameDepth);
    top.translate(0, height - frameT / 2, 0);
    geometries.push(top);

    // Glass Panel
    const glassW = width - 2 * frameT;
    const glassH = height - 2 * frameT;
    const glass = new THREE.BoxGeometry(glassW, glassH, 12);
    glass.translate(0, height / 2, 0);
    geometries.push(glass);

    return this.mergeGeometries(geometries);
  }

  /**
   * Generates Monolithic Stair geometry with risers and treads
   */
  public static generateStairGeometry(
    totalHeight = 3500,
    width = 1200,
    riserCount = 18
  ): { geometry: THREE.BufferGeometry; riserHeightMm: number; treadDepthMm: number; isValid: boolean; message?: string } {
    const validRiserCount = Math.max(1, riserCount);
    const riserHeightMm = totalHeight / validRiserCount;
    const treadDepthMm = 280; // Standard 280mm tread
    const totalRunMm = validRiserCount * treadDepthMm;

    // Building Code Check (OSHA / IBC standard riser max 200mm, min 100mm)
    const isValid = riserHeightMm >= 100 && riserHeightMm <= 220;
    const message = isValid ? undefined : `Riser height ${riserHeightMm.toFixed(1)}mm exceeds standard building code (100-220mm).`;

    const geometries: THREE.BufferGeometry[] = [];

    for (let i = 0; i < validRiserCount; i++) {
      const stepH = riserHeightMm;
      const stepL = treadDepthMm;
      const stepGeo = new THREE.BoxGeometry(width, stepH * (i + 1), stepL);
      // Position each step
      const stepY = (stepH * (i + 1)) / 2;
      const stepZ = -totalRunMm / 2 + i * stepL + stepL / 2;
      stepGeo.translate(0, stepY, stepZ);
      geometries.push(stepGeo);
    }

    return {
      geometry: this.mergeGeometries(geometries),
      riserHeightMm: Number(riserHeightMm.toFixed(1)),
      treadDepthMm,
      isValid,
      message
    };
  }

  /**
   * Generates Sloped / Hip / Gable Roof geometry
   */
  public static generateRoofGeometry(
    width = 12000,
    length = 10000,
    slopeDeg = 25,
    thickness = 250,
    overhang = 500
  ): THREE.BufferGeometry {
    const totalW = width + 2 * overhang;
    const totalL = length + 2 * overhang;
    const ridgeH = (Math.min(totalW, totalL) / 2) * Math.tan((slopeDeg * Math.PI) / 180);

    // Create a pyramid/hip roof geometry using Cone or Custom Extrude
    const geo = new THREE.ConeGeometry(Math.max(totalW, totalL) / 1.414, ridgeH, 4);
    geo.rotateY(Math.PI / 4);
    geo.translate(0, ridgeH / 2, 0);
    return geo;
  }

  /**
   * Helper to merge multiple BufferGeometries into a single efficient geometry
   */
  private static mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
    if (geos.length === 1) return geos[0];
    
    // Manual merge using position attributes
    let totalVerts = 0;
    geos.forEach((g) => {
      const nonIndexed = g.index ? g.toNonIndexed() : g;
      totalVerts += nonIndexed.attributes.position.count;
    });

    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    let offset = 0;

    geos.forEach((g) => {
      const nonIndexed = g.index ? g.toNonIndexed() : g;
      const posAttr = nonIndexed.attributes.position;
      const normAttr = nonIndexed.attributes.normal;
      
      for (let i = 0; i < posAttr.count; i++) {
        positions[(offset + i) * 3] = posAttr.getX(i);
        positions[(offset + i) * 3 + 1] = posAttr.getY(i);
        positions[(offset + i) * 3 + 2] = posAttr.getZ(i);

        if (normAttr) {
          normals[(offset + i) * 3] = normAttr.getX(i);
          normals[(offset + i) * 3 + 1] = normAttr.getY(i);
          normals[(offset + i) * 3 + 2] = normAttr.getZ(i);
        } else {
          normals[(offset + i) * 3 + 1] = 1;
        }
      }
      offset += posAttr.count;
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    return merged;
  }
}
