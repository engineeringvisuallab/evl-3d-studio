/**
 * EVLab BIM Core v1.3 - Asset Model
 * Authoritative 6D Asset representation directly mapped to persistent EVL Element ID.
 */

import { MaintenanceTask } from './Maintenance';
import { WarrantyRecord } from './Warranty';

export type AssetCategory = 'Mechanical' | 'Electrical' | 'Plumbing' | 'FireSafety' | 'Architectural' | 'Structural';

export type AssetOperationalStatus = 'Operational' | 'Standby' | 'Under Maintenance' | 'Degraded' | 'Failed' | 'Decommissioned';

export interface BIMAsset {
  id: string; // e.g. "ast_ahu_01"
  elementId: string; // EVL Element ID (Authoritative Link)
  tagCode: string; // e.g. "AHU-01", "PUMP-CHW-01", "MDB-01"
  name: string;
  category: AssetCategory;
  systemName: string; // e.g. "Supply Air System 1", "Chilled Water Primary"
  locationRoom: string; // e.g. "Mechanical Plant Room B1"
  levelId: string; // e.g. "level_l1"
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  installationDate: string;
  commissioningDate: string;
  expectedLifeYears: number;
  replacementCostUSD: number;
  operationalStatus: AssetOperationalStatus;
  warranty: WarrantyRecord;
  maintenanceIntervalDays: number;
  nextMaintenanceDate: string;
  documentsCount: number;
  cobieAttributes: Record<string, string>;
}
