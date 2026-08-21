/**
 * EVLab BIM Core v1.3 - 5D Cost & Earned Value (EVM) Intelligence Panel
 * Full BOQ Breakdown, Rate Database, Multi-Currency Converter, EVM Dashboard, S-Curve & Change Orders.
 */

import React, { useState } from 'react';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { CurrencyCode, CURRENCY_RATES } from '../../bim/cost/RateDatabase';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw
} from 'lucide-react';

export const BIM5DCostPanel: React.FC = () => {
  const {
    costEngine,
    rateDatabase,
    changeOrderEngine,
    timelineEngine,
    activeCurrency,
    setActiveCurrency,
    createChangeOrder,
    updateChangeOrderStatus
  } = useBIMStore();

  const [activeTab, setActiveTab] = useState<'boq' | 'evm' | 'scurve' | 'rates' | 'change_orders'>('evm');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [isCreatingCO, setIsCreatingCO] = useState(false);
  const [coTitle, setCoTitle] = useState('');
  const [coReason, setCoReason] = useState('');
  const [coOrigQty, setCoOrigQty] = useState(100);
  const [coRevQty, setCoRevQty] = useState(125);

  const activities = timelineEngine.getAllActivities();
  const kpis = useBIMStore.getState().getProjectIntelligenceKPIs();
  const evm = kpis.evm;
  const sCurve = kpis.sCurve;
  const costItems = costEngine.getAllCostItems();
  const disciplineSummaries = costEngine.getDisciplineSummaries();
  const changeOrders = changeOrderEngine.getAllChangeOrders();

  const formatMoney = (valUSD: number) => {
    return rateDatabase.formatCurrency(valUSD, activeCurrency);
  };

  const handleCreateCO = () => {
    if (!coTitle.trim()) return;
    const rateUSD = 75; // average unit rate
    createChangeOrder(
      coTitle,
      coReason,
      'Lead Project Quantity Surveyor',
      ['elem_wall_north', 'elem_wall_south'],
      ['act_09_walls_ext'],
      Number(coOrigQty),
      Number(coRevQty),
      'm2',
      Number(coOrigQty) * rateUSD,
      Number(coRevQty) * rateUSD
    );
    setIsCreatingCO(false);
    setCoTitle('');
    setCoReason('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs select-none">
      {/* 5D Header */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-emerald-600/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                <span>5D Cost & EVM Intelligence</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono">v1.3</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Total Model Cost: <span className="text-emerald-400 font-bold">{formatMoney(kpis.totalProjectCostUSD || 450000)}</span>
              </div>
            </div>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-0.5 rounded">
            {(['USD', 'BDT', 'EUR', 'GBP'] as CurrencyCode[]).map((cur) => (
              <button
                key={cur}
                onClick={() => setActiveCurrency(cur)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  activeCurrency === cur ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1 rounded border border-slate-800/80">
          <button
            onClick={() => setActiveTab('evm')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'evm' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EVM KPIs
          </button>
          <button
            onClick={() => setActiveTab('boq')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'boq' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BOQ Items
          </button>
          <button
            onClick={() => setActiveTab('scurve')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'scurve' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            S-Curve
          </button>
          <button
            onClick={() => setActiveTab('change_orders')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'change_orders' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CO ({changeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'rates' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rates
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* TAB 1: EVM Dashboard */}
        {activeTab === 'evm' && (
          <div className="space-y-3">
            {/* Primary KPI 4-Box */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-md">
                <span className="text-[10px] text-slate-500 block">Cost Performance Index (CPI)</span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`text-lg font-bold font-mono ${evm.cpi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {evm.cpi}
                  </span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded">
                    {evm.cpi >= 1.0 ? 'Under Budget' : 'Over Budget'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-md">
                <span className="text-[10px] text-slate-500 block">Schedule Performance (SPI)</span>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`text-lg font-bold font-mono ${evm.spi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {evm.spi}
                  </span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded">
                    {evm.spi >= 1.0 ? 'Ahead/On Time' : 'Behind Sched'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-md">
                <span className="text-[10px] text-slate-500 block">Earned Value (EV)</span>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {formatMoney(evm.earnedValueUSD)}
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-md">
                <span className="text-[10px] text-slate-500 block">Actual Cost (AC)</span>
                <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                  {formatMoney(evm.actualCostUSD)}
                </div>
              </div>
            </div>

            {/* Detailed EVM Metrics Table */}
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-md space-y-2">
              <span className="font-semibold text-slate-200">EVM Metrics Summary</span>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Planned Value (PV / BCWS)</span>
                  <span className="text-slate-200">{formatMoney(evm.plannedValueUSD)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Budget at Completion (BAC)</span>
                  <span className="text-slate-200">{formatMoney(evm.budgetAtCompletionUSD)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Cost Variance (CV = EV - AC)</span>
                  <span className={evm.costVarianceUSD >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {formatMoney(evm.costVarianceUSD)}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Schedule Variance (SV = EV - PV)</span>
                  <span className={evm.scheduleVarianceUSD >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {formatMoney(evm.scheduleVarianceUSD)}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Estimate at Completion (EAC)</span>
                  <span className="text-amber-400 font-bold">{formatMoney(evm.estimateAtCompletionUSD)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Estimate to Complete (ETC)</span>
                  <span className="text-cyan-400 font-bold">{formatMoney(evm.estimateToCompleteUSD)}</span>
                </div>
              </div>
            </div>

            {/* Discipline Breakdown */}
            <div className="space-y-1.5">
              <span className="font-semibold text-slate-200">Discipline Cost Rollups</span>
              <div className="space-y-1">
                {disciplineSummaries.map((disc) => (
                  <div key={disc.discipline} className="p-2 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-200">{disc.discipline}</div>
                      <div className="text-[10px] text-slate-500">{disc.itemsCount} BIM Items</div>
                    </div>
                    <div className="font-mono text-emerald-400 font-bold">
                      {formatMoney(disc.grandTotalUSD || 85000)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOQ Items */}
        {activeTab === 'boq' && (
          <div className="space-y-2">
            <span className="font-semibold text-slate-200">Bill of Quantities (BOQ) Model Items</span>
            <div className="space-y-1.5">
              {costItems.map((item) => (
                <div key={item.id} className="p-2 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-200">{item.description}</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {formatMoney(item.breakdown.totalCostUSD)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Qty: {item.breakdown.quantity} {item.unit}</span>
                    <span>Code: {item.costCode}</span>
                    <span>Trace: {item.breakdown.formulaTraceId.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: S-Curve Time Phased Chart */}
        {activeTab === 'scurve' && (
          <div className="space-y-3">
            <span className="font-semibold text-slate-200">Cumulative Time-Phased S-Curve</span>
            <div className="space-y-1">
              {sCurve.map((pt) => {
                const maxVal = sCurve[sCurve.length - 1]?.forecastCumulativeUSD || 500000;
                const plannedWidth = Math.min(100, (pt.plannedCumulativeUSD / maxVal) * 100);
                const actualWidth = Math.min(100, (pt.actualCumulativeUSD / maxVal) * 100);

                return (
                  <div key={pt.date} className="p-2 bg-slate-950 border border-slate-800 rounded space-y-1 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-bold text-slate-100">{pt.label}</span>
                      <span>Plan: <span className="text-cyan-400">${pt.plannedCumulativeUSD.toLocaleString()}</span> · Actual: <span className="text-emerald-400">${pt.actualCumulativeUSD.toLocaleString()}</span></span>
                    </div>
                    {/* Visual S-Curve Dual Bar */}
                    <div className="w-full bg-slate-900 h-2 rounded overflow-hidden relative">
                      <div className="h-full bg-cyan-600/60 rounded" style={{ width: `${plannedWidth}%` }} />
                      {pt.actualCumulativeUSD > 0 && (
                        <div className="h-full bg-emerald-500 rounded absolute top-0" style={{ width: `${actualWidth}%` }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Change Orders */}
        {activeTab === 'change_orders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Change Orders (CO Log)</span>
              <button
                onClick={() => setIsCreatingCO(!isCreatingCO)}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New CO</span>
              </button>
            </div>

            {/* Creation Form */}
            {isCreatingCO && (
              <div className="p-3 bg-slate-950 border border-emerald-600/50 rounded-md space-y-2">
                <div className="font-semibold text-emerald-400">Issue Change Order</div>
                <div>
                  <label className="text-[10px] text-slate-400">Change Title</label>
                  <input
                    type="text"
                    value={coTitle}
                    onChange={(e) => setCoTitle(e.target.value)}
                    placeholder="e.g. Wall Height Modification +500mm"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Reason / Justification</label>
                  <input
                    type="text"
                    value={coReason}
                    onChange={(e) => setCoReason(e.target.value)}
                    placeholder="Client architectural revision"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-1">
                  <button onClick={() => setIsCreatingCO(false)} className="px-2 py-1 bg-slate-800 rounded text-slate-300">
                    Cancel
                  </button>
                  <button onClick={handleCreateCO} className="px-2 py-1 bg-emerald-600 text-white rounded font-medium">
                    Submit CO
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {changeOrders.map((co) => (
                <div key={co.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-md space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-emerald-400 font-bold">{co.code}</span>
                      <span className="font-medium text-slate-100">{co.title}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      co.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      co.status === 'Pending Review' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {co.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">{co.reason}</p>

                  <div className="flex justify-between text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-1">
                    <span>Delta Qty: <span className="text-cyan-400">+{co.deltaQuantity} {co.unit}</span></span>
                    <span>Cost Impact: <span className="text-emerald-400 font-bold">+{formatMoney(co.deltaCostUSD)}</span></span>
                  </div>

                  {co.status === 'Pending Review' && (
                    <div className="flex justify-end space-x-1.5 pt-1">
                      <button
                        onClick={() => updateChangeOrderStatus(co.id, 'Approved', 'Project Manager')}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[10px]"
                      >
                        Approve CO
                      </button>
                      <button
                        onClick={() => updateChangeOrderStatus(co.id, 'Rejected')}
                        className="px-2 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-[10px]"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Unit Rate Database */}
        {activeTab === 'rates' && (
          <div className="space-y-2">
            <span className="font-semibold text-slate-200">Centralized Unit Rate Catalog</span>
            <div className="space-y-1.5">
              {rateDatabase.getAllRates().map((r) => (
                <div key={r.id} className="p-2 bg-slate-950 border border-slate-800 rounded space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-200">{r.description}</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {formatMoney(r.materialRateUSD + r.labourRateUSD + r.equipmentRateUSD)} / {r.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Mat: ${r.materialRateUSD} · Lab: ${r.labourRateUSD} · Equip: ${r.equipmentRateUSD}</span>
                    <span>Waste: {r.wastePercent}% · OH: {r.overheadPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
