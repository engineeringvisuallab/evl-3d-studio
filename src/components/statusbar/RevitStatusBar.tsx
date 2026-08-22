/**
 * EVLab 3D Studio - Bottom Status Bar
 * Live session readout: active tool, selection count, viewport mode
 * (3D/2D) toggle, display mode, and the FPS monitor App.tsx feeds in.
 */

import React from 'react';
import { Activity, Box, Layers, SquareStack } from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';

export function RevitStatusBar() {
  const activeTool = useAppStore((s) => s.activeTool);
  const selectedIds = useAppStore((s) => s.selectedIds);
  const fps = useAppStore((s) => s.fps);
  const viewportMode = useAppStore((s) => s.viewportMode);
  const setViewportMode = useAppStore((s) => s.setViewportMode);
  const objectCount = useAppStore((s) => Object.keys(s.objects).length);
  const activeLevelName = useAppStore(
    (s) => s.levels.find((l) => l.id === s.activeLevelId)?.name ?? '—'
  );

  const fpsColor = fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="h-7 shrink-0 bg-slate-900 border-t border-slate-800 flex items-center px-3 gap-4 text-[11px] text-slate-500">
      <span className="flex items-center gap-1">
        <Layers size={12} className="text-emerald-400" />
        <span className="text-slate-300">{activeLevelName}</span>
      </span>

      <span className="capitalize">
        Tool: <span className="text-slate-300">{activeTool}</span>
      </span>

      <span className="flex items-center gap-1">
        <Box size={12} />
        {objectCount} object{objectCount === 1 ? '' : 's'}
      </span>

      <span>
        Selected: <span className="text-slate-300">{selectedIds.length}</span>
      </span>

      <div className="flex-1" />

      <button
        onClick={() => setViewportMode(viewportMode === '3D' ? '2D' : '3D')}
        className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300"
      >
        <SquareStack size={12} />
        {viewportMode}
      </button>

      <span className={`flex items-center gap-1 ${fpsColor}`}>
        <Activity size={12} />
        {fps} FPS
      </span>
    </div>
  );
}
