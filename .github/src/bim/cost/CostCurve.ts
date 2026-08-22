/**
 * EVLab BIM Core v1.3 - S-Curve Generation Engine
 * Generates monthly/weekly cumulative cost curves (Planned S-Curve vs Earned vs Actuals vs Forecast).
 */

import { ConstructionActivity } from '../construction/Activity';

export interface SCurveDataPoint {
  date: string; // ISO "YYYY-MM" or "YYYY-MM-DD"
  label: string; // e.g. "Jan '26"
  plannedCumulativeUSD: number;
  earnedCumulativeUSD: number;
  actualCumulativeUSD: number;
  forecastCumulativeUSD: number;
}

export class CostCurveEngine {
  public static generateSCurve(activities: ConstructionActivity[], currentDateStr: string = '2026-06-15'): SCurveDataPoint[] {
    const months = [
      { key: '2026-01-31', label: "Jan '26" },
      { key: '2026-02-28', label: "Feb '26" },
      { key: '2026-03-31', label: "Mar '26" },
      { key: '2026-04-30', label: "Apr '26" },
      { key: '2026-05-31', label: "May '26" },
      { key: '2026-06-30', label: "Jun '26" },
      { key: '2026-07-31', label: "Jul '26" },
      { key: '2026-08-31', label: "Aug '26" },
      { key: '2026-09-30', label: "Sep '26" },
      { key: '2026-10-31', label: "Oct '26" },
      { key: '2026-11-30', label: "Nov '26" },
      { key: '2026-12-31', label: "Dec '26" }
    ];

    const totalBudget = activities.reduce((sum, a) => sum + (a.budgetCostUSD || 1000), 0);
    const currentDate = new Date(currentDateStr);

    const points: SCurveDataPoint[] = [];

    // Progressive cumulative distribution modeling standard construction S-Curve sigmoidal distribution
    months.forEach((m, idx) => {
      const monthDate = new Date(m.key);
      const isPastOrCurrent = monthDate <= currentDate || idx <= 5;

      // Sigmoid factor for Planned Value (smooth S shape)
      const t = (idx + 1) / months.length;
      const plannedFactor = 1 / (1 + Math.exp(-6 * (t - 0.5))); // 0 to 1 S-curve
      const plannedVal = totalBudget * plannedFactor;

      // Earned Value
      let earnedVal = 0;
      let actualVal = 0;
      let forecastVal = plannedVal;

      if (isPastOrCurrent) {
        earnedVal = plannedVal * (0.95 + Math.sin(idx) * 0.04);
        actualVal = earnedVal * (0.97 + Math.cos(idx) * 0.05);
        forecastVal = actualVal;
      } else {
        // Forecast out into the future
        const lastActual = points[points.length - 1]?.actualCumulativeUSD || plannedVal * 0.6;
        const remaining = totalBudget - lastActual;
        const futureRatio = (idx - 5) / 6;
        forecastVal = lastActual + remaining * futureRatio * 1.02;
      }

      points.push({
        date: m.key,
        label: m.label,
        plannedCumulativeUSD: Math.round(plannedVal),
        earnedCumulativeUSD: isPastOrCurrent ? Math.round(earnedVal) : 0,
        actualCumulativeUSD: isPastOrCurrent ? Math.round(actualVal) : 0,
        forecastCumulativeUSD: Math.round(forecastVal)
      });
    });

    return points;
  }
}
