/**
 * EVLab 3D Studio - PBR Engineering Materials Palette & Editor
 */

import React, { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { Palette, Plus, Check } from 'lucide-react';
import { MaterialDef } from '../../types';

export const MaterialsPanel: React.FC = () => {
  const { materials, activeMaterialId, setActiveMaterialId, addMaterial } = useAppStore();

  const [newMatName, setNewMatName] = useState('');
  const [newMatColor, setNewMatColor] = useState('#3b82f6');

  const handleCreateMaterial = () => {
    if (!newMatName.trim()) return;
    const mat: MaterialDef = {
      id: 'mat_' + Date.now(),
      name: newMatName,
      color: newMatColor,
      metalness: 0.2,
      roughness: 0.5,
      opacity: 1,
      transparent: false,
      wireframe: false,
      category: 'Custom'
    };
    addMaterial(mat);
    setNewMatName('');
  };

  return (
    <div className="p-3 text-xs space-y-4 overflow-y-auto max-h-full text-slate-300">
      <div className="border-b border-slate-800 pb-2">
        <span className="font-semibold text-slate-200">Engineering PBR Material Library</span>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-2 gap-2">
        {materials.map((mat) => {
          const isActive = activeMaterialId === mat.id;
          return (
            <button
              key={mat.id}
              onClick={() => setActiveMaterialId(mat.id)}
              className={`p-2 rounded border text-left flex items-center space-x-2 transition ${
                isActive
                  ? 'bg-slate-800 border-cyan-500 shadow ring-1 ring-cyan-400/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                className="w-5 h-5 rounded-full border border-slate-700 shrink-0 shadow-inner"
                style={{ backgroundColor: mat.color }}
              />
              <div className="truncate">
                <div className="font-semibold text-slate-200 truncate text-[11px]">{mat.name}</div>
                <div className="text-[9px] text-slate-500 font-mono">{mat.category}</div>
              </div>
              {isActive && <Check className="w-3.5 h-3.5 text-cyan-400 ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Add Custom Material */}
      <div className="border-t border-slate-800 pt-3 space-y-2">
        <div className="font-semibold text-slate-200">Create Custom PBR Material</div>
        <div className="flex space-x-2">
          <input
            type="color"
            value={newMatColor}
            onChange={(e) => setNewMatColor(e.target.value)}
            className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
          />
          <input
            type="text"
            placeholder="Material Name..."
            value={newMatName}
            onChange={(e) => setNewMatName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs flex-1 outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleCreateMaterial}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded font-semibold text-xs flex items-center"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
