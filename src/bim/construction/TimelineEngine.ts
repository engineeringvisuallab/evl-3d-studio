/**
 * EVLab BIM Core v1.3 - 4D Timeline & Playback Engine
 * Connects construction activities with 3D BIM elements to visually simulate construction over time.
 */

import { ConstructionActivity } from './Activity';
import { ConstructionState, VisualState4D, CONSTRUCTION_VISUAL_MAP } from './ConstructionState';

export type TimelineZoomLevel = 'Day' | 'Week' | 'Month' | 'Quarter';

export interface ElementConstructionStateResult {
  elementId: string;
  state: ConstructionState;
  visual: VisualState4D;
  activeActivityName?: string;
  progressPercent: number;
}

export class TimelineEngine {
  private activities: Map<string, ConstructionActivity> = new Map();
  private elementActivityMap: Map<string, string[]> = new Map(); // Element ID -> Activity IDs
  private currentDate: string; // ISO "YYYY-MM-DD"
  private startDate: string;
  private endDate: string;
  private zoomLevel: TimelineZoomLevel = 'Month';
  private isPlaying: boolean = false;
  private playbackSpeed: number = 1; // 1x, 2x, 5x, 10x

  constructor(initialActivities: ConstructionActivity[] = []) {
    this.startDate = '2026-01-01';
    this.endDate = '2026-12-31';
    this.currentDate = '2026-06-15';

    if (initialActivities.length > 0) {
      this.loadActivities(initialActivities);
    } else {
      this.loadDefaultActivities();
    }
  }

