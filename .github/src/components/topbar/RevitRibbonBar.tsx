/**
 * EVLab 3D Studio - Revit-style Ribbon Bar
 * Tabbed ribbon (Architecture / Structure / Civil / Modify / Annotate /
 * View) grouping ToolType buttons by discipline, plus named camera presets
 * on the View tab. Placing/creating actual geometry for the discipline
 * tools (wall, column, pipe, ...) is a later "Sketch/Creation Engine"
 * phase - for now these buttons set the active tool so the option bar and
 * status bar reflect the current mode.
 */

import React, { useState } from 'react';
import {
  Building2,
  ContainerIcon,
  Ruler,
  Type as TypeIcon,
  Eye,
  Wrench,
  DoorOpen,
  RectangleHorizontal,
  Columns3,
  Layers3,
  Waves,
  Fuel,
  Milestone,
  MoveHorizontal,
  RotateCw,
  Maximize2,
  ArrowUpDown,
  Combine,
  Paintbrush,
} from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';
import { ToolType } from '../../types';

interface RevitRibbonBarProps {
  setCameraPreset: (preset: string) => void;
}

interface RibbonTool {
  tool: ToolType;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}

const TABS: { id: string; label: string; icon: React.ComponentType<{ size?: number }>; tools: RibbonTool[] }[] = [
  {
    id: 'architecture',
    label: 'Architecture',
    icon: Building2,
    tools: [
      { tool: 'wall', icon: RectangleHorizontal, label: 'Wall' },
      { tool: 'door', icon: DoorOpen, label: 'Door' },
      { tool: 'window', icon: Columns3, label: 'Window' },
      { tool: 'slab', icon: Layers3, label: 'Floor' },
    ],
  },
  {
    id: 'structure',
    label: 'Structure',
    icon: Columns3,
    tools: [
      { tool: 'column', icon: Columns3, label: 'Column' },
      { tool: 'beam', icon: RectangleHorizontal, label: 'Beam' },
    ],
  },
  {
    id: 'civil',
    label: 'Civil / MEP',
    icon: Waves,
    tools: [
      { tool: 'pipe', icon: Waves, label: 'Pipe' },
      { tool: 'road', icon: Milestone, label: 'Road' },
      { tool: 'tank', icon: Fuel, label: 'Tank' },
    ],
  },
  {
    id: 'modify',
    label: 'Modify',
    icon: Wrench,
    tools: [
      { tool: 'move', icon: MoveHorizontal, label: 'Move' },
      { tool: 'rotate', icon: RotateCw, label: 'Rotate' },
      { tool: 'scale', icon: Maximize2, label: 'Scale' },
      { tool: 'pushpull', icon: ArrowUpDown, label: 'Push/Pull' },
      { tool: 'boolean', icon: Combine, label: 'Boolean' },
      { tool: 'paint', icon: Paintbrush, label: 'Paint' },
    ],
  },
  {
    id: 'annotate',
    label: 'Annotate',
    icon: TypeIcon,
    tools: [
      { tool: 'dimension', icon: Ruler, label: 'Dimension' },
      { tool: 'measure', icon: Ruler, label: 'Measure' },
      { tool: 'text', icon: TypeIcon, label: 'Text' },
    ],
  },
];

const CAMERA_VIEWS = ['top', 'front', 'back', 'left', 'right', 'iso'];

export function RevitRibbonBar({ setCameraPreset }: RevitRibbonBarProps) {
  const [activeTab, setActiveTab] = useState<string>('architecture');
  const activeTool = useAppStore((s) => s.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);

  const currentTab = activeTab === 'view' ? null : TABS.find((t) => t.id === activeTab);

  return (
    <div className="shrink-0 bg-slate-900 border-b border-slate-800">
      {/* Tab strip */}
      <div className="flex items-center px-2 border-b border-slate-800/60">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => setActiveTab('view')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px ${
            activeTab === 'view'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Eye size={13} />
          View
        </button>
      </div>

      {/* Tool group row */}
      <div className="flex items-center gap-1 px-2 py-1.5 min-h-[52px]">
        {currentTab &&
          currentTab.tools.map(({ tool, icon: Icon, label }) => {
            const active = activeTool === tool;
            return (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded text-[10px] ${
                  active ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}

        {activeTab === 'view' &&
          CAMERA_VIEWS.map((view) => (
            <button
              key={view}
              onClick={() => setCameraPreset(view)}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded text-[10px] text-slate-300 hover:bg-slate-800 capitalize"
            >
              <ContainerIcon size={18} />
              {view}
            </button>
          ))}
      </div>
    </div>
  );
}
