/**
 * EVLab 3D Studio - Inference Visual Overlay
 * Displays CAD/BIM snapping markers (endpoints, midpoints, centers, axis guides).
 */

import React from 'react';
import { Html } from '@react-three/drei';
import { SnapResult } from '../../types';

export const InferenceOverlay: React.FC<{ snap: SnapResult | null }> = ({ snap }) => {
  if (!snap || !snap.snapped) return null;

  const { point, type, label } = snap;

  return (
    <group position={[point.x, point.y, point.z]}>
      {/* Endpoint Indicator (Green Square Dot) */}
      {type === 'endpoint' && (
        <mesh>
          <boxGeometry args={[120, 120, 120]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      )}

      {/* Midpoint Indicator (Cyan Triangle) */}
      {type === 'midpoint' && (
        <mesh>
          <octahedronGeometry args={[100]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
      )}

      {/* Center Indicator (Yellow Sphere Circle) */}
      {type === 'center' && (
        <mesh>
          <sphereGeometry args={[90, 16, 16]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
      )}

      {/* Grid or Edge Snap */}
      {(type === 'grid' || type === 'edge') && (
        <mesh>
          <sphereGeometry args={[60, 12, 12]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
      )}

      {/* Label Tooltip */}
      {label && (
        <Html position={[0, 200, 0]} center distanceFactor={12000}>
          <div className="bg-slate-900/90 text-emerald-400 border border-emerald-500/50 text-[10px] font-mono px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};
