/**
 * EVLab 3D Studio - Professional Engineering Status Bar
 */

import React from 'react';
import { useAppStore } from '../../state/useAppStore';
import { Crosshair, Box, Layers, Activity } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const {
    cursorCoords,
    activeTool,
    selectedObjectIds,
    objects,
    activeInferenceText,
    projectUnits,
    fps,
    snappingEnabled,
    setSnappingEnabled
  } = useAppStore();

  const selectedCount = selectedObjectIds.length;
  const selectedObjName =
    selectedCount === 1
      ? objects.find((o) => o.id === selectedObjectIds[0])?.name || '1 Object'
      : selectedCount > 1
      ? `${selectedCount} Objects Selected`
      : 'None';

  return (
    <div className="h-6 bg-slate-950 border-t border-slate-800 text-slate-400 flex items-center justify-between px-3 text-[10px] font-mono select-none z-50">
      {/* Left: Active Tool & Selection Summary */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
          <Activity className="w-3 h-3" />
          <span className="uppercase">Tool: {activeTool}</span>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-300">
          <Box className="w-3 h-3 text-slate-500" />
          <span>Selected: {selectedObjName}</span>
        </div>

        {activeInferenceText && (
          <div className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
            Snap: {activeInferenceText}
          </div>
        )}
      </div>

      {/* Center: Live Cursor Coordinates (X, Y, Z) */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800/80 px-2.5 py-0.5 rounded text-slate-200 font-bold">
        <Crosshair className="w-3 h-3 text-emerald-400" />
        <span>
          X: <span className="text-red-400">{Math.round(cursorCoords.x)}</span> Y:{' '}
          <span className="text-emerald-400">{Math.round(cursorCoords.y)}</span> Z:{' '}
          <span className="text-cyan-400">{Math.round(cursorCoords.z)}</span> {projectUnits}
        </span>
      </div>

      {/* Right: Snap Toggle, FPS, Total Objects */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSnappingEnabled(!snappingEnabled)}
          className={`px-1.5 py-0.2 rounded ${
            snappingEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-600'
          }`}
        >
          {snappingEnabled ? 'Snapping ON' : 'Snapping OFF'}
        </button>

        <span>Objects: {objects.length}</span>
        <span className="text-emerald-400">{fps} FPS</span>
      </div>
    </div>
  );
};
