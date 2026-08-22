/**
 * EVLab BIM Core v1.4 - Cost Item Model + Calculation Engine
 * Defines the per-element BOQ line (BIMCostItem) that CostEngine produces,
 * and the pure calculation (CostItemEngine) that turns a quantity + unit
 * rates into a full material/labour/equipment -> waste -> overhead ->
 * markup cost breakdown. This is the missing module CostEngine.ts imports;
 * its field names (breakdown.directCostTotalUSD, .overheadUSD, .markupUSD,
 * .totalCostUSD, .quantity, .unit) match exactly what CostEngine already
 * reads.
 */

export interface CostBreakdown {
  quantity: number;
  unit: string;
  materialCostUSD: number;
  labourCostUSD: number;
  equipmentCostUSD: number;
  wasteCostUSD: number; // informational - the material cost attributable to the waste allowance, already folded into materialCostUSD
  directCostTotalUSD: number; // materialCostUSD + labourCostUSD + equipmentCostUSD
  overheadUSD: number;
  markupUSD: number;
  totalCostUSD: number; // directCostTotalUSD + overheadUSD + markupUSD
  formulaTraceId?: string; // audit id linking this breakdown back to the rate/formula run that produced it
}

export interface BIMCostItem {
  id: string;
  elementId: string;
  rateId: string;
  costCode: string;
  description: string;
  wbsCode: string;
  discipline: 'Architectural' | 'Structural' | 'MEP' | 'Civil';
  quantity: number;
  unit: string;
  materialRateUSD: number;
  labourRateUSD: number;
  equipmentRateUSD: number;
  wastePercent: number;
  overheadPercent: number;
  markupPercent: number;
  breakdown: CostBreakdown;
  lastUpdated: string; // ISO timestamp
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class CostItemEngine {
  /**
   * Standard estimating sequence: waste inflates the *material* quantity
   * only (labour/equipment are priced per unit of work performed, not per
   * unit purchased), then overhead and markup layer on top of the summed
   * direct cost. All monetary outputs are rounded to cents.
   */
  public static calculateCost(
    quantity: number,
    unit: string,
    materialRateUSD: number,
    labourRateUSD: number,
    equipmentRateUSD: number,
    wastePercent: number,
    overheadPercent: number,
    markupPercent: number
  ): CostBreakdown {
    const wastedQuantity = quantity * (1 + wastePercent / 100);

    const materialCostUSD = wastedQuantity * materialRateUSD;
    const labourCostUSD = quantity * labourRateUSD;
    const equipmentCostUSD = quantity * equipmentRateUSD;
    const wasteCostUSD = (wastedQuantity - quantity) * materialRateUSD;

    const directCostTotalUSD = materialCostUSD + labourCostUSD + equipmentCostUSD;
    const overheadUSD = directCostTotalUSD * (overheadPercent / 100);
    const markupUSD = (directCostTotalUSD + overheadUSD) * (markupPercent / 100);
    const totalCostUSD = directCostTotalUSD + overheadUSD + markupUSD;

    return {
      quantity: round2(quantity),
      unit,
      materialCostUSD: round2(materialCostUSD),
      labourCostUSD: round2(labourCostUSD),
      equipmentCostUSD: round2(equipmentCostUSD),
      wasteCostUSD: round2(wasteCostUSD),
      directCostTotalUSD: round2(directCostTotalUSD),
      overheadUSD: round2(overheadUSD),
      markupUSD: round2(markupUSD),
      totalCostUSD: round2(totalCostUSD),
    };
  }
}
