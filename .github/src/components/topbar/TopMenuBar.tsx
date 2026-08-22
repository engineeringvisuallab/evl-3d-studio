/**
 * EVLab 3D Studio - Top Menu Bar
 * Application-level menu row: brand, File/Edit/View text menus (stubs for
 * now - wire to real File I/O in a later phase), export trigger, and the
 * keyboard-shortcut help trigger.
 */

import React from 'react';
import { Boxes, Download, Keyboard, Undo2, Redo2 } from 'lucide-react';
import { useAppStore } from '../../state/useAppStore';

interface TopMenuBarProps {
  onOpenExportDialog: () => void;
  onOpenShortcutHelp: () => void;
  setCameraPreset: (preset: string) => void;
}

const MENUS = ['File', 'Edit', 'View', 'Insert', 'Annotate', 'Manage'];

export function TopMenuBar({ onOpenExportDialog, onOpenShortcutHelp }: TopMenuBarProps) {
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const historyIndex = useAppStore((s) => s.historyIndex);
  const historyLength = useAppStore((s) => s.history.length);

  return (
    <div className="h-10 shrink-0 bg-slate-900 border-b border-slate-800 flex items-center px-3 gap-4 text-sm">
      <div className="flex items-center gap-2 font-semibold text-slate-100">
        <Boxes size={18} className="text-sky-400" />
        <span>EVLab 3D Studio</span>
      </div>

      <div className="flex items-center gap-1 text-slate-400">
        {MENUS.map((menu) => (
          <button key={menu} className="px-2 py-1 rounded hover:bg-slate-800 hover:text-slate-100">
            {menu}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          title="Undo (Ctrl+Z)"
          disabled={historyIndex < 0}
          onClick={undo}
          className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Undo2 size={16} />
        </button>
        <button
          title="Redo (Ctrl+Y)"
          disabled={historyIndex >= historyLength - 1}
          onClick={redo}
          className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Redo2 size={16} />
        </button>
        <button
          title="Export"
          onClick={onOpenExportDialog}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-slate-200 bg-slate-800 hover:bg-slate-700"
        >
          <Download size={15} />
          Export
        </button>
        <button
          title="Keyboard Shortcuts"
          onClick={onOpenShortcutHelp}
          className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <Keyboard size={16} />
        </button>
      </div>
    </div>
  );
}
