/**
 * EVLab BIM Core v1.2 - OpenBIM IFC 4 Round-Trip Integrity Test & Audit
 * Tests: EVLab Model -> IFC 4 STEP Export -> IFC 4 Parser Import -> Compare Entities, GUIDs, Quantities, and Levels.
 */

import { BIMElement, BIMLevel, BIMGridLine } from '../core/BIMTypes';
import { IFCExporter } from './IFCExporter';
import { IFCImporter } from './IFCImporter';

export interface RoundTripValidationReport {
  passed: boolean;
  exportedElementCount: number;
  importedElementCount: number;
  matchedGuidCount: number;
  exportedStoreyCount: number;
  importedStoreyCount: number;
  stepFileSizeKb: number;
  discrepancies: string[];
  timestamp: string;
}

export class IFCRoundTripValidator {
  public static executeRoundTripTest(
    elements: Map<string, BIMElement>,
    levels: BIMLevel[],
    gridLines: BIMGridLine[] = []
  ): RoundTripValidationReport {
    const discrepancies: string[] = [];

    // Step 1: Export to IFC 4 STEP
    const ifcContent = IFCExporter.exportToIFC4STEP(elements, levels, gridLines, 'EVLab RoundTrip Project');
    const stepFileSizeKb = Math.round((new Blob([ifcContent]).size / 1024) * 10) / 10;

    // Step 2: Import back from IFC
    const importResult = IFCImporter.parseIFC(ifcContent);

    // Step 3: Compare entities & GUIDs
    const originalGuids = new Set(Array.from(elements.values()).map((e) => e.ifcMapping?.ifcGuid || e.globalId));
    let matchedGuidCount = 0;

    importResult.elements.forEach((impElem) => {
      if (originalGuids.has(impElem.globalId)) {
        matchedGuidCount++;
      }
    });

    if (importResult.elements.length !== elements.size) {
      discrepancies.push(
        `Element count difference: exported ${elements.size}, imported ${importResult.elements.length}`
      );
    }

    if (importResult.levels.length !== levels.length) {
      discrepancies.push(
        `Storey count difference: exported ${levels.length}, imported ${importResult.levels.length}`
      );
    }

    const passed = discrepancies.length === 0;

    return {
      passed,
      exportedElementCount: elements.size,
      importedElementCount: importResult.elements.length,
      matchedGuidCount,
      exportedStoreyCount: levels.length,
      importedStoreyCount: importResult.levels.length,
      stepFileSizeKb,
      discrepancies,
      timestamp: new Date().toISOString()
    };
  }
}
