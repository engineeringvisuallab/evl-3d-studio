/**
 * EVLab 3D Studio - Scene Renderer
 * Renders objects, materials, dimensions, selection highlights, and handles click/hover interactions.
 */

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useAppStore } from '../../state/useAppStore';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { createParametricGeometry } from '../../core/geometry/geometryBuilder';
import { SceneObject, MaterialDef } from '../../types';

export const SceneRenderer: React.FC<{
  onSelectMesh: (mesh: THREE.Object3D | null) => void;
}> = ({ onSelectMesh }) => {
  const {
    objects,
    materials,
    layers,
    selectedObjectIds,
    displayMode,
    selectObject,
    activeTool,
    addObject,
    addDimension,
    setCursorCoords,
    showLabels
  } = useAppStore();

  const {
    activeDisplayMode,
    analyticalModel,
    rooms,
    annotationEngine,
    timelineEngine,
    currentTimelineDate,
    activeBIMTab
  } = useBIMStore();

  const annotations = annotationEngine.getAnnotations();
  const analyticalNodes = Array.from(analyticalModel.nodes.values());
  const analyticalMembers = Array.from(analyticalModel.members.values());

  const activeLayerMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    layers.forEach((l) => {
      map[l.id] = l.visible;
    });
    return map;
  }, [layers]);

  const materialMap = useMemo(() => {
    const map: Record<string, MaterialDef> = {};
    materials.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [materials]);

  // Handle Mesh Click
  const handleMeshClick = (e: any, obj: SceneObject) => {
    e.stopPropagation();

    if (activeTool === 'select' || activeTool === 'move' || activeTool === 'rotate' || activeTool === 'scale') {
      selectObject(obj.id, e.shiftKey || e.ctrlKey);
      if (e.object) {
        onSelectMesh(e.object);
      }
    } else if (activeTool === 'pushpull') {
      // SketchUp-style Push/Pull: Interactively expand object height
      const currentHeight = obj.parametric.height || 1000;
      useAppStore.getState().updateObjectParametric(obj.id, { height: currentHeight + 1000 });
    }
  };

  const showPhysical = activeDisplayMode === 'Physical' || activeDisplayMode === 'Overlay';
  const showAnalytical = activeDisplayMode === 'Analytical' || activeDisplayMode === 'Overlay';

  return (
    <group>
      {/* 1. Physical 3D BIM Elements */}
      {showPhysical &&
        objects.map((obj) => {
          if (!obj.visible || activeLayerMap[obj.layerId] === false) return null;

          const isSelected = selectedObjectIds.includes(obj.id);
          const matDef = materialMap[obj.materialId] || materials[0];

          // 4D Construction Visual State Evaluation
          const is4DMode = activeBIMTab === '4d_time';
          const constructionState = is4DMode ? timelineEngine.getElementState(obj.id, currentTimelineDate) : 'Completed';

          // Construct parametric Three geometry
          const geometry = createParametricGeometry(obj.parametric);

          // Determine Material Visual Properties based on displayMode & 4D State
          let isWireframe = displayMode === 'wireframe';
          let isXray = displayMode === 'xray' || activeDisplayMode === 'Overlay';
          let matColor = isSelected ? '#3b82f6' : matDef.color;
          let opacity = isXray ? 0.4 : matDef.opacity;
          let transparent = isXray || matDef.transparent;

          if (is4DMode) {
            if (constructionState === 'Planned' || constructionState === 'Not Started') {
              matColor = '#0284c7'; // Blueprint cyan
              opacity = 0.25;
              transparent = true;
              isWireframe = true;
            } else if (constructionState === 'In Progress') {
              matColor = '#f59e0b'; // Construction amber
              opacity = 0.85;
              transparent = false;
            } else if (constructionState === 'Completed') {
              matColor = matDef.color;
              opacity = matDef.opacity;
              transparent = matDef.transparent;
            }
          }

          if (displayMode === 'monochrome') {
            matColor = '#e2e8f0';
          }

          return (
            <group
              key={obj.id}
              position={[obj.position.x, obj.position.y, obj.position.z]}
              rotation={[obj.rotation.x, obj.rotation.y, obj.rotation.z]}
              scale={[obj.scale.x, obj.scale.y, obj.scale.z]}
            >
              <mesh
                userData={{ id: obj.id, name: obj.name, constructionState }}
                geometry={geometry}
                onClick={(e) => handleMeshClick(e, obj)}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'default';
                }}
              >
                {isWireframe ? (
                  <meshBasicMaterial color={matColor} wireframe={true} />
                ) : displayMode === 'rendered' ? (
                  <meshStandardMaterial
                    color={matColor}
                    metalness={matDef.metalness}
                    roughness={matDef.roughness}
                    opacity={opacity}
                    transparent={transparent}
                  />
                ) : (
                  <meshLambertMaterial
                    color={matColor}
                    opacity={opacity}
                    transparent={transparent}
                  />
                )}
              </mesh>

              {/* Selection Bounding Wireframe Outline */}
              {isSelected && (
                <lineSegments>
                  <edgesGeometry attach="geometry" args={[geometry]} />
                  <lineBasicMaterial attach="material" color="#00f0ff" linewidth={2} />
                </lineSegments>
              )}

              {/* Engineering Object Label Tag (Toggled via showLabels / Selected) */}
              {(showLabels || isSelected) && (
                <Html position={[0, (obj.parametric.height || 1000) + 200, 0]} center distanceFactor={15000} style={{ pointerEvents: 'none' }}>
                  <div
                    className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-md transition-all select-none ${
                      isSelected
                        ? 'bg-cyan-500 text-black font-bold ring-2 ring-cyan-300'
                        : is4DMode && constructionState === 'In Progress'
                        ? 'bg-amber-500 text-black font-bold ring-1 ring-amber-300 animate-pulse'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-sm'
                    }`}
                  >
                    {obj.name} [{is4DMode ? constructionState : obj.bim.objectId}]
                  </div>
                </Html>
              )}
            </group>
          );
        })}

      {/* 2. Structural Analytical 1D Centerline Wireframes & Nodes */}
      {showAnalytical && (
        <group>
          {analyticalMembers.map((m) => {
            const startNode = analyticalModel.nodes.get(m.startNodeId);
            const endNode = analyticalModel.nodes.get(m.endNodeId);
            if (!startNode || !endNode) return null;

            const p1 = new THREE.Vector3(startNode.position.x * 1000, startNode.position.y * 1000, startNode.position.z * 1000);
            const p2 = new THREE.Vector3(endNode.position.x * 1000, endNode.position.y * 1000, endNode.position.z * 1000);
            const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);

            return (
              <primitive
                key={m.id}
                object={new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: m.type === 'Column' ? 0x06b6d4 : 0xf59e0b, linewidth: 3 }))}
              />
            );
          })}

          {analyticalNodes.map((n) => (
            <mesh key={n.id} position={[n.position.x * 1000, n.position.y * 1000, n.position.z * 1000]}>
              <sphereGeometry args={[150, 16, 16]} />
              <meshBasicMaterial color={n.supportType === 'Fixed' ? '#10b981' : '#38bdf8'} />
            </mesh>
          ))}
        </group>
      )}

      {/* 3. Architectural Room Tags */}
      {rooms.map((rm, idx) => (
        <Html
          key={rm.id}
          position={[idx === 0 ? 0 : 3000, 1200, idx === 0 ? 0 : 3000]}
          center
          distanceFactor={18000}
        >
          <div className="bg-slate-950/90 text-cyan-300 border border-cyan-500/60 px-2.5 py-1.5 rounded shadow-lg text-center font-mono">
            <div className="font-bold text-xs text-white">{rm.number} - {rm.name}</div>
            <div className="text-[10px] text-cyan-400">Area: {rm.areaM2} m² | Vol: {rm.volumeM3} m³</div>
          </div>
        </Html>
      ))}

      {/* 4. Render Dimensions Lines */}
      {useAppStore.getState().dimensions.map((dim) => {
        if (!dim.visible) return null;
        const p1 = new THREE.Vector3(dim.startPoint.x, dim.startPoint.y, dim.startPoint.z);
        const p2 = new THREE.Vector3(dim.endPoint.x, dim.endPoint.y, dim.endPoint.z);
        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        const distMm = p1.distanceTo(p2);

        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);

        return (
          <group key={dim.id}>
            <primitive object={new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xeab308, linewidth: 2 }))} />
            <Html position={[mid.x, mid.y + 100, mid.z]} center distanceFactor={12000}>
              <div className="bg-yellow-500 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shadow">
                ↔ {dim.text || `${Math.round(distMm)} mm`}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
