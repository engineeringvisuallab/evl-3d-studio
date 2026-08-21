/**
 * EVLab 3D Studio - Structural Analytical & MEP System Engineering Panel
 * Controls Analytical Nodes/Members/Surfaces, boundary conditions, and MEP Systems routing & diagnostics.
 */

import React, { useState } from 'react';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { Activity, GitBranch, Cpu, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const BIMStructuralMEPPanel: React.FC = () => {
  const {
    analyticalModel,
    activeDisplayMode,
    setDisplayMode,
    mepSystemManager,
    connectorSystem,
    mepDiagnostics,
    routeMEP
  } = useBIMStore();

  const [activeSubTab, setActiveSubTab] = useState<'structural' | 'mep'>('structural');
  const systems = mepSystemManager.getAllSystems();

  const analyticalNodes = Array.from(analyticalModel.nodes.values());
  const analyticalMembers = Array.from(analyticalModel.members.values());

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs select-none">
      {/* Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
            <Activity className="w-4 h-4" />
            <span>Structure & MEP Engine</span>
          </div>
          {/* Display Mode Switcher */}
          <div className="flex bg-slate-900 border border-slate-800 rounded p-0.5 text-[10px]">
            {(['Physical', 'Analytical', 'Overlay'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDisplayMode(mode)}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  activeDisplayMode === mode
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-800 text-[11px] gap-2">
          <button
            onClick={() => setActiveSubTab('structural')}
            className={`pb-1.5 font-bold transition border-b-2 ${
              activeSubTab === 'structural'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Structural Analytical ({analyticalMembers.length} Members)
          </button>
          <button
            onClick={() => setActiveSubTab('mep')}
            className={`pb-1.5 font-bold transition border-b-2 ${
              activeSubTab === 'mep'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            MEP Systems ({systems.length} Systems)
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeSubTab === 'structural' ? (
          <div className="space-y-3">
            {/* Structural Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Nodes</span>
                <span className="text-sm font-bold font-mono text-cyan-400">{analyticalNodes.length}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Members</span>
                <span className="text-sm font-bold font-mono text-cyan-400">{analyticalMembers.length}</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Surfaces</span>
                <span className="text-sm font-bold font-mono text-cyan-400">{analyticalModel.surfaces.size}</span>
              </div>
            </div>

            {/* Structural Members List */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                Analytical 1D Framing Members
              </div>
              {analyticalMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-2 bg-slate-950 border border-slate-800 rounded space-y-1 text-[11px]"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{m.type}: {m.id}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-cyan-300 rounded">
                      {m.sectionProfile}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Axial EA: {(m.axialStiffnessEA_kN / 1000).toLocaleString()} MN</span>
                    <span>Bending EI: {m.bendingStiffnessEI_kNm2.toLocaleString()} kNm²</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Diagnostics */}
            {analyticalModel.diagnostics.length > 0 && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Structural Integrity Diagnostics</span>
                </div>
                {analyticalModel.diagnostics.map((d, idx) => (
                  <p key={idx} className="text-[10px] text-amber-200/90 pl-5">
                    • {d.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* MEP Systems Overview */}
            <div className="space-y-2">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
                Classified MEP Distribution Systems
              </div>
              {systems.map((sys) => (
                <div
                  key={sys.id}
                  className="p-2.5 bg-slate-950 border border-slate-800 rounded space-y-1.5 text-[11px]"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sys.colorHex }}
                      />
                      <span className="font-bold text-slate-200">{sys.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {sys.systemType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded">
                    {sys.flowRateL_s && <div>Flow: {sys.flowRateL_s} L/s</div>}
                    {sys.airVolumeM3_h && <div>Air: {sys.airVolumeM3_h} m³/h</div>}
                    {sys.designVelocityM_s && <div>Velocity: {sys.designVelocityM_s} m/s</div>}
                    {sys.headLossKPa && <div>Head Loss: {sys.headLossKPa} kPa</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* MEP Diagnostics */}
            {mepDiagnostics.length > 0 && (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded space-y-1.5">
                <div className="flex items-center justify-between text-slate-300 font-bold text-[11px]">
                  <span>MEP Connection & Port Audits</span>
                  <span className="text-cyan-400 font-mono">{mepDiagnostics.length} Alerts</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {mepDiagnostics.map((d, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-slate-900 rounded border border-slate-800/80 text-[10px] space-y-0.5"
                    >
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-200">{d.elementId}</span>
                        <span
                          className={`font-semibold ${
                            d.severity === 'Error'
                              ? 'text-rose-400'
                              : d.severity === 'Warning'
                              ? 'text-amber-400'
                              : 'text-cyan-400'
                          }`}
                        >
                          {d.severity}
                        </span>
                      </div>
                      <p className="text-slate-400">{d.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
