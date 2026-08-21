/**
 * EVLab BIM Core v1.3 - Unified Project Intelligence Dashboard Panel
 * Cross-domain executive KPI command center unifying 4D Schedule, 5D Cost/EVM, 6D Assets, BCF, and BIM Health.
 */

import React from 'react';
import { useBIMStore } from '../../bim/BIMCoreStore';
import {
  Activity,
  DollarSign,
  Calendar,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Award,
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export const BIMProjectIntelligencePanel: React.FC = () => {
  const {
    getProjectIntelligenceKPIs,
    rateDatabase,
    activeCurrency,
    setActiveBIMTab
  } = useBIMStore();

  const kpis = getProjectIntelligenceKPIs();

  const formatMoney = (valUSD: number) => {
    return rateDatabase.formatCurrency(valUSD, activeCurrency);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs select-none overflow-y-auto p-3 space-y-3">
      {/* Executive Command Header */}
      <div className="p-3 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-lg space-y-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">Project Intelligence Center</div>
              <div className="text-[10px] text-slate-400">4D Time · 5D Cost · 6D Assets · OpenBIM</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold font-mono text-cyan-400">
              {kpis.overallProjectHealthScore}%
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-mono">BIM Index Score</div>
          </div>
        </div>
      </div>

      {/* 4-Domain Primary Health Cards */}
      <div className="grid grid-cols-2 gap-2">
        {/* Card 1: 4D Schedule */}
        <div
          onClick={() => setActiveBIMTab('4d_time')}
          className="p-2.5 bg-slate-950 border border-slate-800 hover:border-cyan-500 rounded-md cursor-pointer transition space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-1 text-cyan-400">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">4D Schedule</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </div>
          <div className="text-base font-bold font-mono text-slate-100">
            {kpis.progressSummary.overallProgressPercent}%
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between font-mono">
            <span>Completed: {kpis.progressSummary.completedActivitiesCount}</span>
            <span>Active: {kpis.progressSummary.inProgressActivitiesCount}</span>
          </div>
        </div>

        {/* Card 2: 5D Cost / EVM */}
        <div
          onClick={() => setActiveBIMTab('5d_cost')}
          className="p-2.5 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-md cursor-pointer transition space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-1 text-emerald-400">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">5D Cost & EVM</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">
            CPI: {kpis.evm.cpi} · SPI: {kpis.evm.spi}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            EV: {formatMoney(kpis.evm.earnedValueUSD)}
          </div>
        </div>

        {/* Card 3: 6D Assets */}
        <div
          onClick={() => setActiveBIMTab('6d_assets')}
          className="p-2.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-md cursor-pointer transition space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-1 text-indigo-400">
              <Wrench className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">6D Asset / FM</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </div>
          <div className="text-base font-bold font-mono text-slate-100">
            {kpis.totalAssetsCount} Assets
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {kpis.operationalAssetsCount} Active · {kpis.pendingMaintenanceCount} PMs
          </div>
        </div>

        {/* Card 4: Digital Handover */}
        <div
          onClick={() => setActiveBIMTab('6d_assets')}
          className="p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-500 rounded-md cursor-pointer transition space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-1 text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">Handover Ready</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </div>
          <div className="text-base font-bold font-mono text-amber-400">
            {kpis.handoverReport.overallScorePercent}% Ready
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            COBie Validated
          </div>
        </div>
      </div>

      {/* Critical Milestone & Issue Tracker */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-md space-y-2">
        <span className="font-semibold text-slate-200">Construction Milestones & Risk Radar</span>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="p-2 bg-slate-900/80 rounded border border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200">Phase 1 Substructure & Foundations</span>
            </div>
            <span className="text-emerald-400 font-bold">100% DONE</span>
          </div>

          <div className="p-2 bg-slate-900/80 rounded border border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-slate-200">Phase 2 Superstructure Framing (L1-L3)</span>
            </div>
            <span className="text-amber-400 font-bold">65% ACTIVE</span>
          </div>

          <div className="p-2 bg-slate-900/80 rounded border border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-200">Phase 3 Building Services MEP Rough-In</span>
            </div>
            <span className="text-cyan-400 font-bold">30% ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
