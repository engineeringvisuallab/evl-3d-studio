/**
 * EVLab BIM Core v1.3 - BIM Lifecycle States
 * Complete lifecycle traceability from Design to Handover to Operation and Decommissioning.
 */

export type BIMLifecyclePhase =
  | 'Design'
  | 'Tender'
  | 'Construction'
  | 'Commissioning'
  | 'Handover'
  | 'Operation'
  | 'Maintenance'
  | 'Replacement'
  | 'Decommissioning';

export interface LifecyclePhaseDetail {
  phase: BIMLifecyclePhase;
  code: string;
  description: string;
  deliverables: string[];
}

export const LIFECYCLE_PHASES: LifecyclePhaseDetail[] = [
  { phase: 'Design', code: 'LOD 300', description: 'Detailed Architectural, Structural and MEP design modeling', deliverables: ['BIM Model', 'Drawings', 'Specs'] },
  { phase: 'Tender', code: 'LOD 350', description: 'Bill of Quantities, Unit Rates and Procurement packages', deliverables: ['BOQ', 'Tender Schedules'] },
  { phase: 'Construction', code: 'LOD 400', description: 'Fabrication, Installation, Site 4D/5D progress tracking', deliverables: ['4D Simulation', 'As-Built Logs'] },
  { phase: 'Commissioning', code: 'LOD 450', description: 'Testing, Adjusting, Balancing (TAB) and functional testing', deliverables: ['TAB Reports', 'Safety Certs'] },
  { phase: 'Handover', code: 'LOD 500', description: 'COBie digital asset data, O&M manuals and warranty registers', deliverables: ['Asset Register', 'O&M Manuals', 'IFC 4'] },
  { phase: 'Operation', code: '6D FM', description: 'Building management system integration and energy monitoring', deliverables: ['Telemetry', 'Occupancy Data'] },
  { phase: 'Maintenance', code: '6D PM', description: 'Scheduled preventive maintenance and reactive work orders', deliverables: ['Work Orders', 'Service Logs'] },
  { phase: 'Replacement', code: '6D Capital', description: 'End-of-life replacement planning and capital expenditure', deliverables: ['Lifecycle Analysis'] },
  { phase: 'Decommissioning', code: '7D Circular', description: 'Material salvage, recycling and environmental demolition', deliverables: ['Salvage Audit'] }
];