  private loadDefaultActivities() {
    const defaultActivities: ConstructionActivity[] = [
      {
        id: 'act_01_excavation',
        name: 'Site Excavation & Earthwork',
        wbsCode: '1.1.1.1',
        wbsId: 'wbs_wp_excavation',
        description: 'Excavate soil to foundation depth -3.5m',
        discipline: 'Civil',
        phase: 'Phase 1 - Substructure',
        zone: 'Zone A',
        startDate: '2026-01-05',
        finishDate: '2026-01-25',
        durationDays: 20,
        calendarId: 'cal_standard_site',
        status: 'Completed',
        progressPercent: 100,
        dependencies: [],
        assignedElementIds: ['elem_fnd_01', 'elem_fnd_02'],
        costCode: '02-300',
        budgetCostUSD: 18500,
        actualCostUSD: 19200
      },
      {
        id: 'act_02_blinding',
        name: 'PCC Lean Blinding Concrete',
        wbsCode: '1.1.1.2',
        wbsId: 'wbs_wp_footings',
        description: '75mm lean concrete bed for isolated footings',
        discipline: 'Structural',
        phase: 'Phase 1 - Substructure',
        zone: 'Zone A',
        startDate: '2026-01-26',
        finishDate: '2026-02-05',
        durationDays: 10,
        calendarId: 'cal_standard_site',
        status: 'Completed',
        progressPercent: 100,
        dependencies: [{ id: 'dep_1', predecessorActivityId: 'act_01_excavation', successorActivityId: 'act_02_blinding', type: 'FS', lagDays: 1 }],
        assignedElementIds: ['elem_fnd_01', 'elem_fnd_02'],
        costCode: '03-100',
        budgetCostUSD: 8200,
        actualCostUSD: 7900
      },
      {
        id: 'act_03_footings',
        name: 'RC Isolated & Combined Footings',
        wbsCode: '1.1.1.2',
        wbsId: 'wbs_wp_footings',
        description: 'Rebar fabrication, formwork & M30 concrete pouring',
        discipline: 'Structural',
        phase: 'Phase 1 - Substructure',
        zone: 'Zone A',
        startDate: '2026-02-06',
        finishDate: '2026-02-28',
        durationDays: 22,
        calendarId: 'cal_standard_site',
        status: 'Completed',
        progressPercent: 100,
        dependencies: [{ id: 'dep_2', predecessorActivityId: 'act_02_blinding', successorActivityId: 'act_03_footings', type: 'FS', lagDays: 0 }],
        assignedElementIds: ['elem_fnd_01', 'elem_fnd_02'],
        costCode: '03-300',
        budgetCostUSD: 45000,
        actualCostUSD: 46200
      },
      {
        id: 'act_04_ground_slab',
        name: 'Cast-in-Place Ground Floor Slab',
        wbsCode: '1.1.1.2',
        wbsId: 'wbs_wp_footings',
        description: '150mm slab-on-grade with waterproofing membrane',
        discipline: 'Structural',
        phase: 'Phase 1 - Substructure',
        zone: 'Zone A',
        startDate: '2026-03-01',
        finishDate: '2026-03-20',
        durationDays: 20,
        calendarId: 'cal_standard_site',
        status: 'Completed',
        progressPercent: 100,
        dependencies: [{ id: 'dep_3', predecessorActivityId: 'act_03_footings', successorActivityId: 'act_04_ground_slab', type: 'FS', lagDays: 0 }],
        assignedElementIds: ['elem_slab_l1', 'slab_f1'],
        costCode: '03-310',
        budgetCostUSD: 38000,
        actualCostUSD: 37500
      },
      {
        id: 'act_05_columns_l1',
        name: 'Level 1 Reinforced Concrete Columns',
        wbsCode: '1.2.1',
        wbsId: 'wbs_p2_columns',
        description: '450x450mm square columns with tied rebar cages',
        discipline: 'Structural',
        phase: 'Phase 2 - Superstructure',
        zone: 'Zone A',
        startDate: '2026-03-21',
        finishDate: '2026-04-20',
        durationDays: 30,
        calendarId: 'cal_standard_site',
        status: 'Completed',
        progressPercent: 100,
        dependencies: [{ id: 'dep_4', predecessorActivityId: 'act_04_ground_slab', successorActivityId: 'act_05_columns_l1', type: 'FS', lagDays: 0 }],
        assignedElementIds: ['elem_col_01', 'elem_col_02', 'elem_col_03', 'elem_col_04'],
        costCode: '03-320',
        budgetCostUSD: 52000,
        actualCostUSD: 54000
      },
      {
        id: 'act_07_slab_l1',
        name: 'Level 2 Suspended Floor Slab & Beams',
        wbsCode: '1.2.2',
        wbsId: 'wbs_p2_slabs',
        description: 'Post-tensioned suspended slab and transfer framing beams',
        discipline: 'Structural',
        phase: 'Phase 2 - Superstructure',
        zone: 'Zone A',
        startDate: '2026-04-21',
        finishDate: '2026-05-25',
        durationDays: 34,
        calendarId: 'cal_standard_site',
        status: 'Completed',
        progressPercent: 100,
        dependencies: [{ id: 'dep_5', predecessorActivityId: 'act_05_columns_l1', successorActivityId: 'act_07_slab_l1', type: 'FS', lagDays: 0 }],
        assignedElementIds: ['elem_slab_l2', 'slab_f2'],
        costCode: '03-330',
        budgetCostUSD: 68000,
        actualCostUSD: 66500
      },
      {
        id: 'act_09_walls_ext',
        name: 'External AAC Blockwork & Curtain Enclosure',
        wbsCode: '1.2.3',
        wbsId: 'wbs_p2_walls',
        description: '200mm Autoclaved Aerated Concrete masonry wall envelope',
        discipline: 'Architectural',
        phase: 'Phase 2 - Superstructure',
        zone: 'Zone A',
        startDate: '2026-05-26',
        finishDate: '2026-07-15',
        durationDays: 50,
        calendarId: 'cal_standard_site',
        status: 'In Progress',
        progressPercent: 65,
        dependencies: [{ id: 'dep_6', predecessorActivityId: 'act_07_slab_l1', successorActivityId: 'act_09_walls_ext', type: 'FS', lagDays: 0 }],
        assignedElementIds: ['elem_wall_north', 'elem_wall_south', 'elem_wall_east', 'elem_wall_west'],
        costCode: '04-200',
        budgetCostUSD: 74000,
        actualCostUSD: 51000
      },
      {
        id: 'act_11_mep_roughin',
        name: 'MEP 1st Fix Rough-In (HVAC, Pipes, Trays)',
        wbsCode: '1.3.1',
        wbsId: 'wbs_p3_mep',
        description: 'Overhead ductwork, drainage risers and cable routing',
        discipline: 'MEP',
        phase: 'Phase 3 - MEP',
        zone: 'Zone A',
        startDate: '2026-06-15',
        finishDate: '2026-08-30',
        durationDays: 75,
        calendarId: 'cal_standard_site',
        status: 'In Progress',
        progressPercent: 30,
        dependencies: [{ id: 'dep_7', predecessorActivityId: 'act_09_walls_ext', successorActivityId: 'act_11_mep_roughin', type: 'SS', lagDays: 15 }],
        assignedElementIds: ['elem_duct_main_01', 'elem_pipe_drain_01', 'elem_ahu_01'],
        costCode: '23-300',
        budgetCostUSD: 95000,
        actualCostUSD: 28000
      },
      {
        id: 'act_13_doors_windows',
        name: 'Glazing, Interior Doors & Hardware',
        wbsCode: '1.3.2',
        wbsId: 'wbs_p3_fitout',
        description: 'Acoustic doors, thermal break aluminum glazing units',
        discipline: 'Architectural',
        phase: 'Phase 3 - MEP',
        zone: 'Zone A',
        startDate: '2026-08-01',
        finishDate: '2026-09-30',
        durationDays: 60,
        calendarId: 'cal_standard_site',
        status: 'Planned',
        progressPercent: 0,
        dependencies: [{ id: 'dep_8', predecessorActivityId: 'act_09_walls_ext', successorActivityId: 'act_13_doors_windows', type: 'FS', lagDays: 5 }],
        assignedElementIds: ['elem_door_main_01', 'elem_win_01', 'elem_win_02'],
        costCode: '08-100',
        budgetCostUSD: 42000,
        actualCostUSD: 0
      },
      {
        id: 'act_14_commissioning',
        name: 'Systems Testing, TAB & Handover Audit',
        wbsCode: '1.3.2',
        wbsId: 'wbs_p3_fitout',
        description: 'Air balancing, hydro-testing, fire alarm validation and digital O&M handover',
        discipline: 'MEP',
        phase: 'Phase 3 - MEP',
        zone: 'Zone A',
        startDate: '2026-10-01',
        finishDate: '2026-11-15',
        durationDays: 45,
        calendarId: 'cal_standard_site',
        status: 'Planned',
        progressPercent: 0,
        dependencies: [{ id: 'dep_9', predecessorActivityId: 'act_11_mep_roughin', successorActivityId: 'act_14_commissioning', type: 'FS', lagDays: 0 }],
        assignedElementIds: ['elem_ahu_01', 'elem_pump_01', 'elem_panel_main_01'],
        costCode: '01-900',
        budgetCostUSD: 22000,
        actualCostUSD: 0
      }
    ];

    this.loadActivities(defaultActivities);
  }

