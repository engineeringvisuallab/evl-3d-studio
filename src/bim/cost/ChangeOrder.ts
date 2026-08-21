/**
 * EVLab BIM Core v1.3 - Change Order Engine
 * Tracks scope/geometry changes, original vs revised quantities/costs, variance impacts, and approval workflows.
 */

export interface ChangeOrder {
  id: string;
  code: string; // e.g. "CO-001"
  title: string;
  reason: string;
  author: string;
  date: string;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Incorporated';
  affectedElementIds: string[];
  affectedActivityIds: string[];
  originalQuantity: number;
  revisedQuantity: number;
  deltaQuantity: number;
  unit: string;
  originalCostUSD: number;
  revisedCostUSD: number;
  deltaCostUSD: number;
  approvedBy?: string;
  approvalDate?: string;
}

export class ChangeOrderEngine {
  private changeOrders: Map<string, ChangeOrder> = new Map();

  constructor() {
    this.createSampleChangeOrder();
  }

  private createSampleChangeOrder() {
    const sampleCO: ChangeOrder = {
      id: 'co_001',
      code: 'CO-001',
      title: 'Perimeter Wall Thickness Increase (200mm -> 250mm for Acoustic Rating)',
      reason: 'Client requested enhanced sound insulation between commercial zones and lobby corridor.',
      author: 'Lead Structural Engineer',
      date: '2026-04-10',
      status: 'Approved',
      affectedElementIds: ['elem_wall_north', 'elem_wall_south'],
      affectedActivityIds: ['act_09_walls_ext'],
      originalQuantity: 180.0,
      revisedQuantity: 225.0,
      deltaQuantity: 45.0,
      unit: 'm2',
      originalCostUSD: 12500,
      revisedCostUSD: 15625,
      deltaCostUSD: 3125,
      approvedBy: 'Project Director',
      approvalDate: '2026-04-12'
    };
    this.changeOrders.set(sampleCO.id, sampleCO);
  }

  public getAllChangeOrders(): ChangeOrder[] {
    return Array.from(this.changeOrders.values());
  }

  public getChangeOrder(id: string): ChangeOrder | undefined {
    return this.changeOrders.get(id);
  }

  public createChangeOrder(
    code: string,
    title: string,
    reason: string,
    author: string,
    affectedElementIds: string[],
    affectedActivityIds: string[],
    originalQty: number,
    revisedQty: number,
    unit: string,
    originalCostUSD: number,
    revisedCostUSD: number
  ): ChangeOrder {
    const id = `co_${Date.now()}`;
    const deltaQuantity = revisedQty - originalQty;
    const deltaCostUSD = revisedCostUSD - originalCostUSD;

    const co: ChangeOrder = {
      id,
      code,
      title,
      reason,
      author,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending Review',
      affectedElementIds,
      affectedActivityIds,
      originalQuantity: originalQty,
      revisedQuantity: revisedQty,
      deltaQuantity,
      unit,
      originalCostUSD,
      revisedCostUSD,
      deltaCostUSD
    };

    this.changeOrders.set(id, co);
    return co;
  }

  public updateStatus(id: string, status: 'Pending Review' | 'Approved' | 'Rejected' | 'Incorporated', approvedBy?: string): void {
    const co = this.changeOrders.get(id);
    if (!co) return;
    co.status = status;
    if (approvedBy) {
      co.approvedBy = approvedBy;
      co.approvalDate = new Date().toISOString().split('T')[0];
    }
  }

  public getTotalApprovedCostVarianceUSD(): number {
    return Array.from(this.changeOrders.values())
      .filter((co) => co.status === 'Approved' || co.status === 'Incorporated')
      .reduce((sum, co) => sum + co.deltaCostUSD, 0);
  }
}
