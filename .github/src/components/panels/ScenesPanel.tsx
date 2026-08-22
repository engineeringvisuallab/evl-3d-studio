/**
 * EVLab 3D Studio - Saved Scenes & Viewpoints Manager
 */

import React, { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { Camera, Plus, Play } from 'lucide-react';

export const ScenesPanel: React.FC<{ setCameraPreset: (preset: string) => void }> = ({ setCameraPreset }) => {
  const { savedScenes, saveCurrentScene } = useAppStore();
  const [sceneName, setSceneName] = useState('');

  const handleSaveScene = () => {
    if (!sceneName.trim()) return;
    saveCurrentScene(
      sceneName,
      { x: 12000, y: 10000, z: 14000 },
      { x: 0, y: 0, z: 0 }
    );
    setSceneName('');
  };

  return (
    <div className="p-3 text-xs space-y-4 overflow-y-auto max-h-full text-slate-300">
      <div className="border-b border-slate-800 pb-2">
        <span className="font-semibold text-slate-200">Saved Camera Scenes & Views</span>
      </div>

      <div className="space-y-2">
        {savedScenes.map((s) => (
          <div
            key={s.id}
            className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between hover:border-slate-700 transition"
          >
            <div className="flex items-center space-x-2">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-200">{s.name}</span>
            </div>

            <button
              onClick={() => setCameraPreset(s.name.includes('Top') ? 'top' : 'iso')}
              className="p-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold text-[10px] flex items-center space-x-1"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Jump</span>
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 pt-3 space-y-2">
        <div className="font-semibold text-slate-200">Save Active View as Scene</div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Scene Name (e.g., Level 01 Plan)..."
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs flex-1 outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSaveScene}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 rounded font-semibold text-xs flex items-center"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
