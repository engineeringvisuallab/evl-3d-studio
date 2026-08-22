/**
 * EVLab BIM Core v1.3 - Master Asset Register Engine
 * Manages the full asset inventory, COBie data fields, live query & filter indexes, and linkage to 3D BIM Elements.
 */

import { BIMAsset, AssetCategory, AssetOperationalStatus } from './Asset';
import { MaintenanceEngine, MaintenanceTask } from './Maintenance';
import { HandoverEngine, HandoverChecklistItem } from './Handover';

export class AssetRegister {
  private assets: Map<string, BIMAsset> = new Map();
  private elementAssetMap: Map<string, string> = new Map(); // Element ID -> Asset ID
  private maintenanceEngine: MaintenanceEngine;
  private handoverChecklist: HandoverChecklistItem[];

  constructor() {
    this.maintenanceEngine = new MaintenanceEngine();
    this.handoverChecklist = HandoverEngine.getDefaultHandoverChecklist();
    this.initializeDefaultAssets();
  }

  private initializeDefaultAssets() {
    const defaultAssets: BIMAsset[] = [
      {
        id: 'ast_ahu_01',
        elementId: 'elem_ahu_01',
        tagCode: 'AHU-01',
        name: 'VAV Central Air Handling Unit 12,000 CFM',
        category: 'Mechanical',
        systemName: 'HVAC Supply Air 01',
        locationRoom: 'Mezzanine Plant Room M1',
        levelId: 'level_l2',
        manufacturer: 'Daikin Applied',
        modelNumber: 'Vision-CAH-12000',
        serialNumber: 'DAIK-2026-98124',
        installationDate: '2026-04-10',
        commissioningDate: '2026-05-01',
        expectedLifeYears: 20,
        replacementCostUSD: 45000,
        operationalStatus: 'Operational',
        warranty: {
          id: 'war_ahu_01',
          assetId: 'ast_ahu_01',
          elementId: 'elem_ahu_01',
          provider: 'Daikin Industries Inc.',
          contactEmail: 'support.commercial@daikin.com',
          contactPhone: '+1-800-432-1342',
          coverageType: 'Comprehensive Extended',
          startDate: '2026-05-01',
          endDate: '2031-05-01',
          status: 'Active',
          terms: '5-year full parts, labour & compressor warranty',
          claimCount: 0
        },
        maintenanceIntervalDays: 90,
        nextMaintenanceDate: '2026-06-15',
        documentsCount: 6,
        cobieAttributes: {
          'COBie.Component.Name': 'AHU-01',
          'COBie.Component.Space': 'Mezzanine Plant Room M1',
          'COBie.Type.Category': 'HVAC / Air Handling',
          'COBie.Type.NominalCapacity': '12,000 CFM',
          'COBie.Type.PowerRating': '22.5 kW'
        }
      },
      {
        id: 'ast_pump_01',
        elementId: 'elem_pump_01',
        tagCode: 'PUMP-CHW-01',
        name: 'Primary Chilled Water Circulation Pump 500 GPM',
        category: 'Mechanical',
        systemName: 'Hydronic Chilled Water',
        locationRoom: 'Basement Mechanical Room B1',
        levelId: 'level_l1',
        manufacturer: 'Grundfos Pumps',
        modelNumber: 'TPED 100-250/4',
        serialNumber: 'GRUN-88741-2026',
        installationDate: '2026-03-25',
        commissioningDate: '2026-04-15',
        expectedLifeYears: 15,
        replacementCostUSD: 18500,
        operationalStatus: 'Operational',
        warranty: {
          id: 'war_pump_01',
          assetId: 'ast_pump_01',
          elementId: 'elem_pump_01',
          provider: 'Grundfos North America',
          contactEmail: 'service@grundfos.com',
          contactPhone: '+1-800-333-1366',
          coverageType: 'Parts & Labour',
          startDate: '2026-04-15',
          endDate: '2028-04-15',
          status: 'Active',
          terms: '2-year standard parts and mechanical seal warranty',
          claimCount: 0
        },
        maintenanceIntervalDays: 180,
        nextMaintenanceDate: '2026-07-10',
        documentsCount: 4,
        cobieAttributes: {
          'COBie.Component.Name': 'PUMP-CHW-01',
          'COBie.Component.Space': 'Basement Mechanical Room B1',
          'COBie.Type.FlowRate': '500 GPM',
          'COBie.Type.HeadPressure': '85 ft',
          'COBie.Type.MotorPower': '15 HP'
        }
      },
      {
        id: 'ast_panel_01',
        elementId: 'elem_panel_main_01',
        tagCode: 'MDB-01',
        name: 'Main Low-Voltage Electrical Distribution Board 1600A',
        category: 'Electrical',
        systemName: 'Building Main Power Distribution',
        locationRoom: 'Electrical Substation Room B1',
        levelId: 'level_l1',
        manufacturer: 'Schneider Electric',
        modelNumber: 'Prisma Plus P 1600A',
        serialNumber: 'SCHN-2026-1109',
        installationDate: '2026-04-02',
        commissioningDate: '2026-04-20',
        expectedLifeYears: 25,
        replacementCostUSD: 62000,
        operationalStatus: 'Operational',
        warranty: {
          id: 'war_panel_01',
          assetId: 'ast_panel_01',
          elementId: 'elem_panel_main_01',
          provider: 'Schneider Electric Power Systems',
          contactEmail: 'support.power@se.com',
          contactPhone: '+1-800-555-7362',
          coverageType: 'Comprehensive Extended',
          startDate: '2026-04-20',
          endDate: '2029-04-20',
          status: 'Active',
          terms: '3-year parts and switchgear diagnostic warranty',
          claimCount: 0
        },
        maintenanceIntervalDays: 365,
        nextMaintenanceDate: '2026-08-20',
        documentsCount: 8,
        cobieAttributes: {
          'COBie.Component.Name': 'MDB-01',
          'COBie.Component.Space': 'Electrical Substation Room B1',
          'COBie.Type.RatedCurrent': '1600 A',
          'COBie.Type.Voltage': '400V 3-Phase',
          'COBie.Type.ShortCircuitRating': '50 kA'
        }
      },
      {
        id: 'ast_door_01',
        elementId: 'elem_door_main_01',
        tagCode: 'DR-101',
        name: 'Main Lobby Acoustic Fire-Rated Double Door 90min',
        category: 'Architectural',
        systemName: 'Means of Egress / Fire Barrier',
        locationRoom: 'Main Entrance Lobby',
        levelId: 'level_l1',
        manufacturer: 'Assa Abloy',
        modelNumber: 'Curries 707 Fire Doors',
        serialNumber: 'ASSA-2026-4402',
        installationDate: '2026-05-15',
        commissioningDate: '2026-05-20',
        expectedLifeYears: 30,
        replacementCostUSD: 4200,
        operationalStatus: 'Operational',
        warranty: {
          id: 'war_door_01',
          assetId: 'ast_door_01',
          elementId: 'elem_door_main_01',
          provider: 'Assa Abloy Architectural Hardware',
          contactEmail: 'architectural@assaabloy.com',
          contactPhone: '+1-800-499-2772',
          coverageType: 'Parts Only',
          startDate: '2026-05-20',
          endDate: '2036-05-20',
          status: 'Active',
          terms: '10-year door slab and hardware warranty',
          claimCount: 0
        },
        maintenanceIntervalDays: 180,
        nextMaintenanceDate: '2026-11-20',
        documentsCount: 2,
        cobieAttributes: {
          'COBie.Component.Name': 'DR-101',
          'COBie.Type.FireRating': '90 Minutes',
          'COBie.Type.AcousticRating': 'STC 45',
          'COBie.Type.Dimensions': '1800 x 2400 mm'
        }
      }
    ];

    defaultAssets.forEach((a) => {
      this.assets.set(a.id, a);
      this.elementAssetMap.set(a.elementId, a.id);
    });
  }

