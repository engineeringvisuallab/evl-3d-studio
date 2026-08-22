/**
 * EVLab 3D Studio - 3D Viewport Engine
 * React Three Fiber canvas: renders every SceneObject from useAppStore,
 * handles click-to-select (with shift-click for additive selection),
 * a move/rotate/scale TransformControls gizmo bound to the active tool,
 * and named camera presets (top/front/back/left/right/iso) driven by the
 * ribbon bar's "View" buttons.
 *
 * Units: SceneObject positions/dimensions are stored in millimetres
 * (project convention, see src/types/index.ts); this component converts
 * to metres for the Three.js scene and back on write.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { Grid, Html, Line, OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../state/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { ParametricData, SceneObject, ToolType, Vector3D } from '../../types';
import { createElementFromTool, createLineElementFromTool, isCreationTool, isLineBasedTool } from '../creation/ElementFactory';
import { snapPoint } from '../creation/SnapEngine';

const MM = 0.001;

interface ThreeCanvasProps {
  cameraPreset: string | null;
}

interface CameraPresetConfig {
  position: [number, number, number];
  target: [number, number, number];
}

const CAMERA_PRESETS: Record<string, CameraPresetConfig> = {
  top: { position: [0, 45, 0.001], target: [0, 0, 0] },
  bottom: { position: [0, -45, 0.001], target: [0, 0, 0] },
  front: { position: [0, 6, 40], target: [0, 3, 0] },
  back: { position: [0, 6, -40], target: [0, 3, 0] },
  left: { position: [-40, 6, 0], target: [0, 3, 0] },
  right: { position: [40, 6, 0], target: [0, 3, 0] },
  iso: { position: [24, 20, 24], target: [0, 0, 0] },
};

/* ---------------------------------------------------------------------- */
/* Geometry factory                                                        */
/* ---------------------------------------------------------------------- */

/**
 * Builds a Three.js geometry for a SceneObject's parametric definition.
 * Dimensions come in as millimetres and are converted to metres here.
 * Unrecognised types fall back to a 1m generic box rather than throwing,
 * so a malformed/incomplete element still renders (with a validation
 * warning surfaced elsewhere) instead of crashing the viewport.
 */
function buildGeometry(p: ParametricData): THREE.BufferGeometry {
  const width = (p.width ?? 1000) * MM;
  const height = (p.height ?? 1000) * MM;
  const length = (p.length ?? 1000) * MM;
  const thickness = (p.thickness ?? 200) * MM;
  const radius = (p.radius ?? (p.diameter ?? 200) / 2) * MM;

  switch (p.type) {
    case 'sphere':
      return new THREE.SphereGeometry(radius || width / 2, 24, 16);

    case 'cylinder':
      return new THREE.CylinderGeometry(radius || width / 2, radius || width / 2, height, 24);

    case 'wall':
      // Runs along X, thickness along Z
      return new THREE.BoxGeometry(length || width, height, thickness);

    case 'column':
      // Vertical box; width/thickness form the cross-section, height is the run
      return new THREE.BoxGeometry(width, height, thickness || width);

    case 'beam':
      // Horizontal box; length is the run, width/thickness the cross-section
      return new THREE.BoxGeometry(length || width, height, thickness || width);

    case 'slab':
    case 'roof':
      // Flat horizontal plate; thickness is the vertical dimension
      return new THREE.BoxGeometry(length || width, thickness, width || length);

    case 'footing':
      return new THREE.BoxGeometry(width, thickness, length || width);

    case 'door':
    case 'window':
      return new THREE.BoxGeometry(width, height, thickness || 60 * MM);

    case 'pipe':
    case 'duct': {
      const geo = new THREE.CylinderGeometry(radius || width / 2, radius || width / 2, length || width, 16);
      geo.rotateZ(Math.PI / 2); // lay along X instead of drei's default Y
      return geo;
    }

    case 'road':
      return new THREE.BoxGeometry(length || width, 0.05, width);

    case 'tank':
      return new THREE.CylinderGeometry(radius || width / 2, radius || width / 2, height, 32);

    case 'stairs':
      // Placeholder bounding volume until a dedicated stair-generation
      // engine (per-riser geometry) lands in a later phase.
      return new THREE.BoxGeometry(width, height, length || width);

    case 'custom_extrude': {
      if (p.points && p.points.length >= 3) {
        const shape = new THREE.Shape(p.points.map((pt) => new THREE.Vector2(pt.x * MM, pt.z * MM)));
        return new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
      }
      return new THREE.BoxGeometry(width, height, length || width);
    }

    case 'cube':
    default:
      return new THREE.BoxGeometry(width, height, length || width);
  }
}

