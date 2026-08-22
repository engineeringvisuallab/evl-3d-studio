/**
 * EVLab 3D Studio - Import & Export Engine
 * Generates valid .ev3d, .obj, .stl files for downloading engineering models.
 */

import { SceneObject, MaterialDef, LayerTag } from '../../types';
import { createParametricGeometry } from '../geometry/geometryBuilder';
import * as THREE from 'three';

export function exportEv3dProject(
  projectName: string,
  objects: SceneObject[],
  materials: MaterialDef[],
  layers: LayerTag[]
) {
  const data = {
    version: '1.0.0',
    app: 'EVLab 3D Studio',
    projectName,
    exportedAt: new Date().toISOString(),
    objects,
    materials,
    layers
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}.ev3d`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportObjModel(projectName: string, objects: SceneObject[]) {
  let objOutput = `# EVLab 3D Studio OBJ Export\n# Project: ${projectName}\n\n`;
  let vertexOffset = 1;

  objects.forEach((obj) => {
    if (!obj.visible) return;
    const geo = createParametricGeometry(obj.parametric);
    const pos = obj.position;
    const scale = obj.scale;

    objOutput += `o ${obj.name.replace(/\s+/g, '_')}\n`;

    const posAttr = geo.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i) * scale.x + pos.x;
      const vy = posAttr.getY(i) * scale.y + pos.y;
      const vz = posAttr.getZ(i) * scale.z + pos.z;
      objOutput += `v ${vx.toFixed(4)} ${vy.toFixed(4)} ${vz.toFixed(4)}\n`;
    }

    const index = geo.getIndex();
    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const a = index.getX(i) + vertexOffset;
        const b = index.getX(i + 1) + vertexOffset;
        const c = index.getX(i + 2) + vertexOffset;
        objOutput += `f ${a} ${b} ${c}\n`;
      }
    } else {
      for (let i = 0; i < posAttr.count; i += 3) {
        const a = i + vertexOffset;
        const b = i + 1 + vertexOffset;
        const c = i + 2 + vertexOffset;
        objOutput += `f ${a} ${b} ${c}\n`;
      }
    }

    vertexOffset += posAttr.count;
    objOutput += '\n';
  });

  const blob = new Blob([objOutput], { type: 'model/obj' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}.obj`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportStlModel(projectName: string, objects: SceneObject[]) {
  let stlOutput = `solid ${projectName.replace(/\s+/g, '_')}\n`;

  objects.forEach((obj) => {
    if (!obj.visible) return;
    const geo = createParametricGeometry(obj.parametric);
    const pos = obj.position;
    const scale = obj.scale;
    const posAttr = geo.getAttribute('position');
    const index = geo.getIndex();

    const getVertex = (idx: number): THREE.Vector3 => {
      return new THREE.Vector3(
        posAttr.getX(idx) * scale.x + pos.x,
        posAttr.getY(idx) * scale.y + pos.y,
        posAttr.getZ(idx) * scale.z + pos.z
      );
    };

    const writeTriangle = (v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) => {
      const cb = new THREE.Vector3().subVectors(v3, v2);
      const ab = new THREE.Vector3().subVectors(v1, v2);
      const normal = cb.cross(ab).normalize();

      stlOutput += `  facet normal ${normal.x.toFixed(4)} ${normal.y.toFixed(4)} ${normal.z.toFixed(4)}\n`;
      stlOutput += `    outer loop\n`;
      stlOutput += `      vertex ${v1.x.toFixed(4)} ${v1.y.toFixed(4)} ${v1.z.toFixed(4)}\n`;
      stlOutput += `      vertex ${v2.x.toFixed(4)} ${v2.y.toFixed(4)} ${v2.z.toFixed(4)}\n`;
      stlOutput += `      vertex ${v3.x.toFixed(4)} ${v3.y.toFixed(4)} ${v3.z.toFixed(4)}\n`;
      stlOutput += `    endloop\n`;
      stlOutput += `  endfacet\n`;
    };

    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        writeTriangle(
          getVertex(index.getX(i)),
          getVertex(index.getX(i + 1)),
          getVertex(index.getX(i + 2))
        );
      }
    } else {
      for (let i = 0; i < posAttr.count; i += 3) {
        writeTriangle(getVertex(i), getVertex(i + 1), getVertex(i + 2));
      }
    }
  });

  stlOutput += `endsolid ${projectName.replace(/\s+/g, '_')}\n`;

  const blob = new Blob([stlOutput], { type: 'model/stl' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}.stl`;
  a.click();
  URL.revokeObjectURL(url);
}
