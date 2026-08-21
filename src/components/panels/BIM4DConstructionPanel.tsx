/**
 * EVLab BIM Core v1.3 - 4D Construction Planning & Simulation Panel
 * Interactive Gantt Chart, Timeline Scrubber, Activity Editor, WBS Navigator, Baseline Variance & 4D Visual Playback.
 */

import React, { useState, useEffect } from 'react';
import { useBIMStore } from '../../bim/BIMCoreStore';
import { ConstructionActivity } from '../../bim/construction/Activity';
import { ConstructionState, CONSTRUCTION_VISUAL_MAP } from '../../bim/construction/ConstructionState';
import {
  Calendar,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Plus,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Sliders,
  DollarSign
} from 'lucide-react';

export const BIM4DConstructionPanel: React.FC = () => {
  const {
    timelineEngine,
    baselineEngine,
    wbsEngine,
    currentTimelineDate,
    isTimelinePlaying,
    timelineSpeed,
    timelineZoom,
    setTimelineDate,
    setTimelinePlaying,
    setTimelineSpeed,
    setTimelineZoom,
    addActivity,
    updateActivity,
    captureScheduleBaseline
  } = useBIMStore();

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>('act_09_walls_ext');
  const [activeTab, setActiveTab] = useState<'timeline' | 'activities' | 'wbs' | 'baseline'>('timeline');
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityDiscipline, setNewActivityDiscipline] = useState<'Architectural' | 'Structural' | 'MEP' | 'Civil'>('Architectural');
  const [newActivityStartDate, setNewActivityStartDate] = useState('2026-06-01');
  const [newActivityFinishDate, setNewActivityFinishDate] = useState('2026-07-01');

  const activities = timelineEngine.getAllActivities();
  const selectedActivity = activities.find((a) => a.id === selectedActivityId);
  const variances = baselineEngine.calculateVariances(activities);

  // Playback timer loop
  useEffect(() => {
    let timer: any;
    if (isTimelinePlaying) {
      timer = setInterval(() => {
        const curr = new Date(useBIMStore.getState().currentTimelineDate);
        curr.setDate(curr.getDate() + Math.max(1, Math.round(timelineSpeed * 2)));
        if (curr > new Date('2026-12-31')) {
          setTimelinePlaying(false);
          setTimelineDate('2026-01-01');
        } else {
          setTimelineDate(curr.toISOString().split('T')[0]);
        }
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isTimelinePlaying, timelineSpeed, setTimelineDate, setTimelinePlaying]);

  const handleCreateActivity = () => {
    if (!newActivityName.trim()) return;
    const startMs = new Date(newActivityStartDate).getTime();
    const finishMs = new Date(newActivityFinishDate).getTime();
    const durationDays = Math.max(1, Math.round((finishMs - startMs) / (1000 * 60 * 60 * 24)));

    const newAct: ConstructionActivity = {
      id: `act_${Date.now()}`,
      name: newActivityName,
      wbsCode: '1.2.3',
      wbsId: 'wbs_p2_walls',
      description: 'Custom site activity linked to model elements',
      discipline: newActivityDiscipline,
      phase: 'Phase 2 - Superstructure',
      zone: 'Zone A',
      startDate: newActivityStartDate,
      finishDate: newActivityFinishDate,
      durationDays,
      calendarId: 'cal_standard_site',
      status: 'Planned',
      progressPercent: 0,
      dependencies: [],
      assignedElementIds: [],
      costCode: '04-200',
      budgetCostUSD: 15000,
      actualCostUSD: 0
    };

    addActivity(newAct);
    setSelectedActivityId(newAct.id);
    setIsCreatingActivity(false);
    setNewActivityName('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 text-xs select-none">
      {/* 4D Header & Navigation Tabs */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-950 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-cyan-600/20 text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                <span>4D Construction Timeline</span>
                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-1.5 py-0.5 rounded font-mono">v1.3</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Simulation Date: <span className="text-cyan-300 font-bold">{currentTimelineDate}</span></div>
            </div>
          </div>

          {/* Quick Playback Pill */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-md">
            <button
              onClick={() => setTimelineDate('2026-01-01')}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              title="Reset Timeline"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              onClick={() => setTimelinePlaying(!isTimelinePlaying)}
              className={`px-2 py-0.5 rounded font-semibold flex items-center space-x-1 ${
                isTimelinePlaying ? 'bg-amber-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {isTimelinePlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isTimelinePlaying ? 'Pause' : 'Simulate'}</span>
            </button>
            <button
              onClick={() => setTimelineSpeed(timelineSpeed >= 5 ? 1 : timelineSpeed + 2)}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded text-slate-300 font-mono text-[10px]"
              title="Playback Speed"
            >
              {timelineSpeed}x
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded border border-slate-800/80">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'timeline' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gantt 4D
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'activities' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activities ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('wbs')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'wbs' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WBS Tree
          </button>
          <button
            onClick={() => setActiveTab('baseline')}
            className={`py-1 rounded font-medium text-center transition ${
              activeTab === 'baseline' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Variance
          </button>
        </div>
      </div>

      {/* Date Scrubber Slider */}
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex flex-col space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>2026-01-01</span>
          <span className="text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            {currentTimelineDate}
          </span>
          <span>2026-12-31</span>
        </div>
        <input
          type="range"
          min={new Date('2026-01-01').getTime()}
          max={new Date('2026-12-31').getTime()}
          step={86400000} // 1 day
          value={new Date(currentTimelineDate).getTime()}
          onChange={(e) => {
            const d = new Date(Number(e.target.value)).toISOString().split('T')[0];
            setTimelineDate(d);
          }}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Tab 1: Gantt 4D Timeline View */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span>Gantt Schedule Simulation</span>
              <div className="flex items-center space-x-1">
                {(['Day', 'Week', 'Month', 'Quarter'] as const).map((z) => (
                  <button
                    key={z}
                    onClick={() => setTimelineZoom(z)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      timelineZoom === z ? 'bg-slate-700 text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>

            {/* Gantt Activity Bars */}
            <div className="space-y-1.5">
              {activities.map((act) => {
                const totalStart = new Date('2026-01-01').getTime();
                const totalEnd = new Date('2026-12-31').getTime();
                const totalSpan = totalEnd - totalStart;

                const actStart = new Date(act.startDate).getTime();
                const actFinish = new Date(act.finishDate).getTime();

                const leftPercent = Math.max(0, Math.min(100, ((actStart - totalStart) / totalSpan) * 100));
                const widthPercent = Math.max(2, Math.min(100 - leftPercent, ((actFinish - actStart) / totalSpan) * 100));

                const queryTime = new Date(currentTimelineDate).getTime();
                let statusColor = 'bg-slate-700 text-slate-300';
                if (queryTime > actFinish) statusColor = 'bg-emerald-600 text-white';
                else if (queryTime >= actStart && queryTime <= actFinish) statusColor = 'bg-amber-500 text-black animate-pulse font-bold';
                else statusColor = 'bg-cyan-800/60 text-cyan-200 border border-cyan-700/50';

                return (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivityId(act.id)}
                    className={`p-2 rounded border transition cursor-pointer ${
                      selectedActivityId === act.id
                        ? 'bg-slate-800/90 border-cyan-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10px] text-cyan-400 font-bold">{act.wbsCode}</span>
                        <span className="font-medium text-slate-100">{act.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{act.progressPercent}%</span>
                    </div>

                    {/* Timeline bar container */}
                    <div className="w-full bg-slate-950 h-3 rounded overflow-hidden relative border border-slate-800">
                      <div
                        className={`h-full absolute rounded text-[8px] flex items-center justify-center ${statusColor}`}
                        style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                      >
                        {act.durationDays}d
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                      <span>{act.startDate}</span>
                      <span>{act.assignedElementIds.length} Elements</span>
                      <span>{act.finishDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Activity Details & Creation */}
        {activeTab === 'activities' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Construction Work Packages</span>
              <button
                onClick={() => setIsCreatingActivity(!isCreatingActivity)}
                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Activity</span>
              </button>
            </div>

            {/* Creation Form */}
            {isCreatingActivity && (
              <div className="p-3 bg-slate-950 border border-cyan-600/50 rounded-md space-y-2">
                <div className="font-semibold text-cyan-400">Add Construction Activity</div>
                <div>
                  <label className="text-[10px] text-slate-400">Activity Name</label>
                  <input
                    type="text"
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    placeholder="e.g. L2 Rebar Fabrication & Concreting"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Start Date</label>
                    <input
                      type="date"
                      value={newActivityStartDate}
                      onChange={(e) => setNewActivityStartDate(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Finish Date</label>
                    <input
                      type="date"
                      value={newActivityFinishDate}
                      onChange={(e) => setNewActivityFinishDate(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-100 font-mono text-[11px]"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    onClick={() => setIsCreatingActivity(false)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateActivity}
                    className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
                  >
                    Save Activity
                  </button>
                </div>
              </div>
            )}

            {/* Selected Activity Inspector */}
            {selectedActivity && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-md space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-bold text-slate-100 text-[13px]">{selectedActivity.name}</span>
                    <div className="text-[10px] text-cyan-400 font-mono">{selectedActivity.wbsCode} · {selectedActivity.discipline}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedActivity.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    selectedActivity.status === 'In Progress' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}>
                    {selectedActivity.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Start Date</span>
                    <span className="font-mono text-slate-200">{selectedActivity.startDate}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Finish Date</span>
                    <span className="font-mono text-slate-200">{selectedActivity.finishDate}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Duration</span>
                    <span className="font-mono text-slate-200">{selectedActivity.durationDays} Working Days</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Budget Cost</span>
                    <span className="font-mono text-emerald-400 font-bold">${selectedActivity.budgetCostUSD.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress Slider */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Actual Site Progress</span>
                    <span className="font-bold text-cyan-400 font-mono">{selectedActivity.progressPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedActivity.progressPercent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateActivity(selectedActivity.id, {
                        progressPercent: val,
                        status: val === 100 ? 'Completed' : val > 0 ? 'In Progress' : 'Planned'
                      });
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                {/* Linked Elements */}
                <div className="border-t border-slate-800 pt-2">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Linked 3D BIM Elements</span>
                    <span className="font-mono text-cyan-400 font-bold">{selectedActivity.assignedElementIds.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedActivity.assignedElementIds.map((elemId) => (
                      <span key={elemId} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-slate-300">
                        {elemId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: WBS Navigator */}
        {activeTab === 'wbs' && (
          <div className="space-y-2">
            <span className="font-semibold text-slate-200">Work Breakdown Structure (WBS)</span>
            <div className="space-y-1.5 font-mono text-[11px]">
              {wbsEngine.getAllNodes().map((node) => (
                <div
                  key={node.id}
                  className={`p-2 rounded border bg-slate-950 border-slate-800 flex items-center justify-between ${
                    node.level === 'Project' ? 'border-cyan-500/50 bg-cyan-950/20 font-bold' : ''
                  }`}
                  style={{ marginLeft: node.level === 'Project' ? 0 : node.level === 'Phase' ? 8 : node.level === 'Zone' ? 16 : 24 }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-cyan-400 font-bold">{node.code}</span>
                    <span className="text-slate-200 font-sans">{node.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                    {node.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Schedule Baseline & Variances */}
        {activeTab === 'baseline' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Baseline Schedule Variance (BL-01)</span>
              <button
                onClick={() => captureScheduleBaseline('Snapshot BL-02', 'Manual baseline snapshot')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700 text-[10px]"
              >
                Capture Baseline
              </button>
            </div>

            <div className="space-y-1.5">
              {variances.map((v) => (
                <div key={v.activityId} className="p-2 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-200">{v.activityName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Planned: {v.plannedFinish} · Actual: {v.actualOrCurrentFinish}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      v.status === 'On Track' ? 'bg-emerald-950 text-emerald-400' :
                      v.status === 'Ahead' ? 'bg-cyan-950 text-cyan-400' : 'bg-rose-950 text-rose-400'
                    }`}>
                      {v.varianceDays > 0 ? `+${v.varianceDays}d Late` : v.varianceDays < 0 ? `${v.varianceDays}d Ahead` : 'On Track'}
                    </span>
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
