/**
 * EVLab 3D Studio - Outliner Scene Graph Panel
 */

import React from 'react';
import { useAppStore } from '../../state/useAppStore';
import { Eye, EyeOff, Lock, Unlock, Box, Group } from 'lucide-react';

export const OutlinerPanel: React.FC = () => {
  const { objects, selectedObjectIds, selectObject, updateObject, groupSelectedObjects } = useAppStore();

  return (
    <div className="p-3 text-xs space-y-3 overflow-y-auto max-h-full text-slate-300">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-semibold text-slate-200">Scene Hierarchy</span>
        <button
          onClick={groupSelectedObjects}
          disabled={selectedObjectIds.length < 2}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
            selectedObjectIds.length >= 2
              ? 'bg-cyan-600 text-white shadow'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Group className="w-3 h-3" />
          <span>Group Selected</span>
        </button>
      </div>

      <div className="space-y-1">
        {Object.values(objects).map((obj) => {
          const isSelected = selectedObjectIds.includes(obj.id);

          return (
            <div
              key={obj.id}
              onClick={(e) => selectObject(obj.id, e.shiftKey || e.ctrlKey)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition ${
                isSelected
                  ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-500/50'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <Box className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-medium truncate">{obj.name}</span>
                <span className="text-[9px] font-mono bg-slate-900 px-1 py-0.2 rounded text-slate-500">
                  {obj.category}
                </span>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateObject(obj.id, { visible: !obj.visible });
                  }}
                  className="p-1 hover:text-white text-slate-400"
                >
                  {obj.visible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateObject(obj.id, { locked: !obj.locked });
                  }}
                  className="p-1 hover:text-white text-slate-400"
                >
                  {obj.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-600" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
