/**
 * EVLab BIM Core v1.2 - IFC 4 / 4.3 Property Set & Quantity Set Generator
 * Generates buildingSMART standard IFC property sets and EVLab extended engineering property sets.
 */

import { BIMElement } from '../core/BIMTypes';
import { CENTRAL_MATERIAL_DATABASE } from '../core/MaterialSystem';

export class IFCPropertySets {
  public static generateStandardPsets(element: BIMElement): { name: string; properties: Record<string, any> }[] {
    const mat = CENTRAL_MATERIAL_DATABASE[element.materialId] || CENTRAL_MATERIAL_DATABASE.mat_concrete;
    const psets: { name: string; properties: Record<string, any> }[] = [];

    // 1. Common Category Pset
    const cat = element.category;
    let commonPsetName = `Pset_${cat}Common`;
    if (cat === 'Floor') commonPsetName = 'Pset_SlabCommon';

    const commonProps: Record<string, any> = {
      Reference: element.typeId || element.familyId,
      Status: 'NEW',
      LoadBearing: element.discipline === 'Structure',
      IsExternal: element.name.toLowerCase().includes('exterior') || element.name.toLowerCase().includes('facade'),
      FireRating: 'FRR-120/120/120',
      AcousticRating: 'Rw 48 dB'
    };

    psets.push({ name: commonPsetName, properties: commonProps });

    // 2. EVLab Extended Engineering Pset
    psets.push({
      name: 'Pset_EVL_Engineering',
      properties: {
        EVL_ElementID: element.id,
        EVL_InstanceName: element.instanceName,
        MaterialName: mat.name,
        Density_kg_m3: mat.densityKgM3,
        YieldStrength_MPa: mat.yieldStrengthMPa || 30,
        EmbodiedCarbon_kgCO2e: 0.15,
        ThermalConductivity_W_mK: mat.thermalConductivityWMK || 1.2
      }
    });

    // 3. EVLab Cost & Procurement Pset
    psets.push({
      name: 'Pset_EVL_Cost',
      properties: {
        EstimatedTotalCost_USD: element.quantities?.costTotal || 0,
        UnitRate_USD: mat.costPerM3 || mat.costPerM2 || mat.costPerM || 150,
        Currency: 'USD',
        ProcurementPhase: element.phaseId || 'Phase 2 - Superstructure'
      }
    });

    // 4. EVLab Operations & Maintenance Pset
    psets.push({
      name: 'Pset_EVL_OandM',
      properties: {
        DesignLifeYears: 50,
        MaintenanceCycleMonths: 12,
        WarrantyYears: 10,
        Manufacturer: 'EVLab Engineering Systems'
      }
    });

    return psets;
  }
}
