/**
 * EVLab 3D Studio - BIM Engine Panel
 * Surfaces the BIMElement that BIMCoreStore derives from the currently
 * selected SceneObject (quantities, IFC mapping, level/host/grid
 * constraints, validation status) - the first place any of the BIM
 * engines wired up in Phase 1 become visible in the UI.
 */

import React from 'react';
import { Box, FileCode2, Link2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useBIMStore } from '../../bim/BIMCoreStore';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 text-right truncate">{value}</span>
    </div>
  );
}

const STATUS_STYLE: Record<string, { icon: React.ReactNode; text: string }> = {
  Valid: { icon: <CheckCircle2 size={12} className="text-emerald-400" />, text: 'text-emerald-400' },
  Warning: { icon: <AlertTriangle size={12} className="text-amber-400" />, text: 'text-amber-400' },
  Error: { icon: <XCircle size={12} className="text-rose-400" />, text: 'text-rose-400' },
};

export function BIMEnginePanel({ selectedId }: { selectedId: string }) {
  // Subscribing to the whole elements Map keeps this in sync whenever
  // useBIMSync re-runs syncFromSceneObjects after a viewport edit.
  const elements = useBIMStore((s) => s.elements);
  const elem = elements.get(selectedId);

  if (!elem) {
    return (
      <div className="px-3 py-2 text-[11px] text-slate-500">
        BIM engine data not available for this element yet.
      </div>
    );
  }

  const status = STATUS_STYLE[elem.validationStatus] ?? STATUS_STYLE.Valid;
  const q = elem.quantities;

  return (
    <div className="px-3 py-2 space-y-3 text-xs">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1.5">
          <Box size={12} />
          Quantities
        </p>
        <div className="space-y-1">
          {q.lengthM > 0 && <Row label="Length" value={`${q.lengthM.toFixed(2)} m`} />}
          {q.surfaceAreaM2 > 0 && <Row label="Area" value={`${q.surfaceAreaM2.toFixed(2)} m²`} />}
          {q.volumeM3 > 0 && <Row label="Volume" value={`${q.volumeM3.toFixed(3)} m³`} />}
          <Row label="Est. Cost" value={q.costTotal.toFixed(2)} />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1.5">
          <FileCode2 size={12} />
          OpenBIM / IFC
        </p>
        <div className="space-y-1">
          <Row label="IFC Class" value={elem.ifcMapping.ifcEntity} />
          <Row label="Global ID" value={<span className="font-mono text-[10px]">{elem.ifcMapping.ifcGuid}</span>} />
        </div>
      </div>

      {elem.constraints.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1.5">
            <Link2 size={12} />
            Constraints
          </p>
          <div className="space-y-1">
            {elem.constraints.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-slate-500">{c.type.replace('Constraint', '')}</span>
                <span
                  className={
                    c.status === 'Satisfied'
                      ? 'text-emerald-400'
                      : c.status === 'Violated'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }
                >
                  {c.status ?? 'Satisfied'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
        {status.icon}
        <span className={status.text}>{elem.validationStatus}</span>
        {elem.validationMessages && elem.validationMessages.length > 0 && (
          <span className="text-slate-500 truncate">— {elem.validationMessages[0]}</span>
        )}
      </div>
    </div>
  );
}
