/**
 * EVLab 3D Studio - Interactive Transform Gizmo (Move, Rotate, Scale)
 */

import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { useAppStore } from '../../state/useAppStore';
import * as THREE from 'three';

export const GizmoControlsComponent: React.FC<{ selectedMesh: THREE.Object3D | null }> = ({ selectedMesh }) => {
  const { activeTool, updateObject, saveStateToUndo } = useAppStore();
  const transformRef = useRef<any>(null);

  let mode: 'translate' | 'rotate' | 'scale' = 'translate';
  if (activeTool === 'move') mode = 'translate';
  else if (activeTool === 'rotate') mode = 'rotate';
  else if (activeTool === 'scale') mode = 'scale';
  else return null;

  if (!selectedMesh) return null;

  return (
    <TransformControls
      ref={transformRef}
      object={selectedMesh}
      mode={mode}
      space="world"
      size={0.8}
      onMouseDown={() => saveStateToUndo()}
      onObjectChange={() => {
        if (selectedMesh) {
          const id = selectedMesh.userData.id;
          if (id) {
            updateObject(id, {
              position: {
                x: Math.round(selectedMesh.position.x),
                y: Math.round(selectedMesh.position.y),
                z: Math.round(selectedMesh.position.z)
              },
              rotation: {
                x: Number(selectedMesh.rotation.x.toFixed(3)),
                y: Number(selectedMesh.rotation.y.toFixed(3)),
                z: Number(selectedMesh.rotation.z.toFixed(3))
              },
              scale: {
                x: Number(selectedMesh.scale.x.toFixed(3)),
                y: Number(selectedMesh.scale.y.toFixed(3)),
                z: Number(selectedMesh.scale.z.toFixed(3))
              }
            });
          }
        }
      }}
    />
  );
};
