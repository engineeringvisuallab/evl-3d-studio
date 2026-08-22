/**
 * EVLab BIM Core v1.3 - 6D Asset & Facility Management (FM) Panel
 * Master Asset Registry, Preventive Maintenance (PM), Warranty Tracking, COBie Data & Handover Compliance.
 */

import React, { useState } from 'react';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { AssetCategory, AssetOperationalStatus, BIMAsset } from '../../bim/assets/Asset';
import {
  Wrench,
  ShieldCheck,
  FileCheck2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  Layers,
  FileText,
  Search,
  ExternalLink,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';

export const BIM6DAssetPanel: React.FC = () => {
  const {
    assetRegister,
    rateDatabase,
    activeCurrency,
    updateMaintenanceTaskStatus,
    updateHandoverChecklistItem
  } = useBIMStore();

  const { setSelectedObjectIds, objects } = useAppStore();

  const [activeTab, setActiveTab] = useState<'assets' | 'maintenance' | 'warranties' | 'handover'>('assets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>('ast_ahu_01');

  const assets = assetRegister.getAllAssets();
  const maintenanceTasks = assetRegister.getMaintenanceEngine().getAllTasks();
  const handoverChecklist = assetRegister.getHandoverChecklist();

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.tagCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  const formatMoney = (valUSD: number) => {
    return rateDatabase.formatCurrency(valUSD, activeCurrency);
  };

  const handleSelectAssetInViewport = (elementId: string) => {
    // Find matching SceneObject in app store
    const obj = Object.values(objects).find((o) => o.id === elementId || o.name.toLowerCase().includes('ahu') || o.name.toLowerCase().includes('pump'));
    if (obj) {
      setSelectedObjectIds([obj.id]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs select-none">
      {/* 6D Header */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-indigo-600/20 text-indigo-400">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                <span>6D Asset & FM Intelligence</span>
                <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded font-mono">v1.3</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Active FM Assets: <span className="text-indigo-400 font-bold">{assets.length} Registered</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
            98.5% Uptime
          </span>
        </div>

        {/* Sub Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded border border-slate-800/80">
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'assets' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Assets ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'maintenance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Work Orders
          </button>
          <button
            onClick={() => setActiveTab('warranties')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'warranties' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Warranties
          </button>
          <button
            onClick={() => setActiveTab('handover')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'handover' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Handover
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TAB 1: Asset Register */}
        {activeTab === 'assets' && (
          <div className="space-y-3">
            {/* Search & Category Filter */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search assets (AHU, Pump, MDB)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 text-[11px]"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 text-[11px]"
              >
                <option value="All">All Disciplines</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Architectural">Architectural</option>
              </select>
            </div>

            {/* Asset List */}
            <div className="space-y-1.5">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    handleSelectAssetInViewport(asset.elementId);
                  }}
                  className={`p-2 rounded border transition cursor-pointer ${
                    selectedAssetId === asset.id
                      ? 'bg-slate-800/90 border-indigo-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-indigo-400 font-bold">{asset.tagCode}</span>
                      <span className="font-medium text-slate-100">{asset.name}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">
                      {asset.operationalStatus}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{asset.locationRoom}</span>
                    <span>{asset.manufacturer}</span>
                    <span className="text-emerald-400 font-bold">{formatMoney(asset.replacementCostUSD)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Asset Deep Details */}
            {selectedAsset && (
              <div className="p-3 bg-slate-950 border border-indigo-900/50 rounded-md space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-bold text-slate-100 text-[13px]">{selectedAsset.name}</span>
                    <div className="text-[10px] text-indigo-400 font-mono">
                      Tag: {selectedAsset.tagCode} · Serial: {selectedAsset.serialNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectAssetInViewport(selectedAsset.elementId)}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded flex items-center space-x-1 text-[10px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Focus 3D</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Manufacturer & Model</span>
                    <span className="font-medium text-slate-200">{selectedAsset.manufacturer}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{selectedAsset.modelNumber}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Location & System</span>
                    <span className="font-medium text-slate-200">{selectedAsset.locationRoom}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{selectedAsset.systemName}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Expected Lifetime</span>
                    <span className="font-mono text-slate-200">{selectedAsset.expectedLifeYears} Years</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Next Maintenance</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedAsset.nextMaintenanceDate}</span>
                  </div>
                </div>

                {/* COBie Type Attributes */}
                <div className="border-t border-slate-800 pt-2 space-y-1">
                  <span className="font-semibold text-slate-300 text-[10px] uppercase">COBie Parameters</span>
                  <div className="space-y-0.5 text-[10px] font-mono">
                    {Object.entries(selectedAsset.cobieAttributes).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-0.5 bg-slate-900 px-1.5 rounded">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-slate-200">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Maintenance Work Orders */}
        {activeTab === 'maintenance' && (
          <div className="space-y-3">
            <span className="font-semibold text-slate-200">Scheduled Preventive Maintenance (PM)</span>
            <div className="space-y-2">
              {maintenanceTasks.map((task) => (
                <div key={task.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-md space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-100">{task.taskName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' :
                      task.status === 'Overdue' ? 'bg-rose-950 text-rose-400 animate-pulse' :
                      'bg-amber-950 text-amber-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Freq: {task.frequency}</span>
                    <span>Due: <span className="text-amber-300 font-bold">{task.nextDueDate}</span></span>
                    <span>Cost: {formatMoney(task.estimatedCostUSD)}</span>
                  </div>

                  {/* Checkpoints */}
                  <div className="space-y-0.5 text-[10px] text-slate-400 bg-slate-900/60 p-1.5 rounded">
                    {task.checkpoints.slice(0, 2).map((cp, idx) => (
                      <div key={idx} className="flex items-center space-x-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-slate-500" />
                        <span>{cp}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-2 pt-1 border-t border-slate-900">
                    <button
                      onClick={() => updateMaintenanceTaskStatus(task.id, 'Completed', new Date().toISOString().split('T')[0])}
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-medium"
                    >
                      Sign-off Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Warranties */}
        {activeTab === 'warranties' && (
          <div className="space-y-2">
            <span className="font-semibold text-slate-200">Equipment Warranties & SLAs</span>
            <div className="space-y-2">
              {assets.map((a) => (
                <div key={a.warranty.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-slate-100">{a.tagCode} · {a.name}</span>
                      <div className="text-[10px] text-indigo-400">{a.warranty.provider}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {a.warranty.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">{a.warranty.terms}</p>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Start: {a.warranty.startDate}</span>
                    <span>Expires: <span className="text-cyan-400 font-bold">{a.warranty.endDate}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Digital Handover */}
        {activeTab === 'handover' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">Digital Handover Readiness Checklist</span>
              <span className="text-[10px] font-bold text-emerald-400 font-mono">83% Ready</span>
            </div>

            <div className="space-y-1.5">
              {handoverChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => updateHandoverChecklistItem(item.id, !item.isComplete)}
                  className="p-2 bg-slate-950 border border-slate-800 rounded flex items-center justify-between cursor-pointer hover:border-slate-700"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={item.isComplete}
                      onChange={() => {}}
                      className="accent-indigo-600 rounded"
                    />
                    <div>
                      <div className="font-medium text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.category} · {item.responsibleParty}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {item.documentCount} docs
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
