/**
 * EVLab 3D Studio - Parametric Geometry Builder
 * Constructs precision engineering Three.js geometries from parametric data schemas.
 */

import * as THREE from 'three';
import { ParametricData } from '../../types';
import { GeometryRegenerator } from '../../bim/parametric/GeometryRegenerator';

export function createParametricGeometry(param: ParametricData, openings: any[] = []): THREE.BufferGeometry {
  switch (param.type) {
    case 'wall': {
      const length = param.length || 5000;
      const height = param.height || 3000;
      const thickness = param.thickness || param.width || 250;
      return GeometryRegenerator.generateWallGeometry(length, height, thickness, openings);
    }

    case 'door': {
      const w = param.width || 900;
      const h = param.height || 2100;
      const t = param.thickness || 120;
      return GeometryRegenerator.generateDoorGeometry(w, h, t);
    }

    case 'window': {
      const w = param.width || 1200;
      const h = param.height || 1500;
      const t = param.thickness || 100;
      return GeometryRegenerator.generateWindowGeometry(w, h, t);
    }

    case 'stairs': {
      const h = param.height || 3500;
      const w = param.width || 1200;
      const riserCount = param.riserCount || 18;
      const res = GeometryRegenerator.generateStairGeometry(h, w, riserCount);
      return res.geometry;
    }

    case 'roof': {
      const w = param.width || 12000;
      const l = param.length || 10000;
      const t = param.thickness || 250;
      return GeometryRegenerator.generateRoofGeometry(w, l, 25, t, 500);
    }

    case 'footing': {
      const w = param.width || 1500;
      const l = param.length || 1500;
      const h = param.height || param.thickness || 500;
      const geo = new THREE.BoxGeometry(w, h, l);
      geo.translate(0, h / 2, 0);
      return geo;
    }

    case 'duct': {
      const w = param.width || 600;
      const h = param.height || 400;
      const l = param.length || 4000;
      const geo = new THREE.BoxGeometry(l, h, w);
      geo.translate(0, h / 2, 0);
      return geo;
    }

    case 'column': {
      const w = param.width || 400;
      const h = param.height || 3000;
      const l = param.length || 400;
      const geo = new THREE.BoxGeometry(w, h, l);
      geo.translate(0, h / 2, 0);
      return geo;
    }

    case 'beam': {
      const w = param.width || 300;
      const h = param.height || 500;
      const l = param.length || 6000;
      const geo = new THREE.BoxGeometry(l, h, w);
      geo.translate(0, h / 2, 0);
      return geo;
    }

    case 'pipe': {
      const d = param.diameter || 200;
      const radius = d / 2;
      const length = param.length || 6000;
      const geo = new THREE.CylinderGeometry(radius, radius, length, 32);
      geo.rotateX(Math.PI / 2);
      return geo;
    }

    case 'road': {
      const length = param.length || 10000;
      const width = param.width || 7000;
      const thickness = param.thickness || 150;
      const geo = new THREE.BoxGeometry(length, thickness, width);
      geo.translate(0, thickness / 2, 0);
      return geo;
    }

    case 'tank': {
      const d = param.diameter || 4000;
      const radius = d / 2;
      const h = param.height || 2500;
      const outerGeo = new THREE.CylinderGeometry(radius, radius, h, 32, 1, true);
      outerGeo.translate(0, h / 2, 0);
      return outerGeo;
    }

    case 'slab': {
      const w = param.width || 10000;
      const l = param.length || 10000;
      const h = param.thickness || param.height || 300;
      const geo = new THREE.BoxGeometry(w, h, l);
      geo.translate(0, h / 2, 0);
      return geo;
    }

    case 'cube': {
      const w = param.width || 1000;
      const h = param.height || 1000;
      const l = param.length || 1000;
      const geo = new THREE.BoxGeometry(w, h, l);
      geo.translate(0, h / 2, 0);
      return geo;
    }

    case 'cylinder': {
      const r = param.radius || param.width ? param.width! / 2 : 500;
      const h = param.height || 1000;
      const geo = new THREE.CylinderGeometry(r, r, h, 32);
      geo.translate(0, h / 2, 0);
      return geo;
    }

    case 'sphere': {
      const r = param.radius || param.width ? param.width! / 2 : 500;
      return new THREE.SphereGeometry(r, 32, 32);
    }

    case 'custom_extrude': {
      if (param.points && param.points.length >= 3) {
        const shape = new THREE.Shape();
        const pts = param.points;
        shape.moveTo(pts[0].x, pts[0].z);
        for (let i = 1; i < pts.length; i++) {
          shape.lineTo(pts[i].x, pts[i].z);
        }
        shape.closePath();

        const extrudeSettings = {
          steps: 1,
          depth: param.height || 1000,
          bevelEnabled: false
        };
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.rotateX(-Math.PI / 2);
        return geo;
      }
      return new THREE.BoxGeometry(1000, 1000, 1000);
    }

    default:
      return new THREE.BoxGeometry(1000, 1000, 1000);
  }
}

/**
 * Helper to calculate volume (m3) and area (m2) of parametric engineering objects
 */
export function calculateObjectMetrics(param: ParametricData, scale = { x: 1, y: 1, z: 1 }): {
  volumeM3: number;
  surfaceAreaM2: number;
  lengthM: number;
} {
  let vol = 0;
  let area = 0;
  let len = 0;

  const w = ((param.width || 1000) * scale.x) / 1000; // Convert mm to meters
  const h = ((param.height || 1000) * scale.y) / 1000;
  const l = ((param.length || 1000) * scale.z) / 1000;
  const d = ((param.diameter || 200) * Math.max(scale.x, scale.z)) / 1000;
  const t = ((param.thickness || 200) * scale.y) / 1000;

  switch (param.type) {
    case 'wall':
      vol = l * h * (t || w);
      area = 2 * (l * h + l * (t || w) + h * (t || w));
      len = l;
      break;
    case 'door':
    case 'window':
      vol = w * h * (t || 0.1);
      area = w * h;
      len = w;
      break;
    case 'stairs':
      vol = w * (h / 2) * (l || 5);
      area = w * (l || 5);
      len = l || 5;
      break;
    case 'roof':
      vol = w * l * (t || 0.25);
      area = w * l * 1.15; // pitch slope factor
      len = l;
      break;
    case 'footing':
      vol = w * h * l;
      area = 2 * (w * h + w * l + h * l);
      len = w;
      break;
    case 'duct':
      vol = w * h * l;
      area = 2 * (w * l + h * l);
      len = l;
      break;
    case 'column':
    case 'beam':
    case 'cube':
    case 'slab':
      vol = w * h * l;
      area = 2 * (w * h + w * l + h * l);
      len = l || h;
      break;
    case 'pipe':
      len = l;
      vol = Math.PI * Math.pow(d / 2, 2) * l;
      area = Math.PI * d * l;
      break;
    case 'tank':
      vol = Math.PI * Math.pow(d / 2, 2) * h;
      area = Math.PI * d * h;
      len = d;
      break;
    case 'road':
      vol = w * t * l;
      area = w * l;
      len = l;
      break;
    default:
      vol = w * h * l;
      area = 2 * (w * h + w * l + h * l);
      len = l;
  }

  return {
    volumeM3: Number(vol.toFixed(2)),
    surfaceAreaM2: Number(area.toFixed(2)),
    lengthM: Number(len.toFixed(2))
  };
}
