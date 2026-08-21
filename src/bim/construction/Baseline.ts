/**
 * EVLab BIM Core v1.3 - Construction Baseline Management
 * Tracks Original Baseline vs Current Schedule vs Actual Progress and computes schedule variances.
 */

import { ConstructionActivity } from './Activity';

export interface ActivityBaselineSnapshot {
  activityId: string;
  baselineStartDate: string;
  baselineFinishDate: string;
  baselineDurationDays: number;
  baselineBudgetCostUSD: number;
}

export interface ScheduleBaseline {
  id: string;
  name: string;
  createdAt: string;
  description: string;
  snapshots: Map<string, ActivityBaselineSnapshot>;
}

export interface ScheduleVarianceReport {
  activityId: string;
  activityName: string;
  plannedFinish: string;
  actualOrCurrentFinish: string;
  varianceDays: number; // Positive = delayed, Negative = ahead of schedule
  costVarianceUSD: number;
  status: 'Ahead' | 'On Track' | 'Delayed' | 'Critical Delay';
}

export class BaselineEngine {
  private baselines: Map<string, ScheduleBaseline> = new Map();
  private activeBaselineId: string | null = null;

  constructor() {
    this.createDefaultBaseline();
  }

  private createDefaultBaseline() {
    const defaultBaseline: ScheduleBaseline = {
      id: 'baseline_01_original',
      name: 'Original Contract Baseline (BL-01)',
      createdAt: '2026-01-15',
      description: 'Approved baseline schedule for construction milestones.',
      snapshots: new Map()
    };
    this.baselines.set(defaultBaseline.id, defaultBaseline);
    this.activeBaselineId = defaultBaseline.id;
  }

  public captureBaseline(name: string, description: string, activities: ConstructionActivity[]): ScheduleBaseline {
    const id = `baseline_${Date.now()}`;
    const snapshots = new Map<string, ActivityBaselineSnapshot>();

    activities.forEach((act) => {
      snapshots.set(act.id, {
        activityId: act.id,
        baselineStartDate: act.startDate,
        baselineFinishDate: act.finishDate,
        baselineDurationDays: act.durationDays,
        baselineBudgetCostUSD: act.budgetCostUSD
      });
    });

    const baseline: ScheduleBaseline = {
      id,
      name,
      createdAt: new Date().toISOString().split('T')[0],
      description,
      snapshots
    };

    this.baselines.set(id, baseline);
    this.activeBaselineId = id;
    return baseline;
  }

  public getActiveBaseline(): ScheduleBaseline | undefined {
    return this.activeBaselineId ? this.baselines.get(this.activeBaselineId) : undefined;
  }

  public getAllBaselines(): ScheduleBaseline[] {
    return Array.from(this.baselines.values());
  }

  public calculateVariances(activities: ConstructionActivity[]): ScheduleVarianceReport[] {
    const baseline = this.getActiveBaseline();
    const reports: ScheduleVarianceReport[] = [];

    activities.forEach((act) => {
      const snap = baseline?.snapshots.get(act.id);
      if (!snap) {
        reports.push({
          activityId: act.id,
          activityName: act.name,
          plannedFinish: act.finishDate,
          actualOrCurrentFinish: act.finishDate,
          varianceDays: 0,
          costVarianceUSD: 0,
          status: 'On Track'
        });
        return;
      }

      const plannedFinishMs = new Date(snap.baselineFinishDate).getTime();
      const currentFinishMs = new Date(act.finishDate).getTime();
      const varianceDays = Math.round((currentFinishMs - plannedFinishMs) / (1000 * 60 * 60 * 24));
      const costVarianceUSD = act.actualCostUSD - snap.baselineBudgetCostUSD;

      let status: 'Ahead' | 'On Track' | 'Delayed' | 'Critical Delay' = 'On Track';
      if (varianceDays > 14) status = 'Critical Delay';
      else if (varianceDays > 0) status = 'Delayed';
      else if (varianceDays < 0) status = 'Ahead';

      reports.push({
        activityId: act.id,
        activityName: act.name,
        plannedFinish: snap.baselineFinishDate,
        actualOrCurrentFinish: act.finishDate,
        varianceDays,
        costVarianceUSD,
        status
      });
    });

    return reports;
  }
}
