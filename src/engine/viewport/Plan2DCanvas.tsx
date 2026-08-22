/**
 * EVLab 3D Studio - 2D Plan View Engine
 *
 * Revit-style orthographic plan drafting canvas: renders every SceneObject
 * from useAppStore top-down (X/Z plane), filtered to the active level, and
 * shares the exact same creation pipeline ThreeCanvas's GroundPlane uses
 * (SnapEngine + ElementFactory + useAppStore.addObject) - so a wall drawn
 * here is the same SceneObject the 3D view, schedules, and every BIM panel
 * see. This is a pure HTML5 canvas 2D renderer (no Three.js), which is
 * what makes true black/white CAD-style plan drafting (centerlines, wall
 * poche, swing arcs, live dimensions) possible.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../../state/useAppStore';
import { SceneObject, ToolType, Vector3D } from '../../types';
import {
  createElementFromTool,
  createLineElementFromTool,
  isCreationTool,
  isLineBasedTool,
} from '../creation/ElementFactory';
import { getLineEndpoints, snapPoint } from '../creation/SnapEngine';

/** Pixels-per-metre zoom bounds (mirrors the +/- buttons' clamp range). */
const MIN_ZOOM = 4;
const MAX_ZOOM = 400;
const DEFAULT_ZOOM = 40; // px per metre

interface ScreenPt {
  x: number;
  y: number;
}

function formatMm(mm: number): string {
  return mm >= 1000 ? `${(mm / 1000).toFixed(2)} m` : `${Math.round(mm)} mm`;
}

