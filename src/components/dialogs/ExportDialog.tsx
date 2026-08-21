/**
 * EVLab 3D Studio - Export Dialog
 * Format-selection modal. Actual encoders (IFC/glTF/OBJ writers) plug in
 * during the OpenBIM phase - this wires up the modal shell, selection
 * state, and object-count summary so the UI is ready for them.
 */

import React, { useState } from 'react';
import { X, FileDown } from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'IFC 4' | 'glTF (.glb)' | 'OBJ' | 'JSON (native)';

const FORMATS: ExportFormat[] = ['IFC 4', 'glTF (.glb)', 'OBJ', 'JSON (native)'];

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('IFC 4');
  const objectCount = useAppStore((s) => Object.keys(s.objects).length);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">Export Model</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-400">{objectCount} object(s) in current project.</p>

          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Format</p>
            {FORMATS.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-slate-200 py-1 cursor-pointer">
                <input
                  type="radio"
                  name="export-format"
                  checked={format === f}
                  onChange={() => setFormat(f)}
                  className="accent-sky-500"
                />
                {f}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-800">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded text-slate-400 hover:bg-slate-800">
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-sky-600 text-white hover:bg-sky-500"
          >
            <FileDown size={14} />
            Export {format}
          </button>
        </div>
      </div>
    </div>
  );
}
