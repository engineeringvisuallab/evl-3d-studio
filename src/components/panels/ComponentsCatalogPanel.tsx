/**
 * EVLab 3D Studio - Preset Engineering & Revit BIM Components Library
 */

import React from 'react';
import { useAppStore } from '../../state/useAppStore';
import {
  Building,
  Columns,
  Pipette,
  Layers,
  Container,
  Plus,
  Square,
  DoorOpen,
  AppWindow,
  Triangle,
  Footprints,
  Wind
} from 'lucide-react';
import { ObjectCategory, SceneObject } from '../../types';

export const ComponentsCatalogPanel: React.FC = () => {
  const { addObject, activeLayerId, layers } = useAppStore();

  /** Fills in the transform/visibility/layer scaffolding every SceneObject needs,
   * so each catalog preset only has to specify the BIM-meaningful fields. */
  const place = (
    partial: Omit<SceneObject, 'id' | 'rotation' | 'scale' | 'visible' | 'locked' | 'layerId'>
  ) => {
    const id = `${partial.parametric.type}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    addObject({
      id,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      locked: false,
      layerId: activeLayerId ?? layers[0]?.id ?? 'layer_default',
      ...partial,
    });
  };

  const presets = [
    // --- Architecture ---
    {
      name: 'Exterior Cavity Wall (250mm)',
      discipline: 'Architecture',
      category: 'Architectural' as ObjectCategory,
      icon: <Building className="w-4 h-4 text-emerald-400" />,
      action: () =>
        place({
          name: 'Exterior Brick Wall (8m)',
          category: 'Architectural',
          discipline: 'Architecture',
          position: { x: 0, y: 1500, z: 0 },
          parametric: { type: 'wall', width: 250, height: 3000, length: 8000 },
          materialId: 'mat_brick',
          bim: {
            objectId: 'WAL-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'Exterior Wall 250mm Brick',
            category: 'Architectural',
            family: 'Basic Wall',
            typeName: '250mm Insulated Brick',
            material: 'Red Facing Brick',
            level: 'Level 01 Ground',
            phase: 'New Construction',
            costEstimate: 2800,
            loadBearing: true,
            customProperties: { 'Thermal Transmittance': '0.18 W/m²K', 'Fire Rating': '2 Hours' }
          }
        })
    },
    {
      name: 'Single Flush Door (900x2100mm)',
      discipline: 'Architecture',
      category: 'Architectural' as ObjectCategory,
      icon: <DoorOpen className="w-4 h-4 text-amber-400" />,
      action: () =>
        place({
          name: 'Single Flush Door (900x2100)',
          category: 'Architectural',
          discipline: 'Architecture',
          position: { x: 0, y: 0, z: 0 },
          parametric: { type: 'door', width: 900, height: 2100, thickness: 150 },
          materialId: 'mat_wood',
          bim: {
            objectId: 'DR-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'Timber Flush Door',
            category: 'Architectural',
            family: 'Single-Flush',
            typeName: '0915 x 2134 mm',
            material: 'Timber Framing',
            level: 'Level 01 Ground',
            phase: 'New Construction',
            costEstimate: 450,
            customProperties: { 'Acoustic Rating': '32 dB', 'Hardware': 'Lever Handle' }
          }
        })
    },
    {
      name: 'Casement Window (1200x1500mm)',
      discipline: 'Architecture',
      category: 'Architectural' as ObjectCategory,
      icon: <AppWindow className="w-4 h-4 text-sky-400" />,
      action: () =>
        place({
          name: 'Double Glazed Window (1200x1500)',
          category: 'Architectural',
          discipline: 'Architecture',
          position: { x: 0, y: 900, z: 0 },
          parametric: { type: 'window', width: 1200, height: 1500, thickness: 100 },
          materialId: 'mat_glass',
          bim: {
            objectId: 'WN-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'Double Glazed Casement',
            category: 'Architectural',
            family: 'Casement 2x2',
            typeName: '1200 x 1500 mm',
            material: 'Architectural Glass',
            level: 'Level 01 Ground',
            phase: 'New Construction',
            costEstimate: 620,
            customProperties: { 'Solar Heat Gain': '0.35', 'U-Factor': '1.4' }
          }
        })
    },
    {
      name: 'Concrete Stairs (16 Risers)',
      discipline: 'Architecture',
      category: 'Architectural' as ObjectCategory,
      icon: <Footprints className="w-4 h-4 text-teal-400" />,
      action: () =>
        place({
          name: 'Cast-in-Place Concrete Stairs',
          category: 'Architectural',
          discipline: 'Architecture',
          position: { x: 0, y: 0, z: 0 },
          parametric: { type: 'stairs', width: 1200, height: 3000, length: 4500, riserCount: 16 },
          materialId: 'mat_concrete',
          bim: {
            objectId: 'STR-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'Monolithic Concrete Stair',
            category: 'Architectural',
            family: 'Assembled Stair',
            typeName: 'Cast-In-Place 1200mm Run',
            material: 'Structural Concrete',
            level: 'Level 01 Ground',
            phase: 'New Construction',
            costEstimate: 3200,
            customProperties: { 'Riser Height': '187.5 mm', 'Tread Depth': '280 mm' }
          }
        })
    },
    {
      name: 'Parametric Sloped Roof',
      discipline: 'Architecture',
      category: 'Architectural' as ObjectCategory,
      icon: <Triangle className="w-4 h-4 text-purple-400" />,
      action: () =>
        place({
          name: 'Sloped Hip Roof (10x8m)',
          category: 'Architectural',
          discipline: 'Architecture',
          position: { x: 0, y: 3500, z: 0 },
          parametric: { type: 'roof', width: 10000, length: 8000, height: 2200 },
          materialId: 'mat_brick',
          bim: {
            objectId: 'RF-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'Insulated Metal Roof',
            category: 'Architectural',
            family: 'Basic Roof',
            typeName: 'Standing Seam Metal',
            material: 'Red Facing Brick',
            level: 'Level 03 Roof',
            phase: 'New Construction',
            costEstimate: 5400,
            customProperties: { 'Pitch Slope': '25 deg', 'Thermal Resistance': '0.14 W/m²K' }
          }
        })
    },

    // --- Structure ---
    {
      name: 'Spread Footing Pad (1.8x1.8m)',
      discipline: 'Structure',
      category: 'Structure' as ObjectCategory,
      icon: <Square className="w-4 h-4 text-slate-400" />,
      action: () =>
        place({
          name: 'Isolated Spread Footing F1',
          category: 'Structure',
          discipline: 'Structure',
          position: { x: 0, y: 0, z: 0 },
          parametric: { type: 'footing', width: 1800, length: 1800, thickness: 500 },
          materialId: 'mat_concrete',
          bim: {
            objectId: 'FTG-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'RC Pad Footing 1800x1800',
            category: 'Structure',
            family: 'Structural Foundation',
            typeName: '1800x1800x500mm Pad',
            material: 'Structural Concrete',
            level: 'Level 00 Foundation',
            phase: 'New Construction',
            costEstimate: 850,
            customProperties: { 'Bearing Capacity': '250 kPa', 'Concrete Grade': 'C35/45' }
          }
        })
    },
    {
      name: 'RC Column (500x500mm)',
      discipline: 'Structure',
      category: 'Structure' as ObjectCategory,
      icon: <Columns className="w-4 h-4 text-cyan-400" />,
      action: () =>
        place({
          name: 'RC Column 500x500',
          category: 'Structure',
          discipline: 'Structure',
          position: { x: 0, y: 1500, z: 0 },
          parametric: { type: 'column', width: 500, height: 3000, length: 500 },
          materialId: 'mat_concrete',
          bim: {
            objectId: 'COL-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'Square RC Column C500',
            category: 'Structure',
            family: 'Concrete-Rectangular-Column',
            typeName: '500 x 500 mm',
            material: 'Structural Concrete',
            level: 'Level 01 Ground',
            phase: 'New Construction',
            costEstimate: 1200,
            loadBearing: true,
            customProperties: { 'Rebar': '8x H25 Main + H10 Ties @ 150', 'Axial Capacity': '3200 kN' }
          }
        })
    },
    {
      name: 'Steel I-Beam (IPE 300 - 6m)',
      discipline: 'Structure',
      category: 'Structure' as ObjectCategory,
      icon: <Square className="w-4 h-4 text-red-400" />,
      action: () =>
        place({
          name: 'Steel Beam IPE 300',
          category: 'Structure',
          discipline: 'Structure',
          position: { x: 0, y: 3000, z: 0 },
          parametric: { type: 'beam', width: 300, height: 500, length: 6000 },
          materialId: 'mat_steel',
          bim: {
            objectId: 'BM-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'Structural Steel Girder',
            category: 'Structure',
            family: 'Universal Beam',
            typeName: 'UB 305x165x40',
            material: 'Structural Steel',
            level: 'Level 01 Ground',
            phase: 'New Construction',
            costEstimate: 1650,
            customProperties: { 'Steel Grade': 'S355 JR', 'Section Modulus': '650 cm³' }
          }
        })
    },
    {
      name: 'Reinforced Concrete Slab (200mm)',
      discipline: 'Structure',
      category: 'Structure' as ObjectCategory,
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      action: () =>
        place({
          name: 'Suspended Floor Slab (8x6m)',
          category: 'Structure',
          discipline: 'Structure',
          position: { x: 0, y: 3000, z: 0 },
          parametric: { type: 'slab', width: 8000, length: 6000, thickness: 200 },
          materialId: 'mat_concrete',
          bim: {
            objectId: 'SLB-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'Floor Slab 200mm',
            category: 'Structure',
            family: 'Floor',
            typeName: '200mm RC Suspended',
            material: 'Structural Concrete',
            level: 'Level 02 First Floor',
            phase: 'New Construction',
            costEstimate: 3800,
            customProperties: { 'Live Load Design': '3.0 kN/m²', 'Cover Depth': '30 mm' }
          }
        })
    },

    // --- MEP Services ---
    {
      name: 'HVAC Air Duct (600x400mm)',
      discipline: 'MEP',
      category: 'Mechanical' as ObjectCategory,
      icon: <Wind className="w-4 h-4 text-blue-400" />,
      action: () =>
        place({
          name: 'HVAC Supply Air Duct',
          category: 'Mechanical',
          discipline: 'MEP',
          position: { x: 0, y: 2600, z: 0 },
          parametric: { type: 'duct', width: 600, height: 400, length: 6000 },
          materialId: 'mat_steel',
          bim: {
            objectId: 'DCT-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'Rectangular Supply Duct',
            category: 'Mechanical',
            family: 'Ducts',
            typeName: '600x400mm Galvanized',
            material: 'Structural Steel',
            level: 'Level 01 Ground',
            phase: 'New Construction',
            costEstimate: 980,
            customProperties: { 'Airflow': '1200 L/s', 'Velocity': '5.0 m/s' }
          }
        })
    },
    {
      name: 'HDPE Water Supply Pipe (DN200)',
      discipline: 'MEP',
      category: 'Water' as ObjectCategory,
      icon: <Pipette className="w-4 h-4 text-sky-400" />,
      action: () =>
        place({
          name: 'HDPE Pipe DN200',
          category: 'Water',
          discipline: 'MEP',
          position: { x: 0, y: 200, z: 0 },
          parametric: { type: 'pipe', diameter: 200, length: 10000 },
          materialId: 'mat_hdpe',
          bim: {
            objectId: 'PIP-' + Math.floor(Math.random() * 900 + 100),
            globalId: Math.random().toString(36).substring(2, 10),
            name: 'HDPE Water Pipe DN200',
            category: 'Water',
            family: 'Pipes',
            typeName: 'DN200 PE100 SDR11',
            material: 'HDPE Water Pipe',
            level: 'Level 01 Ground',
            phase: 'New Construction',
            flowRate: 35.0,
            pressure: 16.0,
            costEstimate: 2100,
            customProperties: { 'Joint Type': 'Butt Fusion', 'Pressure Rating': 'PN16' }
          }
        })
    }
  ];

  return (
    <div className="p-3 text-xs space-y-3 overflow-y-auto max-h-full text-slate-300 select-none">
      <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
        <span className="font-bold text-slate-100">Revit BIM Family Library</span>
        <span className="text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
          {presets.length} Types
        </span>
      </div>

      <div className="space-y-1.5">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={preset.action}
            className="w-full bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/60 p-2.5 rounded-lg flex items-center justify-between text-left transition group shadow-sm"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-slate-900 rounded group-hover:scale-110 transition">
                {preset.icon}
              </div>
              <div>
                <div className="font-bold text-slate-200 group-hover:text-cyan-300 transition text-[11px]">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {preset.discipline} • {preset.category}
                </div>
              </div>
            </div>
            <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
          </button>
        ))}
      </div>
    </div>
  );
};
