/**
 * EVLab BIM Core v1.3 - Project Intelligence Dashboard Engine
 * Computes live, cross-domain project analytics (4D Schedule, 5D Cost/EVM, 6D Assets, Coordination, BIM Health).
 */

import { TimelineEngine } from '../construction/TimelineEngine';
import { ProgressEngine, ProjectProgressSummary } from '../construction/ProgressEngine';
import { BaselineEngine, ScheduleVarianceReport } from '../construction/Baseline';
import { CostEngine } from '../cost/CostEngine';
import { EarnedValueEngine, EVMPerformanceSummary } from '../cost/EarnedValueEngine';
import { CostCurveEngine, SCurveDataPoint } from '../cost/CostCurve';
import { AssetRegister } from '../assets/AssetRegister';
import { HandoverEngine, HandoverComplianceReport } from '../assets/Handover';
import { BIMElement } from '../core/BIMTypes';

export interface ProjectIntelligenceKPIs {
  // 4D Metrics
  progressSummary: ProjectProgressSummary;
  scheduleVariances: ScheduleVarianceReport[];
  criticalPathCount: number;

  // 5D Metrics
  evm: EVMPerformanceSummary;
  sCurve: SCurveDataPoint[];
  totalProjectCostUSD: number;

  // 6D Metrics
  totalAssetsCount: number;
  operationalAssetsCount: number;
  pendingMaintenanceCount: number;
  overdueMaintenanceCount: number;
  expiringWarrantiesCount: number;
  handoverReport: HandoverComplianceReport;

  // BIM Health
  bimElementsCount: number;
  overallProjectHealthScore: number;
}

export class ProjectIntelligenceEngine {
  public static computeKPIs(
    elements: Map<string, BIMElement>,
    timelineEngine: TimelineEngine,
    baselineEngine: BaselineEngine,
    costEngine: CostEngine,
    assetRegister: AssetRegister
  ): ProjectIntelligenceKPIs {
    const activities = timelineEngine.getAllActivities();
    const progressSummary = ProgressEngine.calculateOverallProgress(activities);
    const scheduleVariances = baselineEngine.calculateVariances(activities);
    const evm = EarnedValueEngine.calculateEVM(activities, timelineEngine.getCurrentDate());
    const sCurve = CostCurveEngine.generateSCurve(activities, timelineEngine.getCurrentDate());
    const totalProjectCostUSD = costEngine.getTotalProjectCostUSD();

    const allAssets = assetRegister.getAllAssets();
    const operationalAssets = allAssets.filter((a) => a.operationalStatus === 'Operational');
    const allTasks = assetRegister.getMaintenanceEngine().getAllTasks();
    const pendingTasks = allTasks.filter((t) => t.status === 'Scheduled' || t.status === 'In Progress');
    const overdueTasks = allTasks.filter((t) => t.status === 'Overdue');
    const expiringWarranties = allAssets.filter((a) => a.warranty.status === 'Expiring Soon' || a.warranty.status === 'Expired');
    const handoverReport = HandoverEngine.evaluateHandoverReadiness(assetRegister.getHandoverChecklist());

    // Project Health Score: Weighted composite of Progress, CPI/SPI, Asset uptime, and Handover readiness
    const scheduleHealthScore = Math.min(100, Math.max(0, evm.spi * 90));
    const costHealthScore = Math.min(100, Math.max(0, evm.cpi * 90));
    const assetHealthScore = allAssets.length > 0 ? (operationalAssets.length / allAssets.length) * 100 : 100;
    const handoverHealthScore = handoverReport.overallScorePercent;

    const overallProjectHealthScore = Math.round(
      scheduleHealthScore * 0.3 +
      costHealthScore * 0.3 +
      assetHealthScore * 0.2 +
      handoverHealthScore * 0.2
    );

    return {
      progressSummary,
      scheduleVariances,
      criticalPathCount: activities.filter((a) => a.dependencies.length > 0).length,
      evm,
      sCurve,
      totalProjectCostUSD,
      totalAssetsCount: allAssets.length,
      operationalAssetsCount: operationalAssets.length,
      pendingMaintenanceCount: pendingTasks.length,
      overdueMaintenanceCount: overdueTasks.length,
      expiringWarrantiesCount: expiringWarranties.length,
      handoverReport,
      bimElementsCount: elements.size,
      overallProjectHealthScore
    };
  }
}
