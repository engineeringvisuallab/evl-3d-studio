/**
 * EVLab BIM Core v1.3 - Unified 4D/5D/6D Relationship Graph
 * Centralized relational index mapping EVL Element IDs to WBS, Activities, Costs, Assets, and BCF Issues.
 */

import { BIMElement } from '../core/BIMTypes';
import { TimelineEngine } from '../construction/TimelineEngine';
import { WBSEngine } from '../construction/WBS';
import { CostEngine } from '../cost/CostEngine';
import { AssetRegister } from '../assets/AssetRegister';
import { CoordinationEngine } from '../coordination/CoordinationEngine';
import { ConstructionActivity } from '../construction/Activity';
import { BIMCostItem } from '../cost/CostItem';
import { BIMAsset } from '../assets/Asset';
import { MaintenanceTask } from '../assets/Maintenance';
import { BCFIssue } from '../core/BIMTypes';

export interface UnifiedElementIntelligence {
  elementId: string;
  elementName: string;
  category: string;
  levelName: string;
  
  // 4D Construction
  linkedActivities: ConstructionActivity[];
  constructionState: string;
  constructionProgress: number;

  // 5D Cost
  costItem?: BIMCostItem;
  totalCostUSD: number;
  costCode: string;

  // 6D Asset
  asset?: BIMAsset;
  maintenanceTasks: MaintenanceTask[];
  warrantyStatus?: string;

  // BCF Coordination
  linkedIssues: BCFIssue[];
}

export class BIM4D5D6DGraph {
  public static buildElementIntelligence(
    element: BIMElement,
    timelineEngine: TimelineEngine,
    costEngine: CostEngine,
    assetRegister: AssetRegister,
    coordinationEngine: CoordinationEngine
  ): UnifiedElementIntelligence {
    const actState = timelineEngine.evaluateElementStateAtDate(element.id, timelineEngine.getCurrentDate());
    const linkedActs = timelineEngine.getActivitiesForElement(element.id);
    const costItem = costEngine.getCostItem(element.id) || costEngine.generateCostForElement(element);
    const asset = assetRegister.getAssetForElement(element.id);
    const maintenanceTasks = assetRegister.getMaintenanceEngine().getTasksForElement(element.id);
    const issues = coordinationEngine.getIssuesForElement(element.id);

    return {
      elementId: element.id,
      elementName: element.name,
      category: element.category,
      levelName: element.levelId,
      linkedActivities: linkedActs,
      constructionState: actState.state,
      constructionProgress: actState.progressPercent,
      costItem,
      totalCostUSD: costItem?.breakdown.totalCostUSD || 0,
      costCode: costItem?.costCode || '03-300',
      asset,
      maintenanceTasks,
      warrantyStatus: asset?.warranty.status,
      linkedIssues: issues
    };
  }
}
