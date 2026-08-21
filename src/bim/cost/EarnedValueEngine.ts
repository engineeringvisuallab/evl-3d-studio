/**
 * EVLab BIM Core v1.3 - Earned Value Management (EVM) Engine
 * Calculates Planned Value (PV), Earned Value (EV), Actual Cost (AC), Cost Variance (CV), Schedule Variance (SV),
 * Cost Performance Index (CPI), Schedule Performance Index (SPI), Estimate at Completion (EAC), and Estimate to Complete (ETC).
 */

import { ConstructionActivity } from '../construction/Activity';

export interface EVMPerformanceSummary {
  plannedValueUSD: number;     // PV (BCWS)
  earnedValueUSD: number;      // EV (BCWP)
  actualCostUSD: number;       // AC (ACWP)
  budgetAtCompletionUSD: number; // BAC
  costVarianceUSD: number;     // CV = EV - AC
  scheduleVarianceUSD: number; // SV = EV - PV
  cpi: number;                 // CPI = EV / AC (Cost Performance Index)
  spi: number;                 // SPI = EV / PV (Schedule Performance Index)
  estimateAtCompletionUSD: number; // EAC = BAC / CPI
  estimateToCompleteUSD: number;   // ETC = EAC - AC
  varianceAtCompletionUSD: number; // VAC = BAC - EAC
  costHealth: 'Excellent' | 'Good' | 'Over Budget' | 'Critical Overrun';
  scheduleHealth: 'Ahead' | 'On Track' | 'Delayed' | 'Critical Delay';
}

export class EarnedValueEngine {
  public static calculateEVM(activities: ConstructionActivity[], queryDateStr?: string): EVMPerformanceSummary {
    let bac = 0;
    let pv = 0;
    let ev = 0;
    let ac = 0;

    const queryTime = queryDateStr ? new Date(queryDateStr).getTime() : Date.now();

    activities.forEach((act) => {
      const budget = act.budgetCostUSD || 1000;
      bac += budget;
      ac += act.actualCostUSD || 0;

      // Planned Value (PV) calculation based on schedule date
      const startTime = new Date(act.startDate).getTime();
      const finishTime = new Date(act.finishDate).getTime();

      let plannedRatio = 0;
      if (queryTime >= finishTime) {
        plannedRatio = 1.0;
      } else if (queryTime <= startTime) {
        plannedRatio = 0.0;
      } else {
        const totalSpan = finishTime - startTime;
        plannedRatio = totalSpan > 0 ? (queryTime - startTime) / totalSpan : 0;
      }
      pv += budget * plannedRatio;

      // Earned Value (EV) calculation based on actual progress %
      const progressRatio = Math.min(100, Math.max(0, act.progressPercent || 0)) / 100;
      ev += budget * progressRatio;
    });

    const cv = ev - ac;
    const sv = ev - pv;
    const cpi = ac > 0 ? Number((ev / ac).toFixed(2)) : 1.0;
    const spi = pv > 0 ? Number((ev / pv).toFixed(2)) : 1.0;

    // EAC & ETC
    const eac = cpi > 0 ? Number((bac / cpi).toFixed(2)) : bac;
    const etc = Number((eac - ac).toFixed(2));
    const vac = Number((bac - eac).toFixed(2));

    // Health statuses
    let costHealth: 'Excellent' | 'Good' | 'Over Budget' | 'Critical Overrun' = 'Good';
    if (cpi >= 1.05) costHealth = 'Excellent';
    else if (cpi >= 0.98) costHealth = 'Good';
    else if (cpi >= 0.85) costHealth = 'Over Budget';
    else costHealth = 'Critical Overrun';

    let scheduleHealth: 'Ahead' | 'On Track' | 'Delayed' | 'Critical Delay' = 'On Track';
    if (spi >= 1.05) scheduleHealth = 'Ahead';
    else if (spi >= 0.98) scheduleHealth = 'On Track';
    else if (spi >= 0.85) scheduleHealth = 'Delayed';
    else scheduleHealth = 'Critical Delay';

    return {
      plannedValueUSD: Number(pv.toFixed(2)),
      earnedValueUSD: Number(ev.toFixed(2)),
      actualCostUSD: Number(ac.toFixed(2)),
      budgetAtCompletionUSD: Number(bac.toFixed(2)),
      costVarianceUSD: Number(cv.toFixed(2)),
      scheduleVarianceUSD: Number(sv.toFixed(2)),
      cpi,
      spi,
      estimateAtCompletionUSD: eac,
      estimateToCompleteUSD: Math.max(0, etc),
      varianceAtCompletionUSD: vac,
      costHealth,
      scheduleHealth
    };
  }
}
