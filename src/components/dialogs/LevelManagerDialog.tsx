/**
 * EVLab BIM Core v1.4 - Revit Level & Story Datum Manager Dialog
 * Manage project elevations, story heights, add/delete levels, and live-adjust constrained BIM elements.
 */

import React, { useState } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { BIMLevel } from '../../types';
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Building,
  CheckCircle,
  AlertTriangle,
  X,
  Sparkles,
  Sliders,
  Check,
  Hash
} from 'lucide-react';

export const LevelManagerDialog: React.FC = () => {
  const {
    levels,
    objects,
    isLevelManagerOpen,
    setIsLevelManagerOpen,
    addLevel,
    updateLevel,
    updateLevelElevation,
    removeLevel
  } = useAppStore();

  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [tempElevationMm, setTempElevationMm] = useState<number>(0);
  const [tempName, setTempName] = useState<string>('');
  const [newLevelName, setNewLevelName] = useState<string>('');
  const [newElevationM, setNewElevationM] = useState<number>(10.5);

  if (!isLevelManagerOpen) return null;

  // Count elements per level
  const getElementsCountForLevel = (levelId: string) => {
    const baseCount = objects.filter((o) => o.bim?.baseLevelId === levelId).length;
    const topCount = objects.filter((o) => o.bim?.topLevelId === levelId).length;
    return { baseCount, topCount, total: baseCount + topCount };
  };

  const handleStartEdit = (lvl: BIMLevel) => {
    setEditingLevelId(lvl.id);
    setTempElevationMm(lvl.elevationMm);
    setTempName(lvl.name);
  };

  const handleSaveEdit = (lvl: BIMLevel) => {
    if (tempName.trim()) {
      updateLevel(lvl.id, { name: tempName.trim() });
    }
    if (tempElevationMm !== lvl.elevationMm) {
      updateLevelElevation(lvl.id, tempElevationMm);
    }
    setEditingLevelId(null);
  };

  const handleAddCustomLevel = () => {
    const elevMm = Math.round(newElevationM * 1000);
    const newLvl: BIMLevel = {
      id: `lvl_${Date.now().toString().slice(-6)}`,
      name: newLevelName.trim() || `Level 0${levels.length} (+${newElevationM}m)`,
      elevationM: newElevationM,
      elevationMm: elevMm,
      isStory: true
    };
    addLevel(newLvl);
    setNewLevelName('');
    setNewElevationM(Number((newElevationM + 3.5).toFixed(2)));
  };

  const handleAddAbove = (baseLvl: BIMLevel) => {
    const nextElevMm = baseLvl.elevationMm + 3500;
    const nextElevM = Number((nextElevMm / 1000).toFixed(3));
    const newLvl: BIMLevel = {
      id: `lvl_${Date.now().toString().slice(-6)}`,
      name: `Level 0${levels.length} (+${nextElevM}m)`,
      elevationM: nextElevM,
      elevationMm: nextElevMm,
      isStory: true
    };
    addLevel(newLvl);
  };

  const handleApplyPreset = (presetName: 'residential' | 'commercial' | 'industrial' | 'highrise') => {
    if (!confirm('Apply this Level preset? All level-constrained walls, columns, and slabs will adjust to the new story heights.')) {
      return;
    }

    if (presetName === 'residential') {
      // 3.0m story heights
      updateLevelElevation('lvl_00_found', -500);
      updateLevelElevation('lvl_01_ground', 0);
      updateLevelElevation('lvl_02_first', 3000);
      updateLevelElevation('lvl_03_roof', 6000);
    } else if (presetName === 'commercial') {
      // 3.8m story heights
      updateLevelElevation('lvl_00_found', -600);
      updateLevelElevation('lvl_01_ground', 0);
      updateLevelElevation('lvl_02_first', 3800);
      updateLevelElevation('lvl_03_roof', 7600);
    } else if (presetName === 'industrial') {
      // 5.5m clearance
      updateLevelElevation('lvl_00_found', -800);
      updateLevelElevation('lvl_01_ground', 0);
      updateLevelElevation('lvl_02_first', 5500);
      updateLevelElevation('lvl_03_roof', 11000);
    } else if (presetName === 'highrise') {
      // 3.5m standard stories
      updateLevelElevation('lvl_00_found', -500);
      updateLevelElevation('lvl_01_ground', 0);
      updateLevelElevation('lvl_02_first', 3500);
      updateLevelElevation('lvl_03_roof', 7000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Revit Level & Story Datum Manager</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-mono">
                  Parametric Datum System
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Adjust building story elevations. All constrained walls, columns, slabs, and stairs automatically propagate in 3D.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLevelManagerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Quick Actions */}
        <div className="bg-slate-950/40 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Quick Story Presets:</span>
            <button
              onClick={() => handleApplyPreset('residential')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-cyan-300 rounded text-[11px] font-mono transition border border-slate-700"
            >
              Residential (3.0m)
            </button>
            <button
              onClick={() => handleApplyPreset('commercial')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-cyan-300 rounded text-[11px] font-mono transition border border-slate-700"
            >
              Commercial Office (3.8m)
            </button>
            <button
              onClick={() => handleApplyPreset('industrial')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-cyan-300 rounded text-[11px] font-mono transition border border-slate-700"
            >
              Industrial High-Clear (5.5m)
            </button>
            <button
              onClick={() => handleApplyPreset('highrise')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-cyan-300 rounded text-[11px] font-mono transition border border-slate-700"
            >
              Standard 3.5m Stories
            </button>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Real-time 3D Sync Active</span>
          </div>
        </div>

        {/* Level List Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Level / Story Name</th>
                  <th className="py-2.5 px-3">Elevation (m)</th>
                  <th className="py-2.5 px-3">Elevation (mm)</th>
                  <th className="py-2.5 px-3">Story Height</th>
                  <th className="py-2.5 px-3">Constrained Elements</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {levels.map((lvl, idx) => {
                  const counts = getElementsCountForLevel(lvl.id);
                  const nextLvl = levels[idx + 1];
                  const storyHeightMm = nextLvl ? nextLvl.elevationMm - lvl.elevationMm : null;
                  const isEditing = editingLevelId === lvl.id;

                  return (
                    <tr
                      key={lvl.id}
                      className={`hover:bg-slate-800/50 transition ${
                        lvl.elevationMm === 0 ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      {/* Datum Symbol */}
                      <td className="py-3 px-3">
                        <div className="w-6 h-6 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-cyan-950 text-cyan-300 font-bold text-xs">
                          ⨀
                        </div>
                      </td>

                      {/* Level Name */}
                      <td className="py-3 px-3 font-sans font-semibold">
                        {isEditing ? (
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-slate-100 text-xs w-full outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-100">{lvl.name}</span>
                            {lvl.elevationMm === 0 && (
                              <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded text-[10px] font-mono border border-cyan-500/30">
                                Project Datum (0.00)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Elevation in Meters */}
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={(tempElevationMm / 1000).toFixed(3)}
                            onChange={(e) => setTempElevationMm(Math.round(Number(e.target.value) * 1000))}
                            className="bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-cyan-300 text-xs w-24 font-mono outline-none"
                          />
                        ) : (
                          <span className="text-cyan-300 font-bold">
                            {lvl.elevationM >= 0 ? `+${lvl.elevationM.toFixed(3)} m` : `${lvl.elevationM.toFixed(3)} m`}
                          </span>
                        )}
                      </td>

                      {/* Elevation in Millimeters */}
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            step="50"
                            value={tempElevationMm}
                            onChange={(e) => setTempElevationMm(Number(e.target.value))}
                            className="bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-cyan-300 text-xs w-28 font-mono outline-none"
                          />
                        ) : (
                          <span className="text-slate-300">{lvl.elevationMm} mm</span>
                        )}
                      </td>

                      {/* Story Floor-to-Floor Height */}
                      <td className="py-3 px-3 text-slate-400">
                        {storyHeightMm !== null ? (
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-amber-300 font-medium">
                            {storyHeightMm} mm ({(storyHeightMm / 1000).toFixed(2)}m)
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">Top-most Level</span>
                        )}
                      </td>

                      {/* Constrained Elements */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                          <Building className="w-3 h-3 text-cyan-400" />
                          <span>{counts.total} attached ({counts.baseCount} base / {counts.topCount} top)</span>
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                        {isEditing ? (
                          <button
                            onClick={() => handleSaveEdit(lvl)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition shadow-sm font-sans text-xs font-semibold px-2.5"
                          >
                            Apply Live
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(lvl)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded transition text-[11px]"
                              title="Edit elevation or name"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleAddAbove(lvl)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                              title="Add new story level directly above this datum"
                            >
                              <Plus className="w-3 h-3 text-emerald-400" />
                            </button>
                            {levels.length > 2 && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete ${lvl.name}? Any constrained elements will be reassigned safely.`)) {
                                    removeLevel(lvl.id);
                                  }
                                }}
                                className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded border border-rose-800/60 transition"
                                title="Delete Level"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add New Custom Level Bar */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 mr-4">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Add Story Level:</span>
              </span>
              <input
                type="text"
                placeholder="e.g. Level 04 Mezzanine"
                value={newLevelName}
                onChange={(e) => setNewLevelName(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 flex-1 outline-none focus:border-cyan-500 font-sans"
              />
              <div className="flex items-center space-x-1">
                <span className="text-slate-400 text-xs">Elevation:</span>
                <input
                  type="number"
                  step="0.5"
                  value={newElevationM}
                  onChange={(e) => setNewElevationM(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 w-20 font-mono outline-none"
                />
                <span className="text-slate-400 text-xs font-mono">meters</span>
              </div>
            </div>
            <button
              onClick={handleAddCustomLevel}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded text-xs font-bold transition shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Level Datum</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Total Stories: <span className="font-bold text-slate-200">{levels.length} Levels</span> | Total Height: <span className="font-bold text-cyan-300">{Math.max(...levels.map(l => l.elevationMm)) / 1000} m</span>
          </div>
          <button
            onClick={() => setIsLevelManagerOpen(false)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded font-medium transition"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
};
