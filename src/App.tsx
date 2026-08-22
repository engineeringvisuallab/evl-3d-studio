/**
 * EVLab 3D Studio - Core Application Layout
 */

import React, { useState, useEffect } from 'react';
import { TopMenuBar } from './components/topbar/TopMenuBar';
import { RevitRibbonBar } from './components/topbar/RevitRibbonBar';
import { RevitOptionsBar } from './components/topbar/RevitOptionsBar';
import { LeftToolbar } from './components/toolbar/LeftToolbar';
import { ThreeCanvas } from './engine/viewport/ThreeCanvas';
import { RightSidebar } from './components/panels/RightSidebar';
import { RevitStatusBar } from './components/statusbar/RevitStatusBar';
import { ExportDialog } from './components/dialogs/ExportDialog';
import { ShortcutHelpDialog } from './components/dialogs/ShortcutHelpDialog';
import { useAppStore } from './state/useAppStore';
import { useBIMSync } from './state/useBIMSync';

export default function App() {
  const [cameraPreset, setCameraPreset] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutOpen, setIsShortcutOpen] = useState(false);

  const {
    setActiveTool,
    removeSelectedObjects,
    undo,
    redo,
    setFps,
    toggleShowLabels
  } = useAppStore();

  useBIMSync();

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts when typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        setActiveTool('select');
      } else if (e.key === 't' || e.key === 'T') {
        toggleShowLabels();
      } else if (e.key === 'g' || e.key === 'G') {
        setActiveTool('move');
      } else if (e.key === 'r' || e.key === 'R') {
        setActiveTool('rotate');
      } else if (e.key === 's' || e.key === 'S') {
        setActiveTool('scale');
      } else if (e.key === 'p' || e.key === 'P') {
        setActiveTool('pushpull');
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveTool('line');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        removeSelectedObjects();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, removeSelectedObjects, undo, redo, toggleShowLabels]);

  // Simple FPS Monitor
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      const currentFps = Math.round(frameCount / delta);
      setFps(currentFps || 60);
      frameCount = 0;
      lastTime = now;
    }, 1000);

    const raf = requestAnimationFrame(function loop() {
      frameCount++;
      requestAnimationFrame(loop);
    });

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(raf);
    };
  }, [setFps]);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Menu Ribbon */}
      <TopMenuBar
        onOpenExportDialog={() => setIsExportOpen(true)}
        onOpenShortcutHelp={() => setIsShortcutOpen(true)}
        setCameraPreset={(preset) => setCameraPreset(preset)}
      />

      {/* Revit Multi-Tab Ribbon Bar Suite */}
      <RevitRibbonBar setCameraPreset={(preset) => setCameraPreset(preset)} />

      {/* Contextual Options Bar */}
      <RevitOptionsBar />

      {/* Main Workspace Area (Left Toolbar + 3D/2D Viewport + Right Sidebar) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar */}
        <LeftToolbar />

        {/* Center 3D / 2D Viewport */}
        <div className="flex-1 h-full relative">
          <ThreeCanvas cameraPreset={cameraPreset} />
        </div>

        {/* Right Inspector & BIM Panels */}
        <RightSidebar setCameraPreset={(preset) => setCameraPreset(preset)} />
      </div>

      {/* Bottom Professional Revit Status Bar */}
      <RevitStatusBar />

      {/* Dialog Modals */}
      <ExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <ShortcutHelpDialog isOpen={isShortcutOpen} onClose={() => setIsShortcutOpen(false)} />
    </div>
  );
}
