/**
 * EVLab 3D Studio - BIM View & Documentation Engine Panel
 * Controls Views (Plans, Elevations, Sections, 3D), View Range, Detail Levels, Scales, and View Templates.
 */

import React from 'react';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { DEFAULT_VIEW_TEMPLATES } from '../../bim/views/ViewTemplate';
import { Eye, Layers, Compass, Sliders, CheckSquare, Plus, FileText } from 'lucide-react';

export const BIMViewsPanel: React.FC = () => {
  const { viewManager, activeViewId, setActiveView, levels } = useBIMStore();
  const allViews = viewManager.getAllViews();
  const activeView = viewManager.getActiveView();

  const floorPlans = allViews.filter((v) => v.type === 'Floor Plan');
  const elevations = allViews.filter((v) => v.type === 'Elevation');
  const sections = allViews.filter((v) => v.type === 'Section');
  const views3D = allViews.filter((v) => v.type === '3D View');

  const handleTemplateChange = (templateId: string) => {
    if (activeView) {
      viewManager.applyTemplateToView(activeView.id, templateId);
      setActiveView(activeView.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs select-none">
      {/* Top Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
          <Eye className="w-4 h-4" />
          <span>BIM View & Documentation Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Revit-style View Model: Manage Floor Plans, Elevations, Sections, and View Range.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* View Browser */}
        <div className="space-y-3">
          {/* 3D Views */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>3D Views</span>
            </div>
            <div className="space-y-1">
              {views3D.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center justify-between text-[11px] ${
                    activeViewId === v.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{v.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{v.scale}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Floor Plans */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Floor Plans</span>
            </div>
            <div className="space-y-1">
              {floorPlans.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center justify-between text-[11px] ${
                    activeViewId === v.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{v.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{v.scale}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Elevations */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-emerald-400" />
              <span>Building Elevations</span>
            </div>
            <div className="space-y-1">
              {elevations.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center justify-between text-[11px] ${
                    activeViewId === v.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{v.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{v.scale}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>Building Sections</span>
            </div>
            <div className="space-y-1">
              {sections.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center justify-between text-[11px] ${
                    activeViewId === v.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{v.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">{v.scale}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active View Properties & Range */}
        {activeView && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-200">{activeView.name}</span>
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded text-[10px] font-mono">
                {activeView.type}
              </span>
            </div>

            {/* View Template Selector */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-medium">View Template</label>
              <select
                value={activeView.viewTemplateId || ''}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-[11px]"
              >
                <option value="">None (Custom Settings)</option>
                {DEFAULT_VIEW_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scale & Detail Level */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-medium">View Scale</label>
                <input
                  type="text"
                  value={activeView.scale}
                  onChange={(e) => {
                    viewManager.updateView(activeView.id, { scale: e.target.value as any });
                    setActiveView(activeView.id);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-[11px] font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Detail Level</label>
                <select
                  value={activeView.detailLevel}
                  onChange={(e) => {
                    viewManager.updateView(activeView.id, { detailLevel: e.target.value as any });
                    setActiveView(activeView.id);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200 text-[11px]"
                >
                  <option value="Coarse">Coarse</option>
                  <option value="Medium">Medium</option>
                  <option value="Fine">Fine</option>
                </select>
              </div>
            </div>

            {/* View Range (for Floor Plans) */}
            {activeView.viewRange && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                  View Range Settings (mm)
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Top Clip:</span>
                    <input
                      type="number"
                      value={activeView.viewRange.topOffsetMm}
                      onChange={(e) => {
                        const vr = { ...activeView.viewRange!, topOffsetMm: Number(e.target.value) };
                        viewManager.updateView(activeView.id, { viewRange: vr });
                        setActiveView(activeView.id);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Cut Plane:</span>
                    <input
                      type="number"
                      value={activeView.viewRange.cutPlaneOffsetMm}
                      onChange={(e) => {
                        const vr = { ...activeView.viewRange!, cutPlaneOffsetMm: Number(e.target.value) };
                        viewManager.updateView(activeView.id, { viewRange: vr });
                        setActiveView(activeView.id);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bottom Offset:</span>
                    <input
                      type="number"
                      value={activeView.viewRange.bottomOffsetMm}
                      onChange={(e) => {
                        const vr = { ...activeView.viewRange!, bottomOffsetMm: Number(e.target.value) };
                        viewManager.updateView(activeView.id, { viewRange: vr });
                        setActiveView(activeView.id);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">View Depth:</span>
                    <input
                      type="number"
                      value={activeView.viewRange.viewDepthOffsetMm}
                      onChange={(e) => {
                        const vr = { ...activeView.viewRange!, viewDepthOffsetMm: Number(e.target.value) };
                        viewManager.updateView(activeView.id, { viewRange: vr });
                        setActiveView(activeView.id);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
