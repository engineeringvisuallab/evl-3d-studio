/**
 * EVLab BIM Core v1.3 - Construction Progress Engine
 * Calculates activity-level and project-wide progress using weighted quantity, cost, or duration methods.
 */

import { ConstructionActivity } from './Activity';

export interface ProjectProgressSummary {
  overallProgressPercent: number;
  totalActivitiesCount: number;
  completedActivitiesCount: number;
  inProgressActivitiesCount: number;
  notStartedActivitiesCount: number;
  delayedActivitiesCount: number;
  totalBudgetCostUSD: number;
  earnedValueUSD: number;
  actualCostUSD: number;
}

export class ProgressEngine {
  /**
   * Calculates overall project progress weighted by activity budget costs (Cost-Weighted Progress)
   */
  public static calculateOverallProgress(activities: ConstructionActivity[]): ProjectProgressSummary {
    if (activities.length === 0) {
      return {
        overallProgressPercent: 0,
        totalActivitiesCount: 0,
        completedActivitiesCount: 0,
        inProgressActivitiesCount: 0,
        notStartedActivitiesCount: 0,
        delayedActivitiesCount: 0,
        totalBudgetCostUSD: 0,
        earnedValueUSD: 0,
        actualCostUSD: 0
      };
    }

    let totalBudget = 0;
    let earnedValue = 0;
    let actualCost = 0;

    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let delayed = 0;

    activities.forEach((act) => {
      totalBudget += act.budgetCostUSD || 1000;
      earnedValue += (act.budgetCostUSD || 1000) * ((act.progressPercent || 0) / 100);
      actualCost += act.actualCostUSD || 0;

      if (act.status === 'Completed' || act.progressPercent >= 100) {
        completed++;
      } else if (act.status === 'In Progress' || (act.progressPercent > 0 && act.progressPercent < 100)) {
        inProgress++;
      } else if (act.status === 'Delayed') {
        delayed++;
      } else {
        notStarted++;
      }
    });

    const overallProgressPercent = totalBudget > 0 ? (earnedValue / totalBudget) * 100 : 0;

    return {
      overallProgressPercent: Number(overallProgressPercent.toFixed(1)),
      totalActivitiesCount: activities.length,
      completedActivitiesCount: completed,
      inProgressActivitiesCount: inProgress,
      notStartedActivitiesCount: notStarted,
      delayedActivitiesCount: delayed,
      totalBudgetCostUSD: totalBudget,
      earnedValueUSD: earnedValue,
      actualCostUSD: actualCost
    };
  }
}
