/**
 * EVLab BIM Core v1.3 - 5D Cost Engine
 * Manages Model-to-BOQ-to-Cost synchronization, automatic cost re-evaluation upon geometry changes,
 * and cost rollups by Discipline, WBS, Level, and Cost Code.
 */

import { BIMElement } from '../core/BIMTypes';
import { RateDatabase, CostRateItem } from './RateDatabase';
import { BIMCostItem, CostItemEngine } from './CostItem';

/**
 * Used when neither a rate override, a cost-code match, nor any rate at
 * all exists in the database - keeps generateCostForElement() total-safe
 * (never throws, never silently reads undefined) at the cost of a
 * visibly-zero, clearly-flagged line item the estimator can fix up later.
 */
const FALLBACK_RATE: CostRateItem = {
  id: 'rate_fallback_unrated',
  costCode: '00-000',
  description: 'Unrated item - no matching rate found in RateDatabase',
  unit: 'nr',
  materialRateUSD: 0,
  labourRateUSD: 0,
  equipmentRateUSD: 0,
  wastePercent: 0,
  overheadPercent: 0,
  markupPercent: 0,
  discipline: 'Structural',
  location: 'Standard Regional',
  effectiveDate: new Date().toISOString().slice(0, 10),
};

export interface BOQDisciplineSummary {
  discipline: 'Architectural' | 'Structural' | 'MEP' | 'Civil';
  itemsCount: number;
  totalDirectUSD: number;
  totalOverheadUSD: number;
  totalMarkupUSD: number;
  grandTotalUSD: number;
}

export class CostEngine {
  private costItems: Map<string, BIMCostItem> = new Map(); // Element ID -> BIMCostItem
  private rateDatabase: RateDatabase;

  constructor(rateDatabase?: RateDatabase) {
    this.rateDatabase = rateDatabase || new RateDatabase();
  }

  public getRateDatabase(): RateDatabase {
    return this.rateDatabase;
  }

  public getAllCostItems(): BIMCostItem[] {
    return Array.from(this.costItems.values());
  }

  public getCostItem(elementId: string): BIMCostItem | undefined {
    return this.costItems.get(elementId);
  }

