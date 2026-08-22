/**
 * EVLab 3D Studio - Building Levels Panel
 * Revit-style floor/story management: list levels sorted by elevation,
 * switch the active level (new elements get tagged with it), rename,
 * adjust elevation, add, and delete. Ported concept from the evlab-bim
 * project's ProjectBrowser "Building Levels" group, adapted to
 * useAppStore + the project's existing BIMLevel type.
 */

import React, { useState } from 'react';
import { Layers, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';

export function BuildingLevelsPanel() {
  const levels = useAppStore((s) => s.levels);
  const activeLevelId = useAppStore((s) => s.activeLevelId);
  const setActiveLevelId = useAppStore((s) => s.setActiveLevelId);
  const addLevel = useAppStore((s) => s.addLevel);
  const renameLevel = useAppStore((s) => s.renameLevel);
  const updateLevelElevation = useAppStore((s) => s.updateLevelElevation);
  const removeLevel = useAppStore((s) => s.removeLevel);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftElevation, setDraftElevation] = useState('0');
  const [adding, setAdding] = useState(false);

  const sorted = [...levels].sort((a, b) => a.elevationMm - b.elevationMm);

  const startEdit = (id: string, name: string, elevationMm: number) => {
    setEditingId(id);
    setDraftName(name);
    setDraftElevation(String(elevationMm));
  };

  const commitEdit = () => {
    if (!editingId) return;
    if (draftName.trim()) renameLevel(editingId, draftName.trim());
    const elev = parseFloat(draftElevation);
    if (!Number.isNaN(elev)) updateLevelElevation(editingId, elev);
    setEditingId(null);
  };

  const commitAdd = () => {
    const elev = parseFloat(draftElevation) || 0;
    addLevel(draftName.trim() || `Level ${levels.length + 1}`, elev);
    setAdding(false);
    setDraftName('');
    setDraftElevation('0');
  };

  return (
    <div className="border-b border-slate-800">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
        <Layers size={13} />
        Building Levels
        <button
          onClick={() => {
            setAdding(true);
            setDraftName('');
            setDraftElevation('0');
          }}
          className="ml-auto text-slate-500 hover:text-emerald-400"
          title="Add level"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="px-2 pb-2 space-y-0.5">
        {sorted.map((lvl) => {
          const isActive = lvl.id === activeLevelId;
          const isEditing = editingId === lvl.id;

          if (isEditing) {
            return (
              <div key={lvl.id} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800">
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100"
                />
                <input
                  type="number"
                  value={draftElevation}
                  onChange={(e) => setDraftElevation(e.target.value)}
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100 text-right"
                  title="Elevation (mm)"
                />
                <button onClick={commitEdit} className="text-emerald-400 hover:text-emerald-300">
                  <Check size={13} />
                </button>
                <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-300">
                  <X size={13} />
                </button>
              </div>
            );
          }

          return (
            <div
              key={lvl.id}
              className={`group flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                isActive
                  ? 'bg-emerald-950/80 text-emerald-300 border-l-2 border-emerald-400'
                  : 'hover:bg-slate-800 text-slate-400 border-l-2 border-transparent'
              }`}
              onClick={() => setActiveLevelId(lvl.id)}
            >
              <Layers size={12} className={isActive ? 'text-emerald-400' : 'text-slate-600'} />
              <span className="flex-1 truncate">{lvl.name}</span>
              <span className="text-[10px] text-slate-500 tabular-nums">
                {(lvl.elevationMm / 1000).toFixed(1)}m
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(lvl.id, lvl.name, lvl.elevationMm);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-sky-400"
                title="Edit level"
              >
                <Pencil size={11} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (levels.length > 1) removeLevel(lvl.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 disabled:opacity-0"
                title="Delete level"
                disabled={levels.length <= 1}
              >
                <Trash2 size={11} />
              </button>
            </div>
          );
        })}

        {adding && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 mt-1">
            <input
              autoFocus
              placeholder="Level name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100"
            />
            <input
              type="number"
              placeholder="mm"
              value={draftElevation}
              onChange={(e) => setDraftElevation(e.target.value)}
              className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-100 text-right"
            />
            <button onClick={commitAdd} className="text-emerald-400 hover:text-emerald-300">
              <Check size={13} />
            </button>
            <button onClick={() => setAdding(false)} className="text-slate-500 hover:text-slate-300">
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
