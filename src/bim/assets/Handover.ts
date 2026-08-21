/**
 * EVLab BIM Core v1.3 - Digital Handover & COBie Asset Compliance Engine
 * Validates documentation completeness, asset tagging, O&M manuals, warranties, commissioning test certificates.
 */

export interface HandoverChecklistItem {
  id: string;
  category: 'Asset Register' | 'O&M Manuals' | 'Warranties' | 'Commissioning Tests' | 'As-Built Drawings' | 'COBie Data';
  name: string;
  required: boolean;
  isComplete: boolean;
  documentCount: number;
  lastUpdated: string;
  responsibleParty: string;
}

export interface HandoverComplianceReport {
  overallScorePercent: number;
  isReadyForHandover: boolean;
  completedItemsCount: number;
  totalItemsCount: number;
  missingMandatoryItems: string[];
  checklist: HandoverChecklistItem[];
}

export class HandoverEngine {
  public static evaluateHandoverReadiness(checklist: HandoverChecklistItem[]): HandoverComplianceReport {
    let completed = 0;
    const missing: string[] = [];

    checklist.forEach((item) => {
      if (item.isComplete) {
        completed++;
      } else if (item.required) {
        missing.push(item.name);
      }
    });

    const overallScorePercent = checklist.length > 0 ? Math.round((completed / checklist.length) * 100) : 0;
    const isReadyForHandover = missing.length === 0 && overallScorePercent >= 90;

    return {
      overallScorePercent,
      isReadyForHandover,
      completedItemsCount: completed,
      totalItemsCount: checklist.length,
      missingMandatoryItems: missing,
      checklist
    };
  }

  public static getDefaultHandoverChecklist(): HandoverChecklistItem[] {
    return [
      {
        id: 'ho_01',
        category: 'Asset Register',
        name: 'COBie Type and Component Data Export',
        required: true,
        isComplete: true,
        documentCount: 1,
        lastUpdated: '2026-06-10',
        responsibleParty: 'BIM Manager'
      },
      {
        id: 'ho_02',
        category: 'O&M Manuals',
        name: 'HVAC Air Handling & Chiller Operation Manuals',
        required: true,
        isComplete: true,
        documentCount: 4,
        lastUpdated: '2026-06-08',
        responsibleParty: 'MEP Subcontractor'
      },
      {
        id: 'ho_03',
        category: 'Warranties',
        name: 'Manufacturer Equipment Warranty Certificates',
        required: true,
        isComplete: true,
        documentCount: 12,
        lastUpdated: '2026-06-01',
        responsibleParty: 'Main Contractor'
      },
      {
        id: 'ho_04',
        category: 'Commissioning Tests',
        name: 'Air Balancing (TAB) & Hydronic Test Reports',
        required: true,
        isComplete: true,
        documentCount: 3,
        lastUpdated: '2026-06-12',
        responsibleParty: 'Commissioning Agent'
      },
      {
        id: 'ho_05',
        category: 'Commissioning Tests',
        name: 'Fire Protection Hydrostatic Pressure Test Certificates',
        required: true,
        isComplete: false,
        documentCount: 0,
        lastUpdated: '2026-06-01',
        responsibleParty: 'Fire Protection Engineer'
      },
      {
        id: 'ho_06',
        category: 'As-Built Drawings',
        name: 'Arch/Struct/MEP As-Built IFC 4 & PDF Set',
        required: true,
        isComplete: true,
        documentCount: 48,
        lastUpdated: '2026-06-14',
        responsibleParty: 'Lead Architect'
      }
    ];
  }
}