/** Rotates a local-frame offset (lx, lz) by rotation.y (degrees) into world mm, matching the Y-axis rotation convention ThreeCanvas/ObjectMesh applies to SceneObject.rotation.y. */
function rotateOffset(lx: number, lz: number, rotationYDeg: number): [number, number] {
  const rad = (rotationYDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [lx * c + lz * s, -lx * s + lz * c];
}

/** Plan footprint (world mm, X/Z) for a rectangular (non line-based) SceneObject, matching the width/length convention ThreeCanvas.buildGeometry uses (footprint = width x (length||width)). */
function rectCorners(obj: SceneObject): ScreenPt[] /* actually world Vector2 pairs, named ScreenPt for reuse */ {
  const p = obj.parametric;
  const halfW = (p.width ?? 1000) / 2;
  const halfL = (p.length ?? p.width ?? 1000) / 2;
  const local: [number, number][] = [
    [-halfW, -halfL],
    [halfW, -halfL],
    [halfW, halfL],
    [-halfW, halfL],
  ];
  return local.map(([lx, lz]) => {
    const [dx, dz] = rotateOffset(lx, lz, obj.rotation.y);
    return { x: obj.position.x + dx, y: obj.position.z + dz };
  });
}

export const Plan2DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const objects = useAppStore(useShallow((s) => Object.values(s.objects)));
  const selectedObjectIds = useAppStore((s) => s.selectedObjectIds);
  const activeTool = useAppStore((s) => s.activeTool);
  const levels = useAppStore((s) => s.levels);
  const activeLevelId = useAppStore((s) => s.activeLevelId);
  const layers = useAppStore((s) => s.layers);
  const materials = useAppStore((s) => s.materials);
  const showLabels = useAppStore((s) => s.showLabels);
  const addObject = useAppStore((s) => s.addObject);
  const selectObject = useAppStore((s) => s.selectObject);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const nextInstanceNumber = useAppStore((s) => s.nextInstanceNumber);

  const activeLevel = levels.find((l) => l.id === activeLevelId) ?? levels[0];

  // View transform: zoom = px per metre, pan = screen-px offset of world origin.
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState<ScreenPt>({ x: 0, y: 0 });
  const [panInitialised, setPanInitialised] = useState(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<ScreenPt>({ x: 0, y: 0 });

  // In-progress line draw (wall/road/pipe chain draw, mirrors ThreeCanvas.GroundPlane).
  const [drawStart, setDrawStart] = useState<Vector3D | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Vector3D | null>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });

  // Level-filtered, visible objects for this plan.
  const planObjects = useMemo(
    () => objects.filter((o) => o.visible && (!activeLevel || o.bim.level === activeLevel.name)),
    [objects, activeLevel]
  );

  // Keep canvas backing-store sized to its container (incl. HiDPI).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      setSize({ w, h });
      if (!panInitialised && w > 0 && h > 0) {
        setPan({ x: w / 2, y: h / 2 });
        setPanInitialised(true);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cancel any in-progress run when the tool changes (matches ThreeCanvas.GroundPlane).
  useEffect(() => {
    setDrawStart(null);
    setHoverPoint(null);
  }, [activeTool]);

  const pxPerMm = zoom / 1000;

  const worldToScreen = useCallback(
    (pt: { x: number; z: number }): ScreenPt => ({
      x: pan.x + pt.x * pxPerMm,
      y: pan.y - pt.z * pxPerMm,
    }),
    [pan, pxPerMm]
  );

  const screenToWorld = useCallback(
    (pt: ScreenPt): Vector3D => ({
      x: (pt.x - pan.x) / pxPerMm,
      y: 0,
      z: -(pt.y - pan.y) / pxPerMm,
    }),
    [pan, pxPerMm]
  );

  /* ---------------------------------------------------------------- */
  /* Rendering                                                         */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0 || size.h === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size.w, size.h);

    // --- Grid -------------------------------------------------------
    const minorMm = 1000; // 1m minor grid
    const majorEvery = 5; // every 5th line is a major axis line
    const topLeft = screenToWorld({ x: 0, y: 0 });
    const bottomRight = screenToWorld({ x: size.w, y: size.h });
    const minX = Math.floor(Math.min(topLeft.x, bottomRight.x) / minorMm) * minorMm;
    const maxX = Math.ceil(Math.max(topLeft.x, bottomRight.x) / minorMm) * minorMm;
    const minZ = Math.floor(Math.min(topLeft.z, bottomRight.z) / minorMm) * minorMm;
    const maxZ = Math.ceil(Math.max(topLeft.z, bottomRight.z) / minorMm) * minorMm;

    if ((maxX - minX) / minorMm < 400) {
      for (let x = minX; x <= maxX; x += minorMm) {
        const isMajor = Math.round(x / minorMm) % majorEvery === 0;
        const s = worldToScreen({ x, z: 0 });
        ctx.strokeStyle = x === 0 ? '#38bdf8' : isMajor ? '#334155' : '#1e293b';
        ctx.lineWidth = x === 0 ? 1.5 : isMajor ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x, 0);
        ctx.lineTo(s.x, size.h);
        ctx.stroke();
      }
      for (let z = minZ; z <= maxZ; z += minorMm) {
        const isMajor = Math.round(z / minorMm) % majorEvery === 0;
        const s = worldToScreen({ x: 0, z });
        ctx.strokeStyle = z === 0 ? '#38bdf8' : isMajor ? '#334155' : '#1e293b';
        ctx.lineWidth = z === 0 ? 1.5 : isMajor ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(0, s.y);
        ctx.lineTo(size.w, s.y);
        ctx.stroke();
      }
    }

    // --- Elements -----------------------------------------------------
    const selected = new Set(selectedObjectIds);

    planObjects.forEach((obj) => {
      const isSelected = selected.has(obj.id);
      const baseColor = obj.color || '#94a3b8';
      const type = obj.parametric.type;

      if (type === 'wall' || type === 'road' || type === 'pipe') {
        const endpoints = getLineEndpoints(obj);
        if (!endpoints) return;
        const [a, b] = endpoints;
        const thickness = obj.parametric.thickness ?? obj.parametric.diameter ?? (type === 'pipe' ? 100 : 150);
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const len = Math.hypot(dx, dz);
        if (len > 0) {
          const nx = (-dz / len) * (thickness / 2);
          const nz = (dx / len) * (thickness / 2);
          const p1 = worldToScreen({ x: a.x + nx, z: a.z + nz });
          const p2 = worldToScreen({ x: b.x + nx, z: b.z + nz });
          const p3 = worldToScreen({ x: b.x - nx, z: b.z - nz });
          const p4 = worldToScreen({ x: a.x - nx, z: a.z - nz });

          ctx.fillStyle = isSelected ? 'rgba(250, 204, 21, 0.28)' : type === 'wall' ? 'rgba(203, 213, 225, 0.35)' : `${baseColor}55`;
          ctx.strokeStyle = isSelected ? '#facc15' : type === 'wall' ? '#cbd5e1' : baseColor;
          ctx.lineWidth = isSelected ? 2.5 : type === 'wall' ? 1.5 : 1.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Centerline
        const sa = worldToScreen({ x: a.x, z: a.z });
        const sb = worldToScreen({ x: b.x, z: b.z });
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = isSelected ? '#facc15' : '#0ea5e9';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(sa.x, sa.y);
        ctx.lineTo(sb.x, sb.y);
        ctx.stroke();
        ctx.setLineDash([]);

        if (showLabels) {
          const mid = { x: (sa.x + sb.x) / 2, y: (sa.y + sb.y) / 2 };
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(obj.name, mid.x, mid.y - 6);
        }
        return;
      }

      if (type === 'tank' || type === 'cylinder' || type === 'sphere') {
        const radius = (obj.parametric.diameter ?? obj.parametric.radius ? obj.parametric.radius! * 2 : obj.parametric.width ?? 1000) / 2;
        const c = worldToScreen({ x: obj.position.x, z: obj.position.z });
        const r = Math.max(radius * pxPerMm, 2);
        ctx.fillStyle = isSelected ? 'rgba(250, 204, 21, 0.3)' : `${baseColor}66`;
        ctx.strokeStyle = isSelected ? '#facc15' : baseColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (showLabels) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(obj.name, c.x, c.y - r - 4);
        }
        return;
      }

      if (type === 'door') {
        const width = obj.parametric.width ?? 900;
        const c = worldToScreen({ x: obj.position.x, z: obj.position.z });
        const rPx = width * pxPerMm;
        const rad = (obj.rotation.y * Math.PI) / 180;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(-rad);
        ctx.strokeStyle = isSelected ? '#facc15' : '#f59e0b';
        ctx.lineWidth = 1.5;
        // Panel (open, along +x from hinge at origin)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(rPx, 0);
        ctx.stroke();
        // Swing arc
        ctx.beginPath();
        ctx.arc(0, 0, rPx, 0, -Math.PI / 2, true);
        ctx.stroke();
        // Threshold line
        ctx.strokeStyle = isSelected ? '#facc15' : '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -rPx);
        ctx.stroke();
        ctx.restore();

        if (showLabels) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(obj.name, c.x, c.y + 14);
        }
        return;
      }

      if (type === 'window') {
        const width = obj.parametric.width ?? 1200;
        const c = worldToScreen({ x: obj.position.x, z: obj.position.z });
        const wPx = Math.max(width * pxPerMm, 4);
        const rad = (obj.rotation.y * Math.PI) / 180;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(-rad);
        ctx.fillStyle = isSelected ? '#facc15' : '#38bdf8';
        ctx.fillRect(-wPx / 2, -3, wPx, 6);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.strokeRect(-wPx / 2, -3, wPx, 6);
        ctx.restore();

        if (showLabels) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(obj.name, c.x, c.y - 10);
        }
        return;
      }

      if (type === 'custom_extrude' && obj.parametric.points && obj.parametric.points.length >= 3) {
        ctx.fillStyle = isSelected ? 'rgba(250, 204, 21, 0.28)' : `${baseColor}55`;
        ctx.strokeStyle = isSelected ? '#facc15' : baseColor;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        obj.parametric.points.forEach((pt, idx) => {
          const s = worldToScreen({ x: obj.position.x + pt.x, z: obj.position.z + pt.z });
          if (idx === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        return;
      }

      // Default: rectangular footprint (column, beam, slab, footing, roof, duct, stairs, cube)
      const corners = rectCorners(obj).map((c) => worldToScreen({ x: c.x, z: c.y }));
      ctx.fillStyle = isSelected ? 'rgba(250, 204, 21, 0.3)' : `${baseColor}88`;
      ctx.strokeStyle = isSelected ? '#facc15' : baseColor;
      ctx.lineWidth = isSelected ? 2.5 : 1.25;
      ctx.beginPath();
      corners.forEach((c, idx) => (idx === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (showLabels) {
        const center = worldToScreen({ x: obj.position.x, z: obj.position.z });
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obj.name, center.x, center.y - 8);
      }
    });

    // --- Active draw preview (rubber-band + live dimension) ------------
    if (drawStart && hoverPoint && isLineBasedTool(activeTool)) {
      const p1 = worldToScreen({ x: drawStart.x, z: drawStart.z });
      const p2 = worldToScreen({ x: hoverPoint.x, z: hoverPoint.z });
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const dist = Math.hypot(hoverPoint.x - drawStart.x, hoverPoint.z - drawStart.z);
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const label = formatMm(dist);
      ctx.font = 'bold 11px monospace';
      const textW = ctx.measureText(label).width;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(mid.x - textW / 2 - 6, mid.y - 11, textW + 12, 20);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(label, mid.x, mid.y + 3);
    }

    // --- Snap indicator --------------------------------------------
    if (hoverPoint && isCreationTool(activeTool)) {
      const s = worldToScreen({ x: hoverPoint.x, z: hoverPoint.z });
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [size, pan, zoom, planObjects, selectedObjectIds, drawStart, hoverPoint, activeTool, showLabels, pxPerMm, worldToScreen, screenToWorld]);

  /* ---------------------------------------------------------------- */
  /* Hit testing (select tool)                                         */
  /* ---------------------------------------------------------------- */

  const hitTest = useCallback(
    (world: Vector3D): string | null => {
      // Test in reverse draw order so the most recently added / topmost element wins.
      for (let i = planObjects.length - 1; i >= 0; i--) {
        const obj = planObjects[i];
        const type = obj.parametric.type;

        if (type === 'wall' || type === 'road' || type === 'pipe') {
          const endpoints = getLineEndpoints(obj);
          if (!endpoints) continue;
          const [a, b] = endpoints;
          const thickness = obj.parametric.thickness ?? obj.parametric.diameter ?? 150;
          const dx = b.x - a.x;
          const dz = b.z - a.z;
          const lenSq = dx * dx + dz * dz;
          if (lenSq === 0) continue;
          const t = Math.max(0, Math.min(1, ((world.x - a.x) * dx + (world.z - a.z) * dz) / lenSq));
          const px = a.x + t * dx;
          const pz = a.z + t * dz;
          const dist = Math.hypot(world.x - px, world.z - pz);
          if (dist <= thickness / 2 + 150) return obj.id;
          continue;
        }

        if (type === 'tank' || type === 'cylinder' || type === 'sphere') {
          const radius = (obj.parametric.diameter ?? (obj.parametric.radius ? obj.parametric.radius * 2 : obj.parametric.width ?? 1000)) / 2;
          if (Math.hypot(world.x - obj.position.x, world.z - obj.position.z) <= radius) return obj.id;
          continue;
        }

        if (type === 'door' || type === 'window') {
          const width = obj.parametric.width ?? 900;
          if (Math.hypot(world.x - obj.position.x, world.z - obj.position.z) <= width / 2 + 150) return obj.id;
          continue;
        }

        // Rectangular footprint: transform click into the object's local frame.
        const dx = world.x - obj.position.x;
        const dz = world.z - obj.position.z;
        const rad = (obj.rotation.y * Math.PI) / 180;
        const lx = dx * Math.cos(rad) - dz * Math.sin(rad);
        const lz = dx * Math.sin(rad) + dz * Math.cos(rad);
        const halfW = (obj.parametric.width ?? 1000) / 2;
        const halfL = (obj.parametric.length ?? obj.parametric.width ?? 1000) / 2;
        if (Math.abs(lx) <= halfW && Math.abs(lz) <= halfL) return obj.id;
      }
      return null;
    },
    [planObjects]
  );

  /* ---------------------------------------------------------------- */
  /* Mouse interaction                                                  */
  /* ---------------------------------------------------------------- */

  const clientToLocal = useCallback((e: React.MouseEvent): ScreenPt => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || e.button === 2) {
        isPanningRef.current = true;
        const local = clientToLocal(e);
        panStartRef.current = { x: local.x - pan.x, y: local.y - pan.y };
        return;
      }
      if (e.button !== 0) return;

      const local = clientToLocal(e);
      const raw = screenToWorld(local);
      const snapped = snapPoint(raw, planObjects).point;

      if (isLineBasedTool(activeTool)) {
        if (!drawStart) {
          setDrawStart(snapped);
          return;
        }
        const layerId = layers[0]?.id ?? 'layer_default';
        const materialId = materials[0]?.id ?? 'mat_default';
        const levelName = activeLevel?.name ?? 'Level 01 Ground Floor';
        const newObject = createLineElementFromTool(
          activeTool,
          drawStart,
          snapped,
          nextInstanceNumber(activeTool),
          layerId,
          materialId,
          levelName
        );
        if (newObject) addObject(newObject);
        setDrawStart(snapped); // chain draw, like Revit's wall tool
        return;
      }

      if (isCreationTool(activeTool)) {
        const layerId = layers[0]?.id ?? 'layer_default';
        const materialId = materials[0]?.id ?? 'mat_default';
        const levelName = activeLevel?.name ?? 'Level 01 Ground Floor';
        const newObject = createElementFromTool(
          activeTool,
          snapped,
          nextInstanceNumber(activeTool),
          layerId,
          materialId,
          levelName
        );
        if (newObject) addObject(newObject);
        return;
      }

      // Select tool
      const hitId = hitTest(raw);
      if (hitId) selectObject(hitId, e.shiftKey);
      else clearSelection();
    },
    [
      clientToLocal,
      pan,
      screenToWorld,
      planObjects,
      activeTool,
      drawStart,
      layers,
      materials,
      activeLevel,
      nextInstanceNumber,
      addObject,
      hitTest,
      selectObject,
      clearSelection,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const local = clientToLocal(e);
      if (isPanningRef.current) {
        setPan({ x: local.x - panStartRef.current.x, y: local.y - panStartRef.current.y });
        return;
      }
      if (!isCreationTool(activeTool)) {
        setHoverPoint(null);
        return;
      }
      const raw = screenToWorld(local);
      setHoverPoint(snapPoint(raw, planObjects).point);
    },
    [clientToLocal, activeTool, screenToWorld, planObjects]
  );

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) isPanningRef.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const local = clientToLocal(e);
      const worldBefore = screenToWorld(local);
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
      const newPxPerMm = newZoom / 1000;
      // Keep the point under the cursor stationary while zooming.
      setPan({
        x: local.x - worldBefore.x * newPxPerMm,
        y: local.y + worldBefore.z * newPxPerMm,
      });
      setZoom(newZoom);
    },
    [clientToLocal, screenToWorld, zoom]
  );

  const zoomPct = Math.round((zoom / DEFAULT_ZOOM) * 100);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />

      {/* Level / mode readout */}
      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 shadow-lg flex items-center gap-2">
        <span className="font-semibold text-sky-400">2D Plan View</span>
        <span className="text-slate-600">|</span>
        <span>{activeLevel?.name ?? 'No Level'}</span>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 shadow-lg flex items-center gap-1">
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z / 1.25))}
          className="hover:bg-slate-800 w-5 h-5 rounded font-bold leading-none"
        >
          −
        </button>
        <span className="w-12 text-center font-mono">{zoomPct}%</span>
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.25))}
          className="hover:bg-slate-800 w-5 h-5 rounded font-bold leading-none"
        >
          +
        </button>
      </div>

      {/* Hint bar */}
      <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur border border-slate-800 rounded px-3 py-1.5 text-[11px] text-slate-500 shadow-lg flex items-center gap-3">
        <span>MMB / RMB drag: Pan</span>
        <span>Wheel: Zoom</span>
        <span>Esc: Cancel tool</span>
      </div>
    </div>
  );
};
