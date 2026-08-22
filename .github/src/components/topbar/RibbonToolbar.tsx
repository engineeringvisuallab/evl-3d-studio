/**
 * EVLab 3D Studio - Ribbon Quick Actions Toolbar
 */

import React from 'react';
import {
  Box,
  Layers,
  Grid,
  Sun,
  Eye,
  Camera,
  Maximize2,
  Compass,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';
import { UnitType } from '../../types';

export const RibbonToolbar: React.FC<{
  setCameraPreset: (preset: string) => void;
}> = ({ setCameraPreset }) => {
  const {
    viewportMode,
    setViewportMode,
    displayMode,
    setDisplayMode,
    gridVisible,
    setGridVisible,
    shadowsEnabled,
    setShadowsEnabled,
    projectUnits,
    setProjectUnits,
    undo,
    redo
  } = useAppStore();

  return (
    <div className="h-9 bg-slate-900/90 border-b border-slate-800 text-slate-300 flex items-center justify-between px-3 text-xs select-none">
      {/* 2D / 3D Mode Toggle */}
      <div className="flex items-center space-x-1 border-r border-slate-800 pr-3">
        <button
          onClick={() => setViewportMode('3D')}
          className={`px-2.5 py-1 rounded flex items-center space-x-1.5 font-medium transition ${
            viewportMode === '3D'
              ? 'bg-cyan-600 text-white shadow'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D View</span>
        </button>

        <button
          onClick={() => setViewportMode('2D')}
          className={`px-2.5 py-1 rounded flex items-center space-x-1.5 font-medium transition ${
            viewportMode === '2D'
              ? 'bg-cyan-600 text-white shadow'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2D Plan View</span>
        </button>
      </div>

      {/* Display Modes Selector */}
      <div className="flex items-center space-x-1 border-r border-slate-800 pr-3">
        <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">Shading:</span>
        <button
          onClick={() => setDisplayMode('wireframe')}
          className={`px-2 py-0.5 rounded text-[11px] ${
            displayMode === 'wireframe' ? 'bg-slate-700 text-cyan-400 font-semibold' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          Wireframe
        </button>
        <button
          onClick={() => setDisplayMode('shaded')}
          className={`px-2 py-0.5 rounded text-[11px] ${
            displayMode === 'shaded' ? 'bg-slate-700 text-cyan-400 font-semibold' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          Shaded
        </button>
        <button
          onClick={() => setDisplayMode('rendered')}
          className={`px-2 py-0.5 rounded text-[11px] ${
            displayMode === 'rendered' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-semibold' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          Rendered
        </button>
        <button
          onClick={() => setDisplayMode('xray')}
          className={`px-2 py-0.5 rounded text-[11px] ${
            displayMode === 'xray' ? 'bg-slate-700 text-cyan-400 font-semibold' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          X-Ray
        </button>
      </div>

      {/* Camera Presets */}
      <div className="flex items-center space-x-1 border-r border-slate-800 pr-3">
        <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">Camera:</span>
        <button
          onClick={() => setCameraPreset('iso')}
          className="px-2 py-0.5 hover:bg-slate-800 rounded text-[11px] text-slate-300"
        >
          Iso
        </button>
        <button
          onClick={() => setCameraPreset('top')}
          className="px-2 py-0.5 hover:bg-slate-800 rounded text-[11px] text-slate-300"
        >
          Top
        </button>
        <button
          onClick={() => setCameraPreset('front')}
          className="px-2 py-0.5 hover:bg-slate-800 rounded text-[11px] text-slate-300"
        >
          Front
        </button>
        <button
          onClick={() => setCameraPreset('left')}
          className="px-2 py-0.5 hover:bg-slate-800 rounded text-[11px] text-slate-300"
        >
          Left
        </button>
      </div>

      {/* Grid & Shadows Toggles + Units */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setGridVisible(!gridVisible)}
          className={`p-1.5 rounded transition ${
            gridVisible ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle World Grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setShadowsEnabled(!shadowsEnabled)}
          className={`p-1.5 rounded transition ${
            shadowsEnabled ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Toggle Realtime Shadows"
        >
          <Sun className="w-3.5 h-3.5" />
        </button>

        {/* Project Unit Selector */}
        <div className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-500">Unit:</span>
          <select
            value={projectUnits}
            onChange={(e) => setProjectUnits(e.target.value as UnitType)}
            className="bg-transparent text-cyan-400 font-mono text-[11px] outline-none cursor-pointer"
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="m">m</option>
            <option value="in">inch</option>
            <option value="ft">ft</option>
          </select>
        </div>
      </div>
    </div>
  );
};