  public getAllAssets(): BIMAsset[] {
    return Array.from(this.assets.values());
  }

  public getAsset(id: string): BIMAsset | undefined {
    return this.assets.get(id);
  }

  public getAssetForElement(elementId: string): BIMAsset | undefined {
    const assetId = this.elementAssetMap.get(elementId);
    return assetId ? this.assets.get(assetId) : undefined;
  }

  public addAsset(asset: BIMAsset) {
    this.assets.set(asset.id, asset);
    this.elementAssetMap.set(asset.elementId, asset.id);
  }

  public updateAsset(id: string, updates: Partial<BIMAsset>) {
    const asset = this.assets.get(id);
    if (!asset) return;
    const updated = { ...asset, ...updates };
    this.assets.set(id, updated);
  }

  public getMaintenanceEngine(): MaintenanceEngine {
    return this.maintenanceEngine;
  }

  public getHandoverChecklist(): HandoverChecklistItem[] {
    return this.handoverChecklist;
  }

  public updateHandoverItem(id: string, isComplete: boolean) {
    const item = this.handoverChecklist.find((i) => i.id === id);
    if (item) {
      item.isComplete = isComplete;
      item.lastUpdated = new Date().toISOString().split('T')[0];
    }
  }

  public getAssetsByCategory(cat: AssetCategory): BIMAsset[] {
    return Array.from(this.assets.values()).filter((a) => a.category === cat);
  }

  public getAssetsByStatus(status: AssetOperationalStatus): BIMAsset[] {
    return Array.from(this.assets.values()).filter((a) => a.operationalStatus === status);
  }
}
