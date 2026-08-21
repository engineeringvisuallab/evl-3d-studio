/**
 * EVLab BIM Core v1.3 - Maintenance & Facility Task Engine
 * Handles Preventive Maintenance (PM), Inspections, Calibrations, Cleanings, and Work Orders linked to BIM Assets.
 */

export type MaintenanceType = 'Preventive' | 'Inspection' | 'Calibration' | 'Cleaning' | 'Replacement' | 'Reactive';

export type MaintenanceFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Bi-Annual';

export interface MaintenanceTask {
  id: string;
  assetId: string;
  elementId: string; // Persistent EVL Element ID
  taskName: string;
  type: MaintenanceType;
  frequency: MaintenanceFrequency;
  estimatedDurationHours: number;
  estimatedCostUSD: number;
  assignedContractor: string;
  lastCompletedDate?: string;
  nextDueDate: string;
  status: 'Scheduled' | 'Overdue' | 'In Progress' | 'Completed' | 'Deferred';
  checkpoints: string[];
  notes?: string;
}

export class MaintenanceEngine {
  private tasks: Map<string, MaintenanceTask> = new Map();

  constructor() {
    this.createSampleTasks();
  }

  private createSampleTasks() {
    const defaultTasks: MaintenanceTask[] = [
      {
        id: 'pm_001_filter',
        assetId: 'ast_ahu_01',
        elementId: 'elem_ahu_01',
        taskName: 'AHU Primary & Secondary Air Filter Replacement',
        type: 'Preventive',
        frequency: 'Quarterly',
        estimatedDurationHours: 2.5,
        estimatedCostUSD: 180,
        assignedContractor: 'Comfort Air Services Ltd',
        lastCompletedDate: '2026-03-15',
        nextDueDate: '2026-06-15',
        status: 'Scheduled',
        checkpoints: [
          'Isolate power supply and tag out AHU-01',
          'Inspect pre-filter differential pressure gauge',
          'Replace MERV 13 bag filters with OEM certified media',
          'Clean drain pan and clear condensate trap',
          'Restore power and record airflow CFM'
        ]
      },
      {
        id: 'pm_002_pump',
        assetId: 'ast_pump_01',
        elementId: 'elem_pump_01',
        taskName: 'Chilled Water Pump Mechanical Seal & Alignment Inspection',
        type: 'Inspection',
        frequency: 'Semi-Annual',
        estimatedDurationHours: 4.0,
        estimatedCostUSD: 350,
        assignedContractor: 'Apex Hydro Systems',
        lastCompletedDate: '2026-01-10',
        nextDueDate: '2026-07-10',
        status: 'Scheduled',
        checkpoints: [
          'Laser alignment check of motor to impeller shaft',
          'Inspect mechanical seals for leakage',
          'Vibration analysis at bearing housings',
          'Grease motor bearings with high-temperature lubricant'
        ]
      },
      {
        id: 'pm_003_switchboard',
        assetId: 'ast_panel_01',
        elementId: 'elem_panel_main_01',
        taskName: 'Main Switchboard Thermographic Infrared Scan & Torque Check',
        type: 'Inspection',
        frequency: 'Annual',
        estimatedDurationHours: 3.0,
        estimatedCostUSD: 500,
        assignedContractor: 'ElectroTech Power Diagnostics',
        lastCompletedDate: '2025-08-20',
        nextDueDate: '2026-08-20',
        status: 'Scheduled',
        checkpoints: [
          'Thermal imaging of all 3-phase busbars under full load',
          'Identify hot spots (>10°C delta T above ambient)',
          'Check tightness of main circuit breaker lugs',
          'Test earth leakage and ground fault relays'
        ]
      },
      {
        id: 'pm_004_damper',
        assetId: 'ast_damper_01',
        elementId: 'elem_duct_main_01',
        taskName: 'Fire & Smoke Damper Actuator Drop Test',
        type: 'Inspection',
        frequency: 'Annual',
        estimatedDurationHours: 1.5,
        estimatedCostUSD: 120,
        assignedContractor: 'FireSafe Systems Group',
        lastCompletedDate: '2025-05-10',
        nextDueDate: '2026-05-10',
        status: 'Overdue',
        checkpoints: [
          'Trigger smoke detector signal and verify damper closes <15s',
          'Inspect fusible link and microswitch feedback to BMS',
          'Manually reset actuator and verify spring return'
        ]
      }
    ];

    defaultTasks.forEach((t) => this.tasks.set(t.id, t));
  }

  public getAllTasks(): MaintenanceTask[] {
    return Array.from(this.tasks.values());
  }

  public getTasksForAsset(assetId: string): MaintenanceTask[] {
    return Array.from(this.tasks.values()).filter((t) => t.assetId === assetId);
  }

  public getTasksForElement(elementId: string): MaintenanceTask[] {
    return Array.from(this.tasks.values()).filter((t) => t.elementId === elementId);
  }

  public addTask(task: MaintenanceTask) {
    this.tasks.set(task.id, task);
  }

  public updateTaskStatus(taskId: string, status: 'Scheduled' | 'Overdue' | 'In Progress' | 'Completed' | 'Deferred', completedDate?: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.status = status;
    if (completedDate) {
      task.lastCompletedDate = completedDate;
    }
  }
}
