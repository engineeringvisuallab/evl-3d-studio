/**
 * EVLab BIM Core v1.4 - Revit 3D & 2D Level Planes / Datum Renderer
 * Renders precision horizontal datum planes, grid axes, and Revit elevation datum heads in Three.js viewport.
 */

import React from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useAppStore } from '../../state/useAppStore';

export const LevelPlanesRenderer: React.FC = () => {
  const { levels, showLevelPlanes, setIsLevelManagerOpen } = useAppStore();

  if (!showLevelPlanes || !levels || levels.length === 0) return null;

  return (
    <group name="BIM_Level_Datums">
      {levels.map((lvl) => {
        const yPos = lvl.elevationMm;
        const elevStr =
          lvl.elevationM >= 0
            ? `+${lvl.elevationM.toFixed(3)} m`
            : `${lvl.elevationM.toFixed(3)} m`;

        return (
          <group key={lvl.id} position={[0, yPos, 0]}>
            {/* Level Datum Plane (Subtle translucent grid line) */}
            <gridHelper
              args={[30000, 10, '#38bdf8', '#1e293b']}
              position={[0, 0, 0]}
              renderOrder={-1}
            />

            {/* Level Datum Line across center */}
            <lineSegments>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([
                      -16000, 0, 0,
                      16000, 0, 0,
                      0, 0, -16000,
                      0, 0, 16000
                    ]),
                    3
                  ]}
                />
              </bufferGeometry>
              <lineDashedMaterial
                color="#38bdf8"
                dashSize={500}
                gapSize={300}
                opacity={0.6}
                transparent
                depthTest={false}
              />
            </lineSegments>

            {/* West Datum Head & Elevation Tag */}
            <Html
              position={[-16000, 0, 0]}
              center
              distanceFactor={18000}
              style={{ pointerEvents: 'auto' }}
            >
              <div
                onClick={() => setIsLevelManagerOpen(true)}
                className="group flex items-center space-x-1.5 cursor-pointer bg-slate-900/90 hover:bg-cyan-950/90 border border-cyan-500/50 hover:border-cyan-400 px-2 py-1 rounded-md shadow-lg backdrop-blur-sm transition-all transform hover:scale-105 select-none"
                title="Click to open Revit Level & Story Manager"
              >
                {/* Revit Datum Circle Symbol */}
                <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-cyan-950 text-cyan-300 font-bold text-[10px] shadow-sm group-hover:bg-cyan-500 group-hover:text-black transition">
                  ⨀
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold font-mono text-cyan-300 group-hover:text-cyan-200 whitespace-nowrap">
                    {lvl.name}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/90 font-semibold">
                    ▽ {elevStr} ({lvl.elevationMm}mm)
                  </span>
                </div>
              </div>
            </Html>

            {/* East Datum Head */}
            <Html
              position={[16000, 0, 0]}
              center
              distanceFactor={18000}
              style={{ pointerEvents: 'auto' }}
            >
              <div
                onClick={() => setIsLevelManagerOpen(true)}
                className="group flex items-center space-x-1.5 cursor-pointer bg-slate-900/90 hover:bg-cyan-950/90 border border-cyan-500/50 hover:border-cyan-400 px-2 py-1 rounded-md shadow-lg backdrop-blur-sm transition-all transform hover:scale-105 select-none"
                title="Click to open Revit Level & Story Manager"
              >
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-bold font-mono text-cyan-300 group-hover:text-cyan-200 whitespace-nowrap">
                    {lvl.name}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400/90 font-semibold">
                    ▽ {elevStr}
                  </span>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-cyan-950 text-cyan-300 font-bold text-[10px] shadow-sm group-hover:bg-cyan-500 group-hover:text-black transition">
                  ⨀
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
