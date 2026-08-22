/**
 * EVLab 3D Studio - Left Toolbar
 * Vertical strip of core selection/transform/measure tools. Clicking a
 * button sets useAppStore.activeTool, which ThreeCanvas reads to decide
 * which TransformControls mode (if any) to show for the current selection.
 */

import React from 'react';
import {
  MousePointer2,
  Move3d,
  RotateCw,
  Maximize2,
  ArrowUpDown,
  Ruler,
  MoveHorizontal,
  Scissors,
} from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';
import { ToolType } from '../../types';

interface ToolDef {
  tool: ToolType;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  shortcut?: string;
}

const TOOLS: ToolDef[] = [
  { tool: 'select', icon: MousePointer2, label: 'Select', shortcut: 'Esc' },
  { tool: 'move', icon: Move3d, label: 'Move', shortcut: 'G' },
  { tool: 'rotate', icon: RotateCw, label: 'Rotate', shortcut: 'R' },
  { tool: 'scale', icon: Maximize2, label: 'Scale', shortcut: 'S' },
  { tool: 'pushpull', icon: ArrowUpDown, label: 'Push/Pull', shortcut: 'P' },
  { tool: 'offset', icon: MoveHorizontal, label: 'Offset' },
  { tool: 'measure', icon: Ruler, label: 'Measure' },
  { tool: 'section', icon: Scissors, label: 'Section' },
];

export function LeftToolbar() {
  const activeTool = useAppStore((s) => s.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);

  return (
    <div className="w-12 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-2 gap-1">
      {TOOLS.map(({ tool, icon: Icon, label, shortcut }) => {
        const active = activeTool === tool;
        return (
          <button
            key={tool}
            title={shortcut ? `${label} (${shortcut})` : label}
            onClick={() => setActiveTool(tool)}
            className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
              active
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}
