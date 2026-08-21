/**
 * EVLab 3D Studio - Contextual Options Bar
 * Revit's "Options Bar" sits directly under the ribbon and changes based on
 * the active tool. For now it surfaces the current tool + display mode +
 * edit mode - richer per-tool options (chain, offset value, radius, etc.)
 * land alongside the Sketch/Creation Engine in a later phase.
 */

import React from 'react';
import { useAppStore } from '../../state/useAppStore';
import { DisplayMode, EditModeType } from '../../types';

const DISPLAY_MODES: DisplayMode[] = [
  'wireframe',
  'solid',
  'shaded',
  'material',
  'rendered',
  'xray',
  'hiddenline',
  'monochrome',
];

const EDIT_MODES: EditModeType[] = ['object', 'vertex', 'edge', 'face'];

export function RevitOptionsBar() {
  const activeTool = useAppStore((s) => s.activeTool);
  const displayMode = useAppStore((s) => s.displayMode);
  const setDisplayMode = useAppStore((s) => s.setDisplayMode);
  const editMode = useAppStore((s) => s.editMode);
  const setEditMode = useAppStore((s) => s.setEditMode);

  return (
    <div className="h-8 shrink-0 bg-slate-900/60 border-b border-slate-800 flex items-center px-3 gap-4 text-xs text-slate-400">
      <span className="uppercase tracking-wide text-slate-500">
        Tool: <span className="text-slate-200 normal-case">{activeTool}</span>
      </span>

      <div className="flex items-center gap-1">
        <span className="text-slate-500">Edit mode:</span>
        <select
          value={editMode}
          onChange={(e) => setEditMode(e.target.value as EditModeType)}
          className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200"
        >
          {EDIT_MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-slate-500">Display:</span>
        <select
          value={displayMode}
          onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
          className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200"
        >
          {DISPLAY_MODES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
