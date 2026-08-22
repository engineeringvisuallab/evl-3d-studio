/**
 * EVLab BIM Core v1.3 - Construction Activity Model
 * Authoritative activity tracking linked to WBS, Calendar, Dependencies, Costs, and BIM Element IDs.
 */

import { ConstructionState } from './ConstructionState';
import { ActivityDependency } from './ActivityDependency';

export interface ConstructionActivity {
  id: string;
  name: string;
  wbsCode: string;
  wbsId: string;
  description: string;
  discipline: 'Architectural' | 'Structural' | 'MEP' | 'Civil' | 'General';
  phase: string;
  zone: string;
  startDate: string; // ISO string "YYYY-MM-DD"
  finishDate: string; // ISO string "YYYY-MM-DD"
  durationDays: number;
  calendarId: string;
  status: ConstructionState;
  progressPercent: number; // 0 to 100
  plannedPercent?: number;
  actualPercent?: number;
  dependencies: ActivityDependency[];
  assignedElementIds: string[]; // Authoritative EVL Element IDs
  costCode: string;
  budgetCostUSD: number;
  actualCostUSD: number;
}
