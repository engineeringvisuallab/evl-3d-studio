/**
 * EVLab 3D Studio - BIM Bill of Quantities (BOQ) & Estimating Panel
 */

import React from 'react';
import { useAppStore } from '../../state/useAppStore';
import { calculateObjectMetrics } from '../../core/geometry/geometryBuilder';
import { Building, DollarSign, Activity, FileSpreadsheet } from 'lucide-react';

export const BimQuantitiesPanel: React.FC = () => {
  const { objects } = useAppStore();

  let totalVolumeM3 = 0;
  let totalCostEstimate = 0;
  let totalPipeLengthM = 0;

  const categoryTotals: Record<string, { count: number; volume: number; cost: number }> = {};

  objects.forEach((obj) => {
    if (!obj.visible) return;
    const metrics = calculateObjectMetrics(obj.parametric, obj.scale);
    const cost = obj.bim.costEstimate || 0;

    totalVolumeM3 += metrics.volumeM3;
    totalCostEstimate += cost;

    if (obj.parametric.type === 'pipe') {
      totalPipeLengthM += metrics.lengthM;
    }

    const cat = obj.category;
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = { count: 0, volume: 0, cost: 0 };
    }
    categoryTotals[cat].count += 1;
    categoryTotals[cat].volume += metrics.volumeM3;
    categoryTotals[cat].cost += cost;
  });

  return (
    <div className="p-3 text-xs space-y-4 overflow-y-auto max-h-full text-slate-300">
      <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
        <span className="font-semibold text-slate-200 flex items-center space-x-1">
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
          <span>Bill of Quantities (BOQ)</span>
        </span>
        <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
          ISO 19650
        </span>
      </div>

      {/* High Level Rollups */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded font-mono">
        <div>
          <div className="text-[9px] text-slate-500 uppercase">Total Material Volume</div>
          <div className="text-emerald-400 font-bold text-sm">{totalVolumeM3.toFixed(2)} m³</div>
        </div>

        <div>
          <div className="text-[9px] text-slate-500 uppercase">Estimated Total Cost</div>
          <div className="text-amber-400 font-bold text-sm">${totalCostEstimate.toLocaleString()}</div>
        </div>

        <div className="col-span-2 pt-1 border-t border-slate-800/80 flex justify-between text-[10px]">
          <span className="text-slate-400">Total Pipe Network Length:</span>
          <span className="text-cyan-400 font-bold">{totalPipeLengthM.toFixed(1)} m</span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="space-y-2">
        <div className="font-semibold text-slate-200">Category Quantity Rollups</div>

        <div className="space-y-1.5">
          {Object.entries(categoryTotals).map(([cat, data]) => (
            <div
              key={cat}
              className="p-2 bg-slate-900/80 border border-slate-800 rounded flex items-center justify-between font-mono text-[11px]"
            >
              <div>
                <div className="font-bold text-slate-200">{cat}</div>
                <div className="text-[9px] text-slate-500">{data.count} Elements</div>
              </div>

              <div className="text-right">
                <div className="text-emerald-400 font-semibold">{data.volume.toFixed(1)} m³</div>
                <div className="text-amber-400 font-semibold">${data.cost.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