  /**
   * Automatically derives quantity and cost for a BIM element based on its category, material, and geometric parameters
   */
  public generateCostForElement(element: BIMElement, rateOverrideId?: string): BIMCostItem {
    let costCode = '03-300';
    let discipline: 'Architectural' | 'Structural' | 'MEP' | 'Civil' = 'Structural';
    let unit = 'm3';
    let quantity = 1.0;

    const w = (Number(element.instanceParameters?.['width']?.value) || Number(element.instanceParameters?.['length']?.value) || element.quantities?.lengthM || 3000) / 1000;
    const h = (Number(element.instanceParameters?.['height']?.value) || 3000) / 1000;
    const t = (Number(element.instanceParameters?.['thickness']?.value) || Number(element.instanceParameters?.['depth']?.value) || 200) / 1000;

    switch (element.category) {
      case 'Wall':
        costCode = '04-200'; // Masonry/Wall
        discipline = 'Architectural';
        unit = 'm2';
        quantity = element.quantities?.surfaceAreaM2 || (w * h);
        break;
      case 'Column':
        costCode = '03-300'; // Concrete
        discipline = 'Structural';
        unit = 'm3';
        quantity = element.quantities?.volumeM3 || (w * t * h);
        break;
      case 'Beam':
        costCode = '03-300';
        discipline = 'Structural';
        unit = 'm3';
        quantity = element.quantities?.volumeM3 || (w * t * 0.4);
        break;
      case 'Slab':
      case 'Footing':
        costCode = '03-300';
        discipline = 'Structural';
        unit = 'm3';
        quantity = element.quantities?.volumeM3 || (w * w * t);
        break;
      case 'Door':
        costCode = '08-100';
        discipline = 'Architectural';
        unit = 'nr';
        quantity = 1;
        break;
      case 'Window':
        costCode = '08-500';
        discipline = 'Architectural';
        unit = 'm2';
        quantity = element.quantities?.surfaceAreaM2 || (w * h);
        break;
      case 'Duct':
      case 'Equipment':
        costCode = '23-300';
        discipline = 'MEP';
        unit = 'm2';
        quantity = element.quantities?.surfaceAreaM2 || (w * 2 * (w + h));
        break;
      case 'Pipe':
      case 'CableTray':
        costCode = '22-100';
        discipline = 'MEP';
        unit = 'm';
        quantity = element.quantities?.lengthM || w;
        break;
      default:
        costCode = '03-300';
        discipline = 'Structural';
        unit = 'nr';
        quantity = 1;
    }

    const rate =
      (rateOverrideId
        ? this.rateDatabase.getRate(rateOverrideId)
        : this.rateDatabase.getRateByCostCode(costCode) || this.rateDatabase.getAllRates()[0]) ?? FALLBACK_RATE;

    const breakdown = CostItemEngine.calculateCost(
      Math.max(0.1, quantity),
      unit,
      rate.materialRateUSD,
      rate.labourRateUSD,
      rate.equipmentRateUSD,
      rate.wastePercent,
      rate.overheadPercent,
      rate.markupPercent
    );

    const costItem: BIMCostItem = {
      id: `cost_${element.id}`,
      elementId: element.id,
      rateId: rate.id,
      costCode: rate.costCode,
      description: `${element.name} - ${rate.description}`,
      wbsCode: '1.2',
      discipline,
      quantity: breakdown.quantity,
      unit: breakdown.unit,
      materialRateUSD: rate.materialRateUSD,
      labourRateUSD: rate.labourRateUSD,
      equipmentRateUSD: rate.equipmentRateUSD,
      wastePercent: rate.wastePercent,
      overheadPercent: rate.overheadPercent,
      markupPercent: rate.markupPercent,
      breakdown,
      lastUpdated: new Date().toISOString()
    };

    this.costItems.set(element.id, costItem);
    return costItem;
  }

  /**
   * Synchronizes and calculates costs for all elements in the BIM model
   */
  public syncModelCosts(elements: Map<string, BIMElement>): BIMCostItem[] {
    const results: BIMCostItem[] = [];
    elements.forEach((elem) => {
      const item = this.generateCostForElement(elem);
      results.push(item);
    });
    return results;
  }

  public getDisciplineSummaries(): BOQDisciplineSummary[] {
    const summaries: Record<string, BOQDisciplineSummary> = {
      Architectural: { discipline: 'Architectural', itemsCount: 0, totalDirectUSD: 0, totalOverheadUSD: 0, totalMarkupUSD: 0, grandTotalUSD: 0 },
      Structural: { discipline: 'Structural', itemsCount: 0, totalDirectUSD: 0, totalOverheadUSD: 0, totalMarkupUSD: 0, grandTotalUSD: 0 },
      MEP: { discipline: 'MEP', itemsCount: 0, totalDirectUSD: 0, totalOverheadUSD: 0, totalMarkupUSD: 0, grandTotalUSD: 0 },
      Civil: { discipline: 'Civil', itemsCount: 0, totalDirectUSD: 0, totalOverheadUSD: 0, totalMarkupUSD: 0, grandTotalUSD: 0 }
    };

    this.costItems.forEach((item) => {
      const disc = summaries[item.discipline] || summaries.Structural;
      disc.itemsCount++;
      disc.totalDirectUSD += item.breakdown.directCostTotalUSD;
      disc.totalOverheadUSD += item.breakdown.overheadUSD;
      disc.totalMarkupUSD += item.breakdown.markupUSD;
      disc.grandTotalUSD += item.breakdown.totalCostUSD;
    });

    return Object.values(summaries);
  }

  public getTotalProjectCostUSD(): number {
    let total = 0;
    this.costItems.forEach((item) => {
      total += item.breakdown.totalCostUSD;
    });
    return Number(total.toFixed(2));
  }
}
