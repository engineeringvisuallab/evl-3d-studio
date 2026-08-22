/**
 * EVLab 3D Studio - Right Dock (Revit-style multi-panel browser)
 * A tabbed sidebar so every BIM sub-system - properties, project browser,
 * levels, layers, materials, family catalog, saved views, 5D cost, 6D
 * assets, and BOQ quantities - is reachable from one dock, the way Revit's
 * Properties + Project Browser panes surface the whole model.
 */

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Building2,
  ListTree,
  Layers as LayersIcon,
  Palette,
  PackagePlus,
  Camera,
  DollarSign,
  Wrench,
  FileSpreadsheet,
} from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';
import { BuildingLevelsPanel } from './BuildingLevelsPanel';
import { EntityPropertiesPanel } from './EntityPropertiesPanel';
import { BIMInspectorPanel } from './BIMInspectorPanel';
import { OutlinerPanel } from './OutlinerPanel';
import { LayersPanel } from './LayersPanel';
import { MaterialsPanel } from './MaterialsPanel';
import { ComponentsCatalogPanel } from './ComponentsCatalogPanel';
import { ScenesPanel } from './ScenesPanel';
import { BIM5DCostPanel } from './BIM5DCostPanel';
import { BIM6DAssetPanel } from './BIM6DAssetPanel';
import { BimQuantitiesPanel } from './BimQuantitiesPanel';
import { LevelManagerDialog } from '../dialogs/LevelManagerDialog';

interface RightSidebarProps {
  setCameraPreset: (preset: string) => void;
}

type DockTab =
  | 'properties'
  | 'inspector'
  | 'outliner'
  | 'levels'
  | 'layers'
  | 'materials'
  | 'catalog'
  | 'scenes'
  | 'cost'
  | 'assets'
  | 'quantities';

const TABS: { id: DockTab; label: string; icon: React.ReactNode }[] = [
  { id: 'properties', label: 'Properties', icon: <Sliders size={14} /> },
  { id: 'inspector', label: 'BIM Inspector', icon: <Building2 size={14} /> },
  { id: 'outliner', label: 'Project Browser', icon: <ListTree size={14} /> },
  { id: 'levels', label: 'Levels', icon: <LayersIcon size={14} /> },
  { id: 'layers', label: 'Layers', icon: <LayersIcon size={14} /> },
  { id: 'materials', label: 'Materials', icon: <Palette size={14} /> },
  { id: 'catalog', label: 'Family Catalog', icon: <PackagePlus size={14} /> },
  { id: 'scenes', label: 'Saved Views', icon: <Camera size={14} /> },
  { id: 'cost', label: '5D Cost', icon: <DollarSign size={14} /> },
  { id: 'assets', label: '6D Assets', icon: <Wrench size={14} /> },
  { id: 'quantities', label: 'BOQ / Quantities', icon: <FileSpreadsheet size={14} /> },
];

export function RightSidebar({ setCameraPreset }: RightSidebarProps) {
  const selectedObjectIds = useAppStore((s) => s.selectedObjectIds);
  const setIsLevelManagerOpen = useAppStore((s) => s.setIsLevelManagerOpen);
  const [activeTab, setActiveTab] = useState<DockTab>('properties');
  const [lastSelectionCount, setLastSelectionCount] = useState(0);

  // Auto-jump to Properties the moment something gets newly selected, so
  // picking an object in the viewport always shows its data immediately.
  useEffect(() => {
    if (selectedObjectIds.length > 0 && lastSelectionCount === 0) {
      setActiveTab('properties');
    }
    setLastSelectionCount(selectedObjectIds.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedObjectIds.length]);

  const renderTab = () => {
    switch (activeTab) {
      case 'properties':
        return selectedObjectIds.length > 0 ? (
          <EntityPropertiesPanel />
        ) : (
          <div className="p-6 text-center text-slate-500 text-xs">
            Select an object in the viewport or Project Browser to edit its properties.
          </div>
        );
      case 'inspector':
        return <BIMInspectorPanel />;
      case 'outliner':
        return <OutlinerPanel />;
      case 'levels':
        return (
          <div className="flex flex-col">
            <BuildingLevelsPanel />
            <button
              onClick={() => setIsLevelManagerOpen(true)}
              className="m-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-semibold transition"
            >
              Manage Levels…
            </button>
          </div>
        );
      case 'layers':
        return <LayersPanel />;
      case 'materials':
        return <MaterialsPanel />;
      case 'catalog':
        return <ComponentsCatalogPanel />;
      case 'scenes':
        return <ScenesPanel setCameraPreset={setCameraPreset} />;
      case 'cost':
        return <BIM5DCostPanel />;
      case 'assets':
        return <BIM6DAssetPanel />;
      case 'quantities':
        return <BimQuantitiesPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="w-80 shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col text-slate-300">
      {/* Tab strip */}
      <div className="grid grid-cols-6 gap-0.5 p-1 border-b border-slate-800 bg-slate-950/60">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded transition ${
                isActive
                  ? 'bg-cyan-600/20 text-cyan-300 ring-1 ring-cyan-500/50'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.icon}
            </button>
          );
        })}
      </div>
      <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {TABS.find((t) => t.id === activeTab)?.label}
        {selectedObjectIds.length > 1 && (
          <span className="ml-2 normal-case font-normal text-slate-400">
            {selectedObjectIds.length} objects selected
          </span>
        )}
      </div>

      {/* Active tab content */}
      <div className="flex-1 overflow-y-auto">{renderTab()}</div>

      {/* Level Manager modal, opened from the Levels tab */}
      <LevelManagerDialog />
    </div>
  );
}
