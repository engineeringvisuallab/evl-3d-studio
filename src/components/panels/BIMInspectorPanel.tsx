/**
 * EVLab 3D Studio - Professional BIM Inspector & Constraint Control Panel (v1.1)
 * Features Revit-style Property Grid, Level Datums, Relationship Tree, IFC 4 Mapping, Traceable Quantities, MEP Connectors, and Health Validator.
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { CENTRAL_MATERIAL_DATABASE } from '../../bim/core/MaterialSystem';
import {
  Building,
  Layers,
  Sliders,
  GitBranch,
  ShieldCheck,
  Globe,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Box,
  Network,
  Maximize2,
  Radio,
  Share2,
  Plus
} from 'lucide-react';

export const BIMInspectorPanel: React.FC = () => {
  const { objects, selectedObjectIds, updateObjectParametric } = useAppStore();
  const {
    elements,
    levels,
    gridLines,
    healthScore,
    validationIssues,
    constraintDiagnostics,
    syncFromSceneObjects,
    updateElementParameter,
    setElementLevel,
    relationshipGraph,
    addConstraintToElement,
    connectorSystem
  } = useBIMStore();

  const [activeTab, setActiveTab] = useState<'params' | 'constraints' | 'dependencies' | 'hosts' | 'mep' | 'quantities' | 'validation'>('params');

  useEffect(() => {
    syncFromSceneObjects(Object.values(objects));
  }, [objects]);

  const selectedObjectId = selectedObjectIds[0];
  const selectedBimElement = selectedObjectId ? elements.get(selectedObjectId) : undefined;
  const selectedSceneObject = Object.values(objects).find((o) => o.id === selectedObjectId);

  if (!selectedObjectId || !selectedBimElement) {
    return (
      <div className="p-4 text-xs text-slate-400 h-full flex flex-col items-center justify-center space-y-3">
        <Building className="w-10 h-10 text-cyan-500/40" />
        <div className="text-center">
          <p className="font-semibold text-slate-200">EVLab BIM Core v1.1</p>
          <p className="text-[11px] text-slate-500 mt-1">Select an engineering element to inspect its BIM schema, constraints & OpenBIM IFC data.</p>
        </div>
        <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 mt-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono text-slate-400">BIM Model Health</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${healthScore >= 90 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
              {healthScore}% Complete
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Elements Modeled:</span>
              <span className="font-mono text-cyan-300 font-bold">{elements.size}</span>
            </div>
            <div className="flex justify-between">
              <span>Building Levels:</span>
              <span className="font-mono text-slate-200">{levels.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Structural Grids:</span>
              <span className="font-mono text-slate-200">{gridLines.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Validation Alerts:</span>
              <span className="font-mono text-amber-400">{validationIssues.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mat = CENTRAL_MATERIAL_DATABASE[selectedBimElement.materialId] || CENTRAL_MATERIAL_DATABASE.mat_concrete;
  const hostId = relationshipGraph.getHost(selectedBimElement.id);
  const hostedIds = relationshipGraph.getHostedElements(selectedBimElement.id);
  const upstreamDeps = relationshipGraph.getUpstreamDependencies(selectedBimElement.id);
  const downstreamDeps = relationshipGraph.getDependents(selectedBimElement.id);
  const connectors = connectorSystem.getConnectorsForElement(selectedBimElement.id);

  return (
    <div className="h-full flex flex-col text-xs text-slate-300 select-none">
      {/* Element Identity Banner */}
      <div className="p-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[9px] font-bold">
                {selectedBimElement.discipline}
              </span>
              <span className="font-bold text-slate-100 text-xs">{selectedBimElement.name}</span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400 mt-0.5 flex items-center space-x-2">
              <span>ID: {selectedBimElement.instanceName}</span>
              <span>•</span>
              <span className="text-slate-400">GUID: {selectedBimElement.globalId.slice(0, 8)}...</span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              {selectedBimElement.ifcMapping.ifcEntity}
            </span>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex space-x-0.5 mt-2.5 bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px] overflow-x-auto scrollbar-none">
          {[
            { id: 'params', label: 'Params', icon: <Sliders className="w-3 h-3" /> },
            { id: 'constraints', label: 'Constraints', icon: <Lock className="w-3 h-3" /> },
            { id: 'dependencies', label: 'Deps', icon: <Network className="w-3 h-3" /> },
            { id: 'hosts', label: 'Hosts', icon: <GitBranch className="w-3 h-3" /> },
            { id: 'mep', label: 'MEP/IFC', icon: <Globe className="w-3 h-3" /> },
            { id: 'quantities', label: 'Quantities', icon: <Calculator className="w-3 h-3" /> },
            { id: 'validation', label: 'Health', icon: <ShieldCheck className="w-3 h-3" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1 py-1 px-1.5 rounded transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* 1. PARAMETERS TAB */}
        {activeTab === 'params' && (
          <div className="space-y-3">
            {/* Level & Phasing Constraints */}
            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Level Datums & Constraints</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="text-[9px] text-slate-500">Base Level</label>
                  <select
                    value={selectedBimElement.baseLevelId || ''}
                    onChange={(e) => setElementLevel(selectedBimElement.id, e.target.value, false)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200 outline-none text-[10px]"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name} ({lvl.elevationM}m)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500">Top Constraint</label>
                  <select
                    value={selectedBimElement.topLevelId || ''}
                    onChange={(e) => setElementLevel(selectedBimElement.id, e.target.value, true)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-slate-200 outline-none text-[10px]"
                  >
                    <option value="">Unconnected</option>
                    {levels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name} ({lvl.elevationM}m)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Instance Parameters */}
            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Sliders className="w-3 h-3 text-yellow-400" />
                <span>Instance Dimensions</span>
              </div>
              <div className="space-y-1.5">
                {Object.values(selectedBimElement.instanceParameters).map((param) => (
                  <div key={param.id} className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-400">{param.name}</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={param.value as number}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updateElementParameter(selectedBimElement.id, param.id, val);
                          if (selectedSceneObject) {
                            if (param.id === 'param_length') updateObjectParametric(selectedSceneObject.id, { length: val });
                            if (param.id === 'param_height') updateObjectParametric(selectedSceneObject.id, { height: val });
                            if (param.id === 'param_thickness') updateObjectParametric(selectedSceneObject.id, { thickness: val });
                          }
                        }}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 font-mono text-cyan-300 text-right outline-none"
                      />
                      <span className="text-[9px] text-slate-500 font-mono w-6">{param.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Material */}
            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Box className="w-3 h-3 text-emerald-400" />
                <span>BIM Material Specification</span>
              </div>
              <div className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">{mat.name}</div>
                <div className="text-[10px] text-slate-400">{mat.description}</div>
                <div className="grid grid-cols-2 gap-1 pt-1 font-mono text-[9px] text-slate-400 border-t border-slate-800">
                  <div>Density: {mat.densityKgM3} kg/m³</div>
                  <div>Strength: {mat.yieldStrengthMPa || 30} MPa</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CONSTRAINTS TAB */}
        {activeTab === 'constraints' && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Active Constraints ({selectedBimElement.constraints?.length || 0})</span>
                </div>
                <button
                  onClick={() => {
                    const newConstraint = {
                      id: `c_align_${Date.now()}`,
                      type: 'Align' as const,
                      targetElementId: selectedBimElement.id,
                      referenceId: 'grid_a',
                      description: 'Aligned to Grid Axis A',
                      isLocked: true,
                      status: 'Satisfied' as const
                    };
                    addConstraintToElement(newConstraint);
                  }}
                  className="px-2 py-0.5 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 font-mono text-[9px] flex items-center space-x-1 border border-cyan-700"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Add Lock</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {selectedBimElement.constraints?.map((c) => (
                  <div key={c.id} className="p-2 rounded bg-slate-950 border border-slate-800 space-y-1 font-mono text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300">{c.type}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${c.status === 'Violated' ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'}`}>
                        {c.status || 'Satisfied'}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[9px]">{c.description || `Target: ${c.targetElementId} ➔ Ref: ${c.referenceId}`}</div>
                    <div className="flex justify-between text-[8px] text-slate-500 pt-0.5">
                      <span>ID: {c.id}</span>
                      <span>{c.isLocked ? '🔒 Locked' : '🔓 Unlocked'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. DEPENDENCIES TAB */}
        {activeTab === 'dependencies' && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Network className="w-3 h-3 text-cyan-400" />
                <span>Parametric Dependency Graph</span>
              </div>

              {/* Upstream Providers */}
              <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Upstream Driving References ({upstreamDeps.length})</div>
                {upstreamDeps.length > 0 ? (
                  upstreamDeps.map((id) => (
                    <div key={id} className="p-1 rounded bg-slate-900 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                      <span>{elements.get(id)?.name || id}</span>
                      <span className="text-[8px] text-slate-500 font-sans">Driver</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-[10px]">Independent root element</div>
                )}
              </div>

              {/* Current Element */}
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800 text-[11px] font-mono text-cyan-300 flex items-center justify-between">
                <span>● {selectedBimElement.name}</span>
                <span className="text-[9px] text-cyan-400 font-sans font-bold">Active Element</span>
              </div>

              {/* Downstream Dependents */}
              <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Downstream Dependent Elements ({downstreamDeps.length})</div>
                {downstreamDeps.length > 0 ? (
                  downstreamDeps.map((id) => (
                    <div key={id} className="p-1 rounded bg-slate-900 text-[10px] font-mono text-emerald-300 flex items-center justify-between">
                      <span>{elements.get(id)?.name || id}</span>
                      <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-[10px]">No dependent children</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. HOSTS & VOIDS TAB */}
        {activeTab === 'hosts' && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <GitBranch className="w-3 h-3 text-cyan-400" />
                <span>Host Walls & Opening Voids</span>
              </div>

              {/* Host relationship */}
              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Structural Host</div>
                {hostId ? (
                  <div className="font-semibold text-cyan-300 mt-0.5 flex items-center space-x-1">
                    <span>Hosted by:</span>
                    <span className="underline">{elements.get(hostId)?.name || hostId}</span>
                  </div>
                ) : (
                  <div className="text-slate-500 italic mt-0.5">Standalone / Self-Hosted</div>
                )}
              </div>

              {/* Hosted child openings */}
              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px]">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Hosted Openings ({hostedIds.length})</div>
                {hostedIds.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {hostedIds.map((cid) => (
                      <div key={cid} className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-between">
                        <span>{elements.get(cid)?.name || cid}</span>
                        <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic mt-0.5">No hosted openings attached.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. MEP CONNECTORS & OPENBIM IFC TAB */}
        {activeTab === 'mep' && (
          <div className="space-y-3">
            {/* MEP Connectors */}
            {connectors.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <Radio className="w-3 h-3 text-cyan-400" />
                  <span>MEP Connection Ports ({connectors.length})</span>
                </div>
                <div className="space-y-1.5">
                  {connectors.map((c) => (
                    <div key={c.id} className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] space-y-1">
                      <div className="flex justify-between font-bold text-cyan-300">
                        <span>{c.type} Port ({c.domain})</span>
                        <span className="text-slate-400">Ø{c.sizeMm}mm</span>
                      </div>
                      <div className="text-slate-500 text-[9px]">System: {c.systemName || 'Standard'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IFC 4 Mapping */}
            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Globe className="w-3 h-3 text-indigo-400" />
                <span>IFC 4 / 4.3 Schema Mapping</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">IFC Class:</span>
                  <span className="text-indigo-400 font-bold">{selectedBimElement.ifcMapping.ifcEntity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFC GlobalId:</span>
                  <span className="text-slate-300 text-[10px]">{selectedBimElement.ifcMapping.ifcGuid}</span>
                </div>
              </div>

              {/* Property Sets */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono uppercase text-slate-400">Attached Property Sets</div>
                {selectedBimElement.ifcMapping.propertySets.map((pset) => (
                  <div key={pset.name} className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] font-mono space-y-1">
                    <div className="font-bold text-cyan-400 border-b border-slate-800 pb-0.5">{pset.name}</div>
                    {Object.entries(pset.properties).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-500">{key}:</span>
                        <span>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. QUANTITIES & FORMULAS TAB */}
        {activeTab === 'quantities' && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Calculator className="w-3 h-3 text-emerald-400" />
                <span>Live Computed Takeoff</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Volume</div>
                  <div className="text-emerald-400 font-bold text-xs">{selectedBimElement.quantities.volumeM3} m³</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Surface Area</div>
                  <div className="text-cyan-400 font-bold text-xs">{selectedBimElement.quantities.surfaceAreaM2} m²</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Length</div>
                  <div className="text-yellow-400 font-bold text-xs">{selectedBimElement.quantities.lengthM} m</div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <div className="text-[9px] text-slate-500">Est. Cost</div>
                  <div className="text-indigo-300 font-bold text-xs">${selectedBimElement.quantities.costTotal}</div>
                </div>
              </div>

              {/* Formulas */}
              {selectedBimElement.formulas && selectedBimElement.formulas.length > 0 && (
                <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] space-y-1 mt-2">
                  <div className="text-slate-500 text-[9px] uppercase">Active Parametric Formulas</div>
                  {selectedBimElement.formulas.map((f) => (
                    <div key={f.id} className="p-1 rounded bg-slate-900 text-cyan-300 text-[9px]">
                      <div className="font-bold">{f.expression}</div>
                      <div className="text-slate-500 text-[8px]">{f.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Engineering Formula Trace */}
              {selectedBimElement.calculationTrace && (
                <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] space-y-1 mt-2">
                  <div className="text-slate-500 text-[9px] uppercase">Calculation Traceability</div>
                  <div className="text-cyan-300 font-bold">{selectedBimElement.calculationTrace.formula}</div>
                  <div className="text-slate-400 text-[9px]">
                    Inputs: {JSON.stringify(selectedBimElement.calculationTrace.inputs)}
                  </div>
                  <div className="text-[8px] text-slate-600">Trace ID: {selectedBimElement.calculationTrace.calcId}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. HEALTH & VALIDATION TAB */}
        {activeTab === 'validation' && (
          <div className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>BIM Quality & Rule Checking</span>
              </div>

              {selectedBimElement.validationStatus === 'Valid' ? (
                <div className="bg-emerald-950/40 border border-emerald-800 p-2.5 rounded text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-[11px]">
                    <p className="font-bold">100% Validated BIM Schema</p>
                    <p className="text-[10px] text-emerald-400/80">No constraint breaks, missing levels, or IFC conflicts.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-950/40 border border-amber-800 p-2.5 rounded text-amber-300 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Rule Warnings Detected</span>
                  </div>
                  <ul className="list-disc list-inside text-[10px] text-amber-200/90 space-y-0.5">
                    {selectedBimElement.validationMessages?.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Constraint Diagnostics */}
              {constraintDiagnostics.length > 0 && (
                <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1 mt-2">
                  <div className="text-[9px] text-slate-500 uppercase font-mono">Constraint Solver Diagnostics</div>
                  {constraintDiagnostics.map((diag, i) => (
                    <div key={i} className="text-[10px] text-amber-300 flex items-start space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span>{diag.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