/* ---------------------------------------------------------------------- */
/* Camera rig - applies named presets on demand                            */
/* ---------------------------------------------------------------------- */

function CameraRig({ preset }: { preset: string | null }) {
  const { camera, controls } = useThree();

  React.useEffect(() => {
    if (!preset) return;
    const cfg = CAMERA_PRESETS[preset];
    if (!cfg) return;

    camera.position.set(...cfg.position);
    camera.lookAt(new THREE.Vector3(...cfg.target));

    const orbit = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (orbit && orbit.target && typeof orbit.update === 'function') {
      orbit.target.set(...cfg.target);
      orbit.update();
    }
  }, [preset, camera, controls]);

  return null;
}

/* ---------------------------------------------------------------------- */
/* Single object renderer                                                  */
/* ---------------------------------------------------------------------- */

interface ObjectMeshProps {
  object: SceneObject;
  registerRef: (group: THREE.Group | null) => void;
}

function ObjectMesh({ object, registerRef }: ObjectMeshProps) {
  const selectObject = useAppStore((s) => s.selectObject);
  const isSelected = useAppStore((s) => s.selectedIds.includes(object.id));
  const showLabels = useAppStore((s) => s.showLabels);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const geometry = useMemo(() => buildGeometry(object.parametric), [JSON.stringify(object.parametric)]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (object.locked) return;
      selectObject(object.id, e.shiftKey);
    },
    [object.id, object.locked, selectObject]
  );

  if (!object.visible) return null;

  return (
    <group
      ref={registerRef}
      position={[object.position.x * MM, object.position.y * MM, object.position.z * MM]}
      rotation={[
        THREE.MathUtils.degToRad(object.rotation.x),
        THREE.MathUtils.degToRad(object.rotation.y),
        THREE.MathUtils.degToRad(object.rotation.z),
      ]}
      scale={[object.scale.x, object.scale.y, object.scale.z]}
      onClick={handleClick}
      userData={{ objectId: object.id }}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={object.color || '#94a3b8'}
          metalness={0.1}
          roughness={0.8}
          emissive={isSelected ? new THREE.Color('#38bdf8') : new THREE.Color('#000000')}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />
      </mesh>

      {isSelected && (
        <lineSegments geometry={new THREE.EdgesGeometry(geometry)}>
          <lineBasicMaterial color="#38bdf8" />
        </lineSegments>
      )}

      {showLabels && (
        <Html distanceFactor={12} occlude>
          <div className="px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] text-slate-100 whitespace-nowrap select-none pointer-events-none">
            {object.name}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ---------------------------------------------------------------------- */
/* Placement ghost - translucent preview for point-based creation tools    */
/* ---------------------------------------------------------------------- */

/**
 * Semi-transparent preview of what a point-based creation tool (column,
 * door, window, slab, tank) would place at the current snapped hover
 * point. Built via ElementFactory itself (instanceIndex 0, throwaway
 * layer/material ids) so the ghost's size always matches the real thing -
 * this never touches the store, so it can't disturb instance numbering.
 */
function PlacementGhost({ tool, point }: { tool: ToolType; point: Vector3D }) {
  const preview = useMemo(() => createElementFromTool(tool, point, 0, 'ghost', 'ghost'), [tool, point]);
  const geometry = useMemo(() => (preview ? buildGeometry(preview.parametric) : null), [preview]);

  if (!preview || !geometry) return null;

  return (
    <mesh position={[point.x * MM, point.y * MM, point.z * MM]} geometry={geometry}>
      <meshStandardMaterial color={preview.color || '#38bdf8'} transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

/** Small marker dot at the current snapped point, shown for any active creation tool so the snap target is visible even before the first click. */
function SnapMarker({ point }: { point: Vector3D }) {
  return (
    <mesh position={[point.x * MM, 0.02, point.z * MM]}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshBasicMaterial color="#38bdf8" />
    </mesh>
  );
}

/* ---------------------------------------------------------------------- */
/* Ground plane - click target for placement, sketching, and deselection   */
/* ---------------------------------------------------------------------- */

/**
 * A large, fully transparent (but raycastable) plane at y=0. Behaviour
 * depends on the active tool:
 *  - Point-based creation tools (column, door, window, slab, tank): a
 *    single click drops a default-sized element at the click point.
 *  - Line-based creation tools (wall, road, pipe): the first click starts
 *    a run, the pointer shows a live snapped preview + length label, and
 *    the second click commits the run and immediately starts the next one
 *    from that same endpoint (chain drawing, like Revit's wall tool).
 *    Escape / switching tools cancels the in-progress run.
 *  - Anything else: a click clears the current selection.
 * All points snap to existing wall/road/pipe endpoints within tolerance,
 * else to the 250mm grid (see SnapEngine).
 */
function GroundPlane() {
  const activeTool = useAppStore((s) => s.activeTool);
  const objects = useAppStore((s) => s.objects);
  const layers = useAppStore((s) => s.layers);
  const materials = useAppStore((s) => s.materials);
  const levels = useAppStore((s) => s.levels);
  const activeLevelId = useAppStore((s) => s.activeLevelId);
  const addObject = useAppStore((s) => s.addObject);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const nextInstanceNumber = useAppStore((s) => s.nextInstanceNumber);

  const [sketchStart, setSketchStart] = useState<Vector3D | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Vector3D | null>(null);

  const objectList = useMemo(() => Object.values(objects), [objects]);

  // Cancel any in-progress run when the tool changes (e.g. Escape -> 'select').
  useEffect(() => {
    setSketchStart(null);
    setHoverPoint(null);
  }, [activeTool]);

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isCreationTool(activeTool)) {
        setHoverPoint(null);
        return;
      }
      const raw: Vector3D = { x: e.point.x / MM, y: 0, z: e.point.z / MM };
      setHoverPoint(snapPoint(raw, objectList).point);
    },
    [activeTool, objectList]
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const layerId = layers[0]?.id ?? 'layer_default';
      const materialId = materials[0]?.id ?? 'mat_default';
      const activeLevelName = levels.find((l) => l.id === activeLevelId)?.name ?? 'Level 01 Ground Floor';
      const raw: Vector3D = { x: e.point.x / MM, y: 0, z: e.point.z / MM };
      const snapped = snapPoint(raw, objectList).point;

      if (isLineBasedTool(activeTool)) {
        if (!sketchStart) {
          setSketchStart(snapped);
          return;
        }
        const newObject = createLineElementFromTool(
          activeTool,
          sketchStart,
          snapped,
          nextInstanceNumber(activeTool),
          layerId,
          materialId,
          activeLevelName
        );
        if (newObject) addObject(newObject);
        setSketchStart(snapped); // chain: next run starts where this one ended
        return;
      }

      if (isCreationTool(activeTool)) {
        const newObject = createElementFromTool(
          activeTool,
          snapped,
          nextInstanceNumber(activeTool),
          layerId,
          materialId,
          activeLevelName
        );
        if (newObject) addObject(newObject);
        return;
      }

      clearSelection();
    },
    [activeTool, sketchStart, objectList, layers, materials, levels, activeLevelId, addObject, clearSelection, nextInstanceNumber]
  );

  const previewLength = sketchStart && hoverPoint ? Math.hypot(hoverPoint.x - sketchStart.x, hoverPoint.z - sketchStart.z) : 0;

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
      >
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hoverPoint && isLineBasedTool(activeTool) && sketchStart && (
        <>
          <Line
            points={[
              [sketchStart.x * MM, 0.05, sketchStart.z * MM],
              [hoverPoint.x * MM, 0.05, hoverPoint.z * MM],
            ]}
            color="#38bdf8"
            lineWidth={2}
          />
          <Html
            position={[((sketchStart.x + hoverPoint.x) / 2) * MM, 0.3, ((sketchStart.z + hoverPoint.z) / 2) * MM]}
            center
          >
            <div className="px-1.5 py-0.5 rounded bg-sky-600 text-[10px] text-white whitespace-nowrap select-none pointer-events-none">
              {Math.round(previewLength)} mm
            </div>
          </Html>
        </>
      )}

      {hoverPoint && isCreationTool(activeTool) && !isLineBasedTool(activeTool) && (
        <PlacementGhost tool={activeTool} point={hoverPoint} />
      )}

      {hoverPoint && isCreationTool(activeTool) && !(isLineBasedTool(activeTool) && sketchStart) && (
        <SnapMarker point={hoverPoint} />
      )}
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* Scene content - objects + selection gizmo                               */
/* ---------------------------------------------------------------------- */

function SceneContent({ onDraggingChange }: { onDraggingChange: (dragging: boolean) => void }) {
  const objects = useAppStore(useShallow((s) => Object.values(s.objects)));
  const selectedIds = useAppStore((s) => s.selectedIds);
  const activeTool = useAppStore((s) => s.activeTool);
  const updateObject = useAppStore((s) => s.updateObject);

  const groupRefs = useRef<Map<string, THREE.Group>>(new Map());

  const transformTargetId = selectedIds.length === 1 ? selectedIds[0] : null;
  const transformTarget = transformTargetId ? groupRefs.current.get(transformTargetId) ?? null : null;

  const transformMode: 'translate' | 'rotate' | 'scale' | null =
    activeTool === 'move' ? 'translate' : activeTool === 'rotate' ? 'rotate' : activeTool === 'scale' ? 'scale' : null;

  const handleTransformCommit = useCallback(() => {
    if (!transformTargetId || !transformTarget) return;

    const actionName =
      transformMode === 'translate' ? 'Move Object' : transformMode === 'rotate' ? 'Rotate Object' : 'Scale Object';

    updateObject(
      transformTargetId,
      {
        position: {
          x: transformTarget.position.x / MM,
          y: transformTarget.position.y / MM,
          z: transformTarget.position.z / MM,
        },
        rotation: {
          x: THREE.MathUtils.radToDeg(transformTarget.rotation.x),
          y: THREE.MathUtils.radToDeg(transformTarget.rotation.y),
          z: THREE.MathUtils.radToDeg(transformTarget.rotation.z),
        },
        scale: { x: transformTarget.scale.x, y: transformTarget.scale.y, z: transformTarget.scale.z },
      },
      actionName
    );
  }, [transformTargetId, transformTarget, transformMode, updateObject]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[15, 25, 10]} intensity={1.1} castShadow />
      <hemisphereLight args={['#94a3b8', '#0f172a', 0.4]} />

      <Grid
        args={[100, 100]}
        cellColor="#334155"
        sectionColor="#475569"
        cellSize={1}
        sectionSize={10}
        fadeDistance={80}
        infiniteGrid
      />

      <GroundPlane />

      {objects.map((obj) => (
        <ObjectMesh
          key={obj.id}
          object={obj}
          registerRef={(g) => {
            if (g) groupRefs.current.set(obj.id, g);
            else groupRefs.current.delete(obj.id);
          }}
        />
      ))}

      {transformTarget && transformMode && (
        <TransformControls
          object={transformTarget}
          mode={transformMode}
          onMouseDown={() => onDraggingChange(true)}
          onMouseUp={() => {
            onDraggingChange(false);
            handleTransformCommit();
          }}
        />
      )}
    </>
  );
}

/* ---------------------------------------------------------------------- */
/* Public component                                                        */
/* ---------------------------------------------------------------------- */

export function ThreeCanvas({ cameraPreset }: ThreeCanvasProps) {
  const clearSelection = useAppStore((s) => s.clearSelection);
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <Canvas
      shadows
      camera={{ position: [24, 20, 24], fov: 45, near: 0.1, far: 2000 }}
      onPointerMissed={() => clearSelection()}
    >
      <color attach="background" args={['#020617']} />
      <CameraRig preset={cameraPreset} />
      <SceneContent onDraggingChange={(dragging) => setOrbitEnabled(!dragging)} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} enabled={orbitEnabled} />
    </Canvas>
  );
}
