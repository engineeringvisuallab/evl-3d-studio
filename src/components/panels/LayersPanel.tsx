/**
 * EVLab 3D Studio - Layers & Tags Manager Panel
 */

import React, { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { Layers, Eye, EyeOff, Lock, Unlock, Plus } from 'lucide-react';

export const LayersPanel: React.FC = () => {
  const {
    layers,
    activeLayerId,
    setActiveLayerId,
    toggleLayerVisibility,
    toggleLayerLock,
    addLayer
  } = useAppStore();

  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerColor, setNewLayerColor] = useState('#3b82f6');

  const handleAddLayer = () => {
    if (!newLayerName.trim()) return;
    addLayer(newLayerName, newLayerColor);
    setNewLayerName('');
  };

  return (
    <div className="p-3 text-xs space-y-4 overflow-y-auto max-h-full text-slate-300">
      <div className="border-b border-slate-800 pb-2">
        <span className="font-semibold text-slate-200">Layers & Visibility Tags</span>
      </div>

      <div className="space-y-1.5">
        {layers.map((l) => {
          const isActive = activeLayerId === l.id;
          return (
            <div
              key={l.id}
              onClick={() => setActiveLayerId(l.id)}
              className={`flex items-center justify-between p-2 rounded border cursor-pointer transition ${
                isActive
                  ? 'bg-slate-800 border-cyan-500 shadow ring-1 ring-cyan-400/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                <span className="font-semibold text-slate-200 truncate">{l.name}</span>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(l.id);
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {l.visible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerLock(l.id);
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {l.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-600" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Layer */}
      <div className="border-t border-slate-800 pt-3 space-y-2">
        <div className="font-semibold text-slate-200">Add New Tag Layer</div>
        <div className="flex space-x-2">
          <input
            type="color"
            value={newLayerColor}
            onChange={(e) => setNewLayerColor(e.target.value)}
            className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
          />
          <input
            type="text"
            placeholder="Tag Layer Name..."
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs flex-1 outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleAddLayer}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded font-semibold text-xs flex items-center"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
