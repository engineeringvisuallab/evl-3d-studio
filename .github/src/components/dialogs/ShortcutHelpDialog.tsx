/**
 * EVLab 3D Studio - Keyboard Shortcut Help Dialog
 * Mirrors the handleKeyDown listener in App.tsx exactly, so this list
 * never drifts from what actually works.
 */

import React from 'react';
import { X } from 'lucide-react';

interface ShortcutHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: 'Space / Esc', action: 'Select tool' },
  { keys: 'T', action: 'Toggle object labels' },
  { keys: 'G', action: 'Move tool' },
  { keys: 'R', action: 'Rotate tool' },
  { keys: 'S', action: 'Scale tool' },
  { keys: 'P', action: 'Push/Pull tool' },
  { keys: 'L', action: 'Line tool' },
  { keys: 'Delete / Backspace', action: 'Delete selected object(s)' },
  { keys: 'Ctrl/Cmd + Z', action: 'Undo' },
  { keys: 'Ctrl/Cmd + Shift + Z', action: 'Redo' },
  { keys: 'Ctrl/Cmd + Y', action: 'Redo' },
];

export function ShortcutHelpDialog({ isOpen, onClose }: ShortcutHelpDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-1.5 max-h-96 overflow-y-auto">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{s.action}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
