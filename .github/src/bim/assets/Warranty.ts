/**
 * EVLab BIM Core v1.3 - Warranty & Service Contract Engine
 * Tracks Equipment Warranties, Contractor Service Level Agreements (SLAs), Expiry Dates, and Claims.
 */

export interface WarrantyRecord {
  id: string;
  assetId: string;
  elementId: string;
  provider: string;
  contactEmail: string;
  contactPhone: string;
  coverageType: 'Parts & Labour' | 'Parts Only' | 'Compressor / Core Only' | 'Comprehensive Extended';
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Voided';
  terms: string;
  claimCount: number;
}

export class WarrantyEngine {
  public static evaluateWarrantyStatus(endDateStr: string, currentDateStr: string = '2026-06-15'): {
    status: 'Active' | 'Expiring Soon' | 'Expired';
    daysRemaining: number;
  } {
    const end = new Date(endDateStr).getTime();
    const curr = new Date(currentDateStr).getTime();
    const diffDays = Math.round((end - curr) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'Expired', daysRemaining: diffDays };
    } else if (diffDays <= 60) {
      return { status: 'Expiring Soon', daysRemaining: diffDays };
    } else {
      return { status: 'Active', daysRemaining: diffDays };
    }
  }
}
