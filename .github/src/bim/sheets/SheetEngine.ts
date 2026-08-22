/**
 * EVLab BIM Core v1.2 - Professional Sheet & Documentation Engine 2.0
 * Manages drawing sheets (A101, A201, S101, M101) with Title Blocks, Project Revisions, and live viewports.
 */

import { BIMSheet, BIMViewport, BIMView } from '../core/BIMTypes';

export class SheetEngine {
  private sheets: Map<string, BIMSheet> = new Map();

  constructor() {
    this.initializeDefaultSheets();
  }

  public initializeDefaultSheets(): void {
    this.sheets.clear();

    const a101: BIMSheet = {
      id: 'sheet_a101',
      sheetNumber: 'A101',
      sheetName: 'GROUND FLOOR ARCHITECTURAL PLAN',
      size: 'A1',
      titleBlock: {
        projectName: 'EVLab BIM Advanced Facility',
        projectNumber: 'EVL-2026-BIM',
        client: 'Universal Engineering Corp.',
        drawnBy: 'EVLab BIM AI',
        checkedBy: 'Chief Architect',
        approvedBy: 'Lead BIM Director',
        date: '2026-08-20',
        revision: 'Rev. 2',
        status: 'For Construction'
      },
      viewports: [
        {
          id: 'vp_a101_1',
          viewId: 'view_plan_lvl_01_ground',
          title: 'Ground Floor Plan',
          positionOnSheetMm: { x: 50, y: 50 },
          scale: '1:100',
          detailNumber: 1
        }
      ]
    };
    this.sheets.set(a101.id, a101);

    const a201: BIMSheet = {
      id: 'sheet_a201',
      sheetNumber: 'A201',
      sheetName: 'BUILDING ELEVATIONS',
      size: 'A1',
      titleBlock: {
        projectName: 'EVLab BIM Advanced Facility',
        projectNumber: 'EVL-2026-BIM',
        client: 'Universal Engineering Corp.',
        drawnBy: 'EVLab BIM AI',
        checkedBy: 'Chief Architect',
        approvedBy: 'Lead BIM Director',
        date: '2026-08-20',
        revision: 'Rev. 1',
        status: 'For Construction'
      },
      viewports: [
        {
          id: 'vp_a201_1',
          viewId: 'view_elev_south',
          title: 'South Elevation',
          positionOnSheetMm: { x: 50, y: 50 },
          scale: '1:100',
          detailNumber: 1
        },
        {
          id: 'vp_a201_2',
          viewId: 'view_elev_north',
          title: 'North Elevation',
          positionOnSheetMm: { x: 450, y: 50 },
          scale: '1:100',
          detailNumber: 2
        }
      ]
    };
    this.sheets.set(a201.id, a201);

    const s101: BIMSheet = {
      id: 'sheet_s101',
      sheetNumber: 'S101',
      sheetName: 'FOUNDATION & STRUCTURAL FRAMING PLAN',
      size: 'A1',
      titleBlock: {
        projectName: 'EVLab BIM Advanced Facility',
        projectNumber: 'EVL-2026-BIM',
        client: 'Universal Engineering Corp.',
        drawnBy: 'EVLab BIM AI',
        checkedBy: 'Principal Structural Eng.',
        approvedBy: 'Lead BIM Director',
        date: '2026-08-20',
        revision: 'Rev. 1',
        status: 'For Construction'
      },
      viewports: [
        {
          id: 'vp_s101_1',
          viewId: 'view_plan_lvl_00_found',
          title: 'Foundation Framing Plan',
          positionOnSheetMm: { x: 50, y: 50 },
          scale: '1:100',
          detailNumber: 1
        }
      ]
    };
    this.sheets.set(s101.id, s101);

    const m101: BIMSheet = {
      id: 'sheet_m101',
      sheetNumber: 'M101',
      sheetName: 'MEP SERVICES & PIPING COORDINATION',
      size: 'A1',
      titleBlock: {
        projectName: 'EVLab BIM Advanced Facility',
        projectNumber: 'EVL-2026-BIM',
        client: 'Universal Engineering Corp.',
        drawnBy: 'EVLab BIM AI',
        checkedBy: 'Lead MEP Engineer',
        approvedBy: 'Lead BIM Director',
        date: '2026-08-20',
        revision: 'Rev. 1',
        status: 'For Construction'
      },
      viewports: [
        {
          id: 'vp_m101_1',
          viewId: 'view_plan_lvl_01_ground',
          title: 'HVAC & Piping Layout',
          positionOnSheetMm: { x: 50, y: 50 },
          scale: '1:50',
          detailNumber: 1
        }
      ]
    };
    this.sheets.set(m101.id, m101);
  }

  public getAllSheets(): BIMSheet[] {
    return Array.from(this.sheets.values());
  }

  public getSheet(id: string): BIMSheet | undefined {
    return this.sheets.get(id);
  }

  public addSheet(sheet: BIMSheet): void {
    this.sheets.set(sheet.id, sheet);
  }

  public updateSheet(id: string, updates: Partial<BIMSheet>): void {
    const existing = this.sheets.get(id);
    if (existing) {
      this.sheets.set(id, { ...existing, ...updates });
    }
  }

  public placeViewOnSheet(sheetId: string, view: BIMView, positionMm: { x: number; y: number }): BIMViewport | null {
    const sheet = this.sheets.get(sheetId);
    if (!sheet) return null;

    const viewport: BIMViewport = {
      id: `vp_${sheet.sheetNumber}_${Date.now()}`,
      viewId: view.id,
      title: view.name,
      positionOnSheetMm: positionMm,
      scale: view.scale,
      detailNumber: sheet.viewports.length + 1
    };

    sheet.viewports.push(viewport);
    this.sheets.set(sheetId, { ...sheet });
    return viewport;
  }
}
