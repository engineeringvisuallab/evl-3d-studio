/**
 * EVLab 3D Studio - Entity & Parametric BIM Properties Inspector
 */

import React from 'react';
import { useAppStore } from '../../state/useAppStore';
import { calculateObjectMetrics } from '../../core/geometry/geometryBuilder';
import { Building, Sliders, Layers, Palette, DollarSign, Activity } from 'lucide-react';

export const EntityPropertiesPanel: React.FC = () => {
  const {
    objects,
    selectedObjectIds,
    materials,
    layers,
    updateObject,
    updateObjectParametric,
    updateObjectBim,
    removeSelectedObjects,
    duplicateSelectedObjects
  } = useAppStore();

  const selectedObject = Object.values(objects).find((o) => selectedObjectIds.includes(o.id));

  if (!selectedObject) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full">
        <Building className="w-8 h-8 text-slate-700 mb-2" />
        <p className="font-semibold">No Object Selected</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Click an object in the 3D viewport or select one from the Outliner.
        </p>
      </div>
    );
  }

  const metrics = calculateObjectMetrics(selectedObject.parametric, selectedObject.scale);

  return (
    <div className="p-3 text-xs space-y-4 overflow-y-auto max-h-full text-slate-300">
      {/* Header & Quick Action Buttons */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div>
          <input
            type="text"
            value={selectedObject.name}
            onChange={(e) => updateObject(selectedObject.id, { name: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-bold text-xs w-full focus:border-cyan-500 outline-none"
          />
          <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
            ID: {selectedObject.bim.objectId} | GUID: {selectedObject.bim.globalId}
          </div>
        </div>
      </div>

      <div className="flex space-x-1">
        <button
          onClick={duplicateSelectedObjects}
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-1 rounded text-[11px] font-medium"
        >
          Duplicate
        </button>
        <button
          onClick={removeSelectedObjects}
          className="flex-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 py-1 rounded text-[11px] font-medium"
        >
          Delete
        </button>
      </div>

      {/* Engineering Live Calculated Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded p-2 space-y-1">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>Calculated Metrics</span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
          <div>
            <div className="text-[9px] text-slate-500">Volume</div>
            <div className="text-emerald-400 font-bold">{metrics.volumeM3} m³</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500">Surface Area</div>
            <div className="text-cyan-400 font-bold">{metrics.surfaceAreaM2} m²</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-500">Length</div>
            <div className="text-yellow-400 font-bold">{metrics.lengthM} m</div>
          </div>
        </div>
      </div>

      {/* Parametric Dimension Inputs */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-200 flex items-center space-x-1">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Parametric Geometry Parameters</span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
          {selectedObject.parametric.width !== undefined && (
            <div>
              <label className="text-[10px] text-slate-400">Width (mm):</label>
              <input
                type="number"
                value={selectedObject.parametric.width}
                onChange={(e) =>
                  updateObjectParametric(selectedObject.id, { width: Number(e.target.value) })
                }
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 w-full font-mono text-cyan-300 outline-none"
              />
            </div>
          )}

          {selectedObject.parametric.height !== undefined && (
            <div>
              <label className="text-[10px] text-slate-400">Height (mm):</label>
              <input
                type="number"
                value={selectedObject.parametric.height}
                onChange={(e) =>
                  updateObjectParametric(selectedObject.id, { height: Number(e.target.value) })
                }
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 w-full font-mono text-cyan-300 outline-none"
              />
            </div>
          )}

          {selectedObject.parametric.length !== undefined && (
            <div>
              <label className="text-[10px] text-slate-400">Length (mm):</label>
              <input
                type="number"
                value={selectedObject.parametric.length}
                onChange={(e) =>
                  updateObjectParametric(selectedObject.id, { length: Number(e.target.value) })
                }
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 w-full font-mono text-cyan-300 outline-none"
              />
            </div>
          )}

          {selectedObject.parametric.diameter !== undefined && (
            <div>
              <label className="text-[10px] text-slate-400">Diameter (mm):</label>
              <input
                type="number"
                value={selectedObject.parametric.diameter}
                onChange={(e) =>
                  updateObjectParametric(selectedObject.id, { diameter: Number(e.target.value) })
                }
                className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 w-full font-mono text-cyan-300 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* World Coordinates / Transform */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-200">World Coordinates (X, Y, Z)</div>
        <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2 rounded border border-slate-800 font-mono">
          <div>
            <label className="text-[9px] text-red-400">X Position:</label>
            <input
              type="number"
              value={selectedObject.position.x}
              onChange={(e) =>
                updateObject(selectedObject.id, {
                  position: { ...selectedObject.position, x: Number(e.target.value) }
                })
              }
              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 w-full text-slate-200 outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] text-emerald-400">Y Elevation:</label>
            <input
              type="number"
              value={selectedObject.position.y}
              onChange={(e) =>
                updateObject(selectedObject.id, {
                  position: { ...selectedObject.position, y: Number(e.target.value) }
                })
              }
              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 w-full text-slate-200 outline-none"
            />
          </div>
          <div>
            <label className="text-[9px] text-cyan-400">Z Position:</label>
            <input
              type="number"
              value={selectedObject.position.z}
              onChange={(e) =>
                updateObject(selectedObject.id, {
                  position: { ...selectedObject.position, z: Number(e.target.value) }
                })
              }
              className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 w-full text-slate-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Layer & Material Assignment */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-400 flex items-center space-x-1 mb-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>Tag / Layer:</span>
          </label>
          <select
            value={selectedObject.layerId}
            onChange={(e) => updateObject(selectedObject.id, { layerId: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full outline-none"
          >
            {layers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 flex items-center space-x-1 mb-1">
            <Palette className="w-3 h-3 text-slate-400" />
            <span>Material:</span>
          </label>
          <select
            value={selectedObject.materialId}
            onChange={(e) => updateObject(selectedObject.id, { materialId: e.target.value })}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full outline-none"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BIM Metadata Inspector */}
      <div className="space-y-2 border-t border-slate-800 pt-3">
        <div className="text-[11px] font-semibold text-slate-200 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            <span>BIM Metadata Schema</span>
          </span>
          <span className="text-[10px] text-indigo-400 font-mono">IFC Compatible</span>
        </div>

        <div className="space-y-1.5 bg-slate-900/80 p-2.5 rounded border border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500">Category:</label>
              <input
                type="text"
                value={selectedObject.bim.category}
                onChange={(e) =>
                  updateObjectBim(selectedObject.id, { category: e.target.value as any })
                }
                className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 w-full text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500">Family:</label>
              <input
                type="text"
                value={selectedObject.bim.family}
                onChange={(e) => updateObjectBim(selectedObject.id, { family: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 w-full text-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-slate-500">Building Level:</label>
              <input
                type="text"
                value={selectedObject.bim.level}
                onChange={(e) => updateObjectBim(selectedObject.id, { level: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 w-full text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500">Cost Estimate ($):</label>
              <input
                type="number"
                value={selectedObject.bim.costEstimate || 0}
                onChange={(e) =>
                  updateObjectBim(selectedObject.id, { costEstimate: Number(e.target.value) })
                }
                className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 w-full text-emerald-400 font-mono outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
