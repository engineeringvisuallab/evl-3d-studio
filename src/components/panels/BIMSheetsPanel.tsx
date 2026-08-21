/**
 * EVLab 3D Studio - Professional BIM Sheets & Documentation 2.0 Panel
 * Interactive Drawing Sheet Manager with Title Blocks, Project Revisions, and Viewports.
 */

import React, { useState } from 'react';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { Layout, Plus, FileText, Layers, CheckCircle2, Sliders } from 'lucide-react';

export const BIMSheetsPanel: React.FC = () => {
  const { sheetEngine, activeSheetId, setActiveSheet, viewManager } = useBIMStore();
  const sheets = sheetEngine.getAllSheets();
  const currentSheet = sheetEngine.getSheet(activeSheetId) || sheets[0];

  const [editTitleBlock, setEditTitleBlock] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs select-none">
      {/* Top Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
          <Layout className="w-4 h-4" />
          <span>BIM Sheets & Documentation 2.0</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Revit-style Drawing Sheets with Title Blocks, Revisions & Viewports.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Sheet Selector */}
        <div>
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-1 flex items-center justify-between">
            <span>Drawing Sheets</span>
            <span className="text-cyan-400 font-mono">{sheets.length} Sheets</span>
          </div>
          <div className="space-y-1">
            {sheets.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSheet(s.id)}
                className={`w-full text-left px-2.5 py-2 rounded transition flex items-center justify-between text-[11px] ${
                  currentSheet?.id === s.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono px-1.5 py-0.5 bg-slate-900 rounded text-cyan-400 font-bold border border-slate-700">
                    {s.sheetNumber}
                  </span>
                  <span>{s.sheetName}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{s.size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Sheet Details */}
        {currentSheet && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="font-mono text-cyan-400 font-bold mr-2">{currentSheet.sheetNumber}</span>
                <span className="font-bold text-slate-200">{currentSheet.sheetName}</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-semibold">
                {currentSheet.titleBlock.status}
              </span>
            </div>

            {/* Title Block Metadata */}
            <div className="space-y-2 text-[11px]">
              <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold flex justify-between items-center">
                <span>Title Block Data</span>
                <button
                  onClick={() => setEditTitleBlock(!editTitleBlock)}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 underline"
                >
                  {editTitleBlock ? 'Done' : 'Edit'}
                </button>
              </div>

              {editTitleBlock ? (
                <div className="space-y-2 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400">Project Name:</span>
                    <input
                      type="text"
                      value={currentSheet.titleBlock.projectName}
                      onChange={(e) => {
                        sheetEngine.updateSheet(currentSheet.id, {
                          titleBlock: { ...currentSheet.titleBlock, projectName: e.target.value }
                        });
                        setActiveSheet(currentSheet.id);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Drawn By:</span>
                      <input
                        type="text"
                        value={currentSheet.titleBlock.drawnBy}
                        onChange={(e) => {
                          sheetEngine.updateSheet(currentSheet.id, {
                            titleBlock: { ...currentSheet.titleBlock, drawnBy: e.target.value }
                          });
                          setActiveSheet(currentSheet.id);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Revision:</span>
                      <input
                        type="text"
                        value={currentSheet.titleBlock.revision}
                        onChange={(e) => {
                          sheetEngine.updateSheet(currentSheet.id, {
                            titleBlock: { ...currentSheet.titleBlock, revision: e.target.value }
                          });
                          setActiveSheet(currentSheet.id);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Project:</span>
                    <span className="font-medium text-slate-200">{currentSheet.titleBlock.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client:</span>
                    <span className="text-slate-300">{currentSheet.titleBlock.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Drawn / Checked:</span>
                    <span className="text-slate-300">{currentSheet.titleBlock.drawnBy} / {currentSheet.titleBlock.checkedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Rev:</span>
                    <span className="font-mono text-cyan-300">{currentSheet.titleBlock.date} ({currentSheet.titleBlock.revision})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Placed Viewports */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold flex justify-between items-center">
                <span>Placed Viewports</span>
                <span className="text-slate-400 font-mono">{currentSheet.viewports.length}</span>
              </div>

              {currentSheet.viewports.map((vp) => (
                <div key={vp.id} className="p-2 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">{vp.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Scale: {vp.scale}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-cyan-300 rounded font-mono text-[10px]">
                    #{vp.detailNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
