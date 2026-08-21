/**
 * EVLab 3D Studio - BIM Schedules & Takeoffs 2.0 Panel
 * Interactive schedule viewer with live calculated formulas, column sorting, category filters, and CSV export.
 */

import React, { useState } from 'react';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { ScheduleEngine, ScheduleQueryResult } from '../../bim/schedules/ScheduleEngine';
import { Table, Download, RefreshCw, Calculator, Filter, ArrowUpDown } from 'lucide-react';

export const BIMSchedulesPanel: React.FC = () => {
  const { elements, rooms, activeScheduleId, setActiveSchedule } = useBIMStore();
  const schedules = ScheduleEngine.DEFAULT_SCHEDULES;

  const currentDef = schedules.find((s) => s.id === activeScheduleId) || schedules[0];
  const queryResult: ScheduleQueryResult = ScheduleEngine.executeSchedule(currentDef, elements, rooms);

  const handleExportCSV = () => {
    const csvData = ScheduleEngine.exportToCSV(queryResult);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentDef.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs select-none">
      {/* Top Header & Schedule Selector */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold text-cyan-400">
            <Table className="w-4 h-4" />
            <span>BIM Schedules & Quantities 2.0</span>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold transition shadow-sm"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Schedule Selector Tabs */}
        <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none">
          {schedules.map((sch) => {
            const isActive = sch.id === currentDef.id;
            return (
              <button
                key={sch.id}
                onClick={() => setActiveSchedule(sch.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                {sch.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Table View */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 font-semibold z-10">
            <tr>
              <th className="p-2 w-8 text-center">#</th>
              {queryResult.columns.map((col) => (
                <th
                  key={col.id}
                  className={`p-2 ${col.alignment === 'right' ? 'text-right' : col.alignment === 'center' ? 'text-center' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-1 ${col.alignment === 'right' ? 'justify-end' : col.alignment === 'center' ? 'justify-center' : 'justify-start'}`}>
                    <span>{col.header}</span>
                    {col.isCalculated && <Calculator className="w-2.5 h-2.5 text-amber-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {queryResult.rows.length === 0 ? (
              <tr>
                <td colSpan={queryResult.columns.length + 1} className="text-center p-6 text-slate-500">
                  No elements matching schedule criteria found in current BIM model.
                </td>
              </tr>
            ) : (
              queryResult.rows.map((row, idx) => (
                <tr key={row.elementId} className="hover:bg-slate-800/40 transition">
                  <td className="p-2 text-center text-slate-500 font-mono text-[10px]">{idx + 1}</td>
                  {queryResult.columns.map((col) => {
                    const val = row.values[col.field];
                    return (
                      <td
                        key={col.id}
                        className={`p-2 ${col.alignment === 'right' ? 'text-right font-mono text-slate-300' : col.alignment === 'center' ? 'text-center' : 'text-left text-slate-200'}`}
                      >
                        {val !== undefined && val !== null ? String(val) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
          {currentDef.grandTotal && queryResult.rows.length > 0 && (
            <tfoot className="bg-slate-950/90 font-bold border-t-2 border-slate-700 text-cyan-300 sticky bottom-0">
              <tr>
                <td colSpan={2} className="p-2 text-left uppercase text-[10px] tracking-wider">
                  Grand Total ({queryResult.totalRowCount} items)
                </td>
                {queryResult.columns.slice(1).map((col) => (
                  <td
                    key={col.id}
                    className={`p-2 ${col.alignment === 'right' ? 'text-right font-mono' : 'text-left'}`}
                  >
                    {col.showTotal && queryResult.totals[col.field] !== undefined
                      ? queryResult.totals[col.field]
                      : ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
        <span>Dynamic Live Query Engine</span>
        <span className="font-mono text-slate-400">EVLab BIM Core v1.2</span>
      </div>
    </div>
  );
};