  public loadActivities(activities: ConstructionActivity[]) {
    this.activities.clear();
    this.elementActivityMap.clear();

    activities.forEach((act) => {
      this.activities.set(act.id, act);
      act.assignedElementIds.forEach((elemId) => {
        const existing = this.elementActivityMap.get(elemId) || [];
        if (!existing.includes(act.id)) {
          existing.push(act.id);
          this.elementActivityMap.set(elemId, existing);
        }
      });
    });

    this.recomputeTimelineBounds();
  }

  public getAllActivities(): ConstructionActivity[] {
    return Array.from(this.activities.values());
  }

  public getActivity(id: string): ConstructionActivity | undefined {
    return this.activities.get(id);
  }

  public addActivity(act: ConstructionActivity) {
    this.activities.set(act.id, act);
    act.assignedElementIds.forEach((elemId) => {
      const existing = this.elementActivityMap.get(elemId) || [];
      if (!existing.includes(act.id)) {
        existing.push(act.id);
        this.elementActivityMap.set(elemId, existing);
      }
    });
    this.recomputeTimelineBounds();
  }

  public updateActivity(id: string, updates: Partial<ConstructionActivity>) {
    const act = this.activities.get(id);
    if (!act) return;
    const updated = { ...act, ...updates };
    this.activities.set(id, updated);
    this.loadActivities(Array.from(this.activities.values()));
  }

