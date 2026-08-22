/**
 * EVLab BIM Core v1.3 - Centralized Unit Rate Database
 * Provides regional cost rates (Material, Labor, Equipment), Multi-currency conversion (USD, BDT, EUR, GBP),
 * and standard CSI MasterFormat / UniFormat / EVLab classifications.
 */

export type CurrencyCode = 'USD' | 'BDT' | 'EUR' | 'GBP';

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  rateToUSD: number; // 1 USD = N target currency (e.g. USD=1.0, BDT=120.0, EUR=0.92, GBP=0.79)
}

export const CURRENCY_RATES: Record<CurrencyCode, CurrencyRate> = {
  USD: { code: 'USD', symbol: '$', rateToUSD: 1.0 },
  BDT: { code: 'BDT', symbol: '৳', rateToUSD: 120.0 },
  EUR: { code: 'EUR', symbol: '€', rateToUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', rateToUSD: 0.79 }
};

export interface CostRateItem {
  id: string;
  costCode: string;
  description: string;
  unit: 'm3' | 'm2' | 'm' | 'kg' | 'ton' | 'nr' | 'lot' | 'hour';
  materialRateUSD: number;
  labourRateUSD: number;
  equipmentRateUSD: number;
  wastePercent: number; // e.g. 5 = 5%
  overheadPercent: number; // e.g. 10 = 10%
  markupPercent: number; // e.g. 15 = 15%
  discipline: 'Architectural' | 'Structural' | 'MEP' | 'Civil';
  location: string;
  effectiveDate: string;
}

export const DEFAULT_COST_RATES: CostRateItem[] = [
  {
    id: 'rate_concrete_m30',
    costCode: '03-300',
    description: 'Ready-Mix Concrete M30 Grade (Cast-in-Place)',
    unit: 'm3',
    materialRateUSD: 95.0,
    labourRateUSD: 30.0,
    equipmentRateUSD: 15.0,
    wastePercent: 3.0,
    overheadPercent: 8.0,
    markupPercent: 12.0,
    discipline: 'Structural',
    location: 'Standard Regional',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'rate_rebar_fe500',
    costCode: '03-200',
    description: 'High-Yield Deformed Steel Rebar Fe500',
    unit: 'kg',
    materialRateUSD: 0.95,
    labourRateUSD: 0.25,
    equipmentRateUSD: 0.05,
    wastePercent: 5.0,
    overheadPercent: 8.0,
    markupPercent: 10.0,
    discipline: 'Structural',
    location: 'Standard Regional',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'rate_aac_blockwork',
    costCode: '04-200',
    description: '200mm AAC Lightweight Masonry Blockwork Wall',
    unit: 'm2',
    materialRateUSD: 28.0,
    labourRateUSD: 14.0,
    equipmentRateUSD: 2.0,
    wastePercent: 4.0,
    overheadPercent: 10.0,
    markupPercent: 15.0,
    discipline: 'Architectural',
    location: 'Standard Regional',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'rate_drywall_partition',
    costCode: '09-200',
    description: '100mm Gypsum Drywall Partition with Acoustic Insulation',
    unit: 'm2',
    materialRateUSD: 22.0,
    labourRateUSD: 12.0,
    equipmentRateUSD: 1.5,
    wastePercent: 5.0,
    overheadPercent: 10.0,
    markupPercent: 15.0,
    discipline: 'Architectural',
    location: 'Standard Regional',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'rate_hvac_ducting',
    costCode: '23-300',
    description: 'GI Sheet Rectangular HVAC Ductwork 0.8mm',
    unit: 'm2',
    materialRateUSD: 35.0,
    labourRateUSD: 20.0,
    equipmentRateUSD: 5.0,
    wastePercent: 8.0,
    overheadPercent: 12.0,
    markupPercent: 18.0,
    discipline: 'MEP',
    location: 'Standard Regional',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'rate_upvc_drainage',
    costCode: '22-100',
    description: '110mm uPVC Soil & Drainage Piping System',
    unit: 'm',
    materialRateUSD: 18.0,
    labourRateUSD: 9.0,
    equipmentRateUSD: 1.0,
    wastePercent: 5.0,
    overheadPercent: 10.0,
    markupPercent: 15.0,
    discipline: 'MEP',
    location: 'Standard Regional',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'rate_door_acoustic',
    costCode: '08-100',
    description: 'Commercial Flush Timber Fire/Acoustic Door Set',
    unit: 'nr',
    materialRateUSD: 320.0,
    labourRateUSD: 65.0,
    equipmentRateUSD: 5.0,
    wastePercent: 0.0,
    overheadPercent: 10.0,
    markupPercent: 15.0,
    discipline: 'Architectural',
    location: 'Standard Regional',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'rate_window_glazed',
    costCode: '08-500',
    description: 'Double-Glazed Thermal Break Aluminum Window',
    unit: 'm2',
    materialRateUSD: 140.0,
    labourRateUSD: 35.0,
    equipmentRateUSD: 8.0,
    wastePercent: 2.0,
    overheadPercent: 10.0,
    markupPercent: 15.0,
    discipline: 'Architectural',
    location: 'Standard Regional',
    effectiveDate: '2026-01-01'
  }
];

export class RateDatabase {
  private rates: Map<string, CostRateItem> = new Map();
  private activeCurrency: CurrencyCode = 'USD';

  constructor(initialRates: CostRateItem[] = DEFAULT_COST_RATES) {
    initialRates.forEach((r) => this.rates.set(r.id, r));
  }

  public getAllRates(): CostRateItem[] {
    return Array.from(this.rates.values());
  }

  public getRate(id: string): CostRateItem | undefined {
    return this.rates.get(id);
  }

  public getRateByCostCode(costCode: string): CostRateItem | undefined {
    return Array.from(this.rates.values()).find((r) => r.costCode === costCode);
  }

  public addRate(rate: CostRateItem) {
    this.rates.set(rate.id, rate);
  }

  public getActiveCurrency(): CurrencyCode {
    return this.activeCurrency;
  }

  public setActiveCurrency(currency: CurrencyCode) {
    this.activeCurrency = currency;
  }

  public convertFromUSD(amountUSD: number, targetCurrency: CurrencyCode = this.activeCurrency): number {
    const rateInfo = CURRENCY_RATES[targetCurrency] || CURRENCY_RATES.USD;
    return amountUSD * rateInfo.rateToUSD;
  }

  public formatCurrency(amountUSD: number, currency: CurrencyCode = this.activeCurrency): string {
    const rateInfo = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
    const converted = amountUSD * rateInfo.rateToUSD;
    return `${rateInfo.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
