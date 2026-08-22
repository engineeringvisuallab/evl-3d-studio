/**
 * EVLab 3D Studio - Right Inspector Sidebar
 * Shows BIM identity + parametric geometry fields for the current
 * selection (editable, writes back through useAppStore.updateObject so
 * ThreeCanvas and undo/redo stay in sync), or a lightweight layer browser
 * when nothing is selected.
 */

import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Layers } from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';
import { ParametricData, Vector3D } from '../../types';
import { BuildingLevelsPanel } from './BuildingLevelsPanel';
import { BIMEnginePanel } from './BIMEnginePanel';

interface RightSidebarProps {
  setCameraPreset: (preset: string) => void;
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-400">{label}</span>
      <input
        type="number"
        step={step}
        value={value ?? 0}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-24 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-100 text-right"
      />
    </label>
  );
}

const GEOMETRY_FIELDS: { key: keyof ParametricData; label: string; unit: string }[] = [
  { key: 'width', label: 'Width', unit: 'mm' },
  { key: 'height', label: 'Height', unit: 'mm' },
  { key: 'length', label: 'Length', unit: 'mm' },
  { key: 'thickness', label: 'Thickness', unit: 'mm' },
  { key: 'diameter', label: 'Diameter', unit: 'mm' },
];

export function RightSidebar({ setCameraPreset: _setCameraPreset }: RightSidebarProps) {
  const selectedIds = useAppStore((s) => s.selectedIds);
  const objects = useAppStore((s) => s.objects);
  const updateObject = useAppStore((s) => s.updateObject);
  const layers = useAppStore((s) => s.layers);

  const selected = selectedIds.length === 1 ? objects[selectedIds[0]] : null;

  if (!selected) {
    return (
      <div className="w-72 shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col text-slate-300">
        <BuildingLevelsPanel />
        <div className="px-3 py-2 border-b border-slate-800 text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
          <Layers size={13} />
          Layers
          {selectedIds.length > 1 && (
            <span className="ml-auto normal-case font-normal text-slate-400">
              {selectedIds.length} objects selected
            </span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {layers.map((layer) => (
            <div key={layer.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: layer.color }} />
              <span className="flex-1 truncate">{layer.name}</span>
              {layer.visible ? <Eye size={13} className="text-slate-500" /> : <EyeOff size={13} className="text-slate-600" />}
              {layer.locked ? <Lock size={13} className="text-slate-500" /> : <Unlock size={13} className="text-slate-600" />}
            </div>
          ))}
          {selectedIds.length === 0 && (
            <p className="text-[11px] text-slate-500 px-2 pt-2">Select an object in the viewport to edit its properties.</p>
          )}
        </div>
      </div>
    );
  }

  const patchParametric = (patch: Partial<ParametricData>) =>
    updateObject(selected.id, { parametric: { ...selected.parametric, ...patch } }, 'Edit Geometry');

  const patchPosition = (patch: Partial<Vector3D>) =>
    updateObject(selected.id, { position: { ...selected.position, ...patch } }, 'Edit Position');

  return (
    <div className="w-72 shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col text-slate-300 overflow-y-auto">
      {/* Identity */}
      <div className="px-3 py-2 border-b border-slate-800">
        <p className="text-sm font-semibold text-slate-100 truncate">{selected.name}</p>
        <p className="text-[11px] text-slate-500">
          {selected.category} · {selected.discipline ?? selected.bim.family}
        </p>
      </div>

      {/* Visibility / lock */}
      <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-3 text-xs">
        <button
          onClick={() => updateObject(selected.id, { visible: !selected.visible }, 'Toggle Visibility')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-100"
        >
          {selected.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          {selected.visible ? 'Visible' : 'Hidden'}
        </button>
        <button
          onClick={() => updateObject(selected.id, { locked: !selected.locked }, 'Toggle Lock')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-100"
        >
          {selected.locked ? <Lock size={14} /> : <Unlock size={14} />}
          {selected.locked ? 'Locked' : 'Unlocked'}
        </button>
      </div>

      {/* Geometry / parametric */}
      <div className="px-3 py-2 border-b border-slate-800 space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Geometry</p>
        {GEOMETRY_FIELDS.filter((f) => selected.parametric[f.key] !== undefined).map((f) => (
          <NumberField
            key={f.key}
            label={`${f.label} (${f.unit})`}
            value={selected.parametric[f.key] as number | undefined}
            onChange={(v) => patchParametric({ [f.key]: v } as Partial<ParametricData>)}
          />
        ))}
      </div>

      {/* Position */}
      <div className="px-3 py-2 border-b border-slate-800 space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">Position (mm)</p>
        <NumberField label="X" value={selected.position.x} onChange={(v) => patchPosition({ x: v })} />
        <NumberField label="Y" value={selected.position.y} onChange={(v) => patchPosition({ y: v })} />
        <NumberField label="Z" value={selected.position.z} onChange={(v) => patchPosition({ z: v })} />
      </div>

      {/* BIM metadata */}
      <div className="px-3 py-2 space-y-1 text-xs">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">BIM Data</p>
        <div className="flex justify-between">
          <span className="text-slate-500">Family</span>
          <span className="text-slate-200">{selected.bim.family}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Type</span>
          <span className="text-slate-200">{selected.bim.typeName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Level</span>
          <span className="text-slate-200">{selected.bim.level}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Phase</span>
          <span className="text-slate-200">{selected.bim.phase}</span>
        </div>
        {selected.bim.costEstimate !== undefined && (
          <div className="flex justify-between">
            <span className="text-slate-500">Cost Estimate</span>
            <span className="text-slate-200">{selected.bim.costEstimate}</span>
          </div>
        )}
      </div>

      {/* Live BIM engine data (quantities, IFC, constraints, validation) */}
      <div className="border-t border-slate-800">
        <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          BIM Engine
        </p>
        <BIMEnginePanel selectedId={selected.id} />
      </div>
    </div>
  );
}