  public linkElementToActivity(elementId: string, activityId: string) {
    const act = this.activities.get(activityId);
    if (!act) return;
    if (!act.assignedElementIds.includes(elementId)) {
      act.assignedElementIds.push(elementId);
    }
    const elemActs = this.elementActivityMap.get(elementId) || [];
    if (!elemActs.includes(activityId)) {
      elemActs.push(activityId);
      this.elementActivityMap.set(elementId, elemActs);
    }
  }

  public unlinkElementFromActivity(elementId: string, activityId: string) {
    const act = this.activities.get(activityId);
    if (act) {
      act.assignedElementIds = act.assignedElementIds.filter((id) => id !== elementId);
    }
    const elemActs = this.elementActivityMap.get(elementId) || [];
    this.elementActivityMap.set(elementId, elemActs.filter((id) => id !== activityId));
  }

  public getActivitiesForElement(elementId: string): ConstructionActivity[] {
    const actIds = this.elementActivityMap.get(elementId) || [];
    return actIds.map((id) => this.activities.get(id)!).filter(Boolean);
  }

  public getElementsForActivity(activityId: string): string[] {
    const act = this.activities.get(activityId);
    return act ? act.assignedElementIds : [];
  }

  private recomputeTimelineBounds() {
    let minDate = '2099-12-31';
    let maxDate = '1970-01-01';

    this.activities.forEach((act) => {
      if (act.startDate < minDate) minDate = act.startDate;
      if (act.finishDate > maxDate) maxDate = act.finishDate;
    });

    if (minDate !== '2099-12-31') this.startDate = minDate;
    if (maxDate !== '1970-01-01') this.endDate = maxDate;
  }

  public getCurrentDate(): string {
    return this.currentDate;
  }

  public setCurrentDate(dateStr: string) {
    this.currentDate = dateStr;
  }

  public getStartDate(): string {
    return this.startDate;
  }

  public getEndDate(): string {
    return this.endDate;
  }

  public getZoomLevel(): TimelineZoomLevel {
    return this.zoomLevel;
  }

  public setZoomLevel(zoom: TimelineZoomLevel) {
    this.zoomLevel = zoom;
  }

  public getPlaybackSpeed(): number {
    return this.playbackSpeed;
  }

  public setPlaybackSpeed(speed: number) {
    this.playbackSpeed = speed;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setPlaying(playing: boolean) {
    this.isPlaying = playing;
  }

  public getElementState(elementId: string, queryDateStr: string): ConstructionState {
    return this.evaluateElementStateAtDate(elementId, queryDateStr).state;
  }

  /**
   * Evaluates the 4D state for a specific BIM element based on the active timeline date cursor
   */
  public evaluateElementStateAtDate(elementId: string, queryDateStr: string): ElementConstructionStateResult {
    const linkedActivities = this.getActivitiesForElement(elementId);
    if (linkedActivities.length === 0) {
      // Default: If no activity linked, element is considered Completed or Baseline
      return {
        elementId,
        state: 'Completed',
        visual: CONSTRUCTION_VISUAL_MAP['Completed'],
        progressPercent: 100
      };
    }

    const queryTime = new Date(queryDateStr).getTime();

    // Determine the latest/active activity status
    let highestState: ConstructionState = 'Not Started';
    let activeActName: string | undefined;
    let avgProgress = 0;

    for (const act of linkedActivities) {
      const startTime = new Date(act.startDate).getTime();
      const finishTime = new Date(act.finishDate).getTime();

      if (queryTime < startTime) {
        // Future/Planned
        if (highestState === 'Not Started') highestState = 'Planned';
      } else if (queryTime >= startTime && queryTime <= finishTime) {
        // In Progress
        highestState = 'In Progress';
        activeActName = act.name;
        const totalDuration = finishTime - startTime;
        const elapsed = queryTime - startTime;
        avgProgress = totalDuration > 0 ? Math.min(100, Math.round((elapsed / totalDuration) * 100)) : 50;
        break;
      } else if (queryTime > finishTime) {
        // Completed
        highestState = 'Completed';
        avgProgress = 100;
      }
    }

    return {
      elementId,
      state: highestState,
      visual: CONSTRUCTION_VISUAL_MAP[highestState],
      activeActivityName: activeActName,
      progressPercent: avgProgress
    };
  }
}
