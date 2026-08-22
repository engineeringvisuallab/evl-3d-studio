/**
 * EVLab BIM Core v1.2 - Central BIM Store & Transaction Coordinator
 * Bridges SceneObjects with BIM Parametric Engine, Views, Annotations, Rooms, Schedules 2.0, Sheets,
 * Advanced MEP Systems, Structural Analytical Models, OpenBIM IFC 4 Export/Import, and BCF Coordination.
 */

import { create } from 'zustand';
import {
  BIMElement,
  BIMLevel,
  BIMFamily,
  BIMConstraint,
  BIMGridLine,
  BIMConnector,
  BIMOpening,
  BIMFormula,
  BIMView,
  BIMAnnotation,
  BIMRoom,
  BIMScheduleDefinition,
  BIMSheet,
  MEPSystemDefinition,
  StructuralAnalyticalModel,
  BCFIssue,
  BCFIssueStatus,
  BCFIssuePriority
} from './core/BIMTypes';
import { RelationshipGraph } from './relationships/RelationshipGraph';
import { LevelSystem, DEFAULT_BIM_LEVELS } from './core/LevelSystem';
import { FamilyCatalog, DEFAULT_BIM_FAMILIES } from './core/FamilyCatalog';
import { ParametricEngine } from './parametric/ParametricEngine';
import { IFCMapper } from './ifc/IFCMapper';
import { ConstraintSolver, ConstraintDiagnostic } from './constraints/ConstraintSolver';
import { FormulaEngine } from './parametric/FormulaEngine';
import { ConnectorSystem } from './mep/ConnectorSystem';
import { BIMViewManager } from './views/BIMViewManager';
import { AnnotationEngine } from './documentation/AnnotationEngine';
import { RoomEngine } from './documentation/RoomEngine';
import { ScheduleEngine, ScheduleQueryResult } from './schedules/ScheduleEngine';
import { SheetEngine } from './sheets/SheetEngine';
import { MEPSystemManager } from './mep/MEPSystem';
import { MEPValidator, MEPDiagnostic } from './mep/MEPValidator';
import { RoutingEngine, MEPRouteResult } from './mep/RoutingEngine';
import { AnalyticalModelEngine } from './structural/AnalyticalModel';
import { IFCExporter } from './ifc/IFCExporter';
import { IFCImporter, IFCImportResult } from './ifc/IFCImporter';
import { IFCRoundTripValidator, RoundTripValidationReport } from './ifc/IFCRoundTripValidator';
import { CoordinationEngine } from './coordination/CoordinationEngine';
import { SceneObject } from '../types';

// v1.3 4D/5D/6D Construction, Cost & Asset Intelligence Engines
import { WBSEngine } from './construction/WBS';
import { TimelineEngine, TimelineZoomLevel, ElementConstructionStateResult } from './construction/TimelineEngine';
import { CalendarEngine } from './construction/Calendar';
import { BaselineEngine, ScheduleBaseline, ScheduleVarianceReport } from './construction/Baseline';
import { ConstructionActivity } from './construction/Activity';
import { ProgressEngine, ProjectProgressSummary } from './construction/ProgressEngine';

import { RateDatabase, CurrencyCode, CostRateItem } from './cost/RateDatabase';
import { CostEngine, BOQDisciplineSummary } from './cost/CostEngine';
import { BIMCostItem } from './cost/CostItem';
import { ChangeOrderEngine, ChangeOrder } from './cost/ChangeOrder';
import { EarnedValueEngine, EVMPerformanceSummary } from './cost/EarnedValueEngine';
import { CostCurveEngine, SCurveDataPoint } from './cost/CostCurve';

import { AssetRegister } from './assets/AssetRegister';
import { BIMAsset, AssetCategory, AssetOperationalStatus } from './assets/Asset';
import { MaintenanceEngine, MaintenanceTask } from './assets/Maintenance';
import { HandoverEngine, HandoverChecklistItem, HandoverComplianceReport } from './assets/Handover';
import { ProjectIntelligenceEngine, ProjectIntelligenceKPIs } from './integration/ProjectIntelligenceEngine';
import { BIM4D5D6DGraph, UnifiedElementIntelligence } from './integration/BIM4D5D6DGraph';

export const DEFAULT_BIM_GRIDS: BIMGridLine[] = [
  { id: 'grid_a', name: 'A', axis: 'X', positionMm: -6000 },
  { id: 'grid_b', name: 'B', axis: 'X', positionMm: -2000 },
  { id: 'grid_c', name: 'C', axis: 'X', positionMm: 2000 },
  { id: 'grid_d', name: 'D', axis: 'X', positionMm: 6000 },
  { id: 'grid_1', name: '1', axis: 'Z', positionMm: -6000 },
  { id: 'grid_2', name: '2', axis: 'Z', positionMm: -2000 },
  { id: 'grid_3', name: '3', axis: 'Z', positionMm: 2000 },
  { id: 'grid_4', name: '4', axis: 'Z', positionMm: 6000 }
];

export interface BIMCoreState {
  elements: Map<string, BIMElement>;
  levels: BIMLevel[];
  gridLines: BIMGridLine[];
  families: BIMFamily[];
  relationshipGraph: RelationshipGraph;
  levelSystem: LevelSystem;
  familyCatalog: FamilyCatalog;
  connectorSystem: ConnectorSystem;

  // v1.2 Documentation, MEP & Structural Engines
  viewManager: BIMViewManager;
  annotationEngine: AnnotationEngine;
  rooms: BIMRoom[];
  sheetEngine: SheetEngine;
  mepSystemManager: MEPSystemManager;
  analyticalModel: StructuralAnalyticalModel;
  coordinationEngine: CoordinationEngine;
  activeDisplayMode: 'Physical' | 'Analytical' | 'Overlay';

  // v1.3 4D Construction, 5D Cost & 6D Asset Engines
  wbsEngine: WBSEngine;
  timelineEngine: TimelineEngine;
  calendarEngine: CalendarEngine;
  baselineEngine: BaselineEngine;
  rateDatabase: RateDatabase;
  costEngine: CostEngine;
  changeOrderEngine: ChangeOrderEngine;
  assetRegister: AssetRegister;
  currentTimelineDate: string;
  isTimelinePlaying: boolean;
  timelineSpeed: number;
  timelineZoom: TimelineZoomLevel;
  activeCurrency: CurrencyCode;

  // Active View, Schedule & Sheets
  activeViewId: string;
  activeScheduleId: string;
  activeSheetId: string;
  activeBIMTab: 'views' | 'sheets' | 'schedules' | '4d_time' | '5d_cost' | '6d_assets' | 'intelligence' | 'openbim' | 'coordination' | 'structural_mep' | 'quantities' | 'inspector';
  
  // Validation & Diagnostics status
  healthScore: number;
  validationIssues: { elementId: string; elementName: string; severity: 'Error' | 'Warning' | 'Info'; message: string }[];
  constraintDiagnostics: ConstraintDiagnostic[];
  mepDiagnostics: MEPDiagnostic[];
  lastRoundTripReport?: RoundTripValidationReport;

  // Action methods
  syncFromSceneObjects: (sceneObjects: SceneObject[]) => void;
  updateElementParameter: (elementId: string, paramKey: string, newValue: any) => void;
  setElementLevel: (elementId: string, levelId: string, isTopLevel?: boolean) => void;
  setElementHost: (elementId: string, hostElementId: string) => void;
  changeLevelElevation: (levelId: string, newElevationMm: number) => { affectedElementIds: string[] };
  updateGridLine: (gridId: string, newPositionMm: number) => { affectedElementIds: string[] };
  addGridLine: (grid: BIMGridLine) => void;
  addConstraintToElement: (constraint: BIMConstraint) => void;
  removeConstraintFromElement: (elementId: string, constraintId: string) => void;
  addFormulaToElement: (elementId: string, formula: BIMFormula) => void;
  validateBIMModel: () => void;
  getElementById: (id: string) => BIMElement | undefined;

  // v1.2 Actions
  setActiveView: (viewId: string) => void;
  setActiveSchedule: (schedId: string) => void;
  setActiveSheet: (sheetId: string) => void;
  setActiveBIMTab: (tab: 'views' | 'sheets' | 'schedules' | '4d_time' | '5d_cost' | '6d_assets' | 'intelligence' | 'openbim' | 'coordination' | 'structural_mep' | 'quantities' | 'inspector') => void;
  setDisplayMode: (mode: 'Physical' | 'Analytical' | 'Overlay') => void;
  addAnnotation: (annot: BIMAnnotation) => void;
  removeAnnotation: (id: string) => void;
  createTagForElement: (elemId: string) => void;
  recalculateRooms: () => void;
  routeMEP: (startConnId: string, endConnId: string) => MEPRouteResult | null;
  exportIFC: (projectName?: string) => string;
  importIFC: (ifcContent: string) => IFCImportResult;
  runRoundTripTest: () => RoundTripValidationReport;
  createBCFIssue: (title: string, desc: string, elemIds: string[], clashId?: string, priority?: BCFIssuePriority) => BCFIssue;
  updateBCFIssueStatus: (id: string, status: BCFIssueStatus) => void;
  addBCFComment: (issueId: string, author: string, comment: string) => void;

  // v1.3 Actions
  setTimelineDate: (dateStr: string) => void;
  setTimelinePlaying: (playing: boolean) => void;
  setTimelineSpeed: (speed: number) => void;
  setTimelineZoom: (zoom: TimelineZoomLevel) => void;
  addActivity: (activity: ConstructionActivity) => void;
  updateActivity: (id: string, updates: Partial<ConstructionActivity>) => void;
  linkElementToActivity: (elementId: string, activityId: string) => void;
  captureScheduleBaseline: (name: string, description: string) => ScheduleBaseline;
  setActiveCurrency: (currency: CurrencyCode) => void;
  updateCostRate: (rate: CostRateItem) => void;
  createChangeOrder: (title: string, reason: string, author: string, elementIds: string[], actIds: string[], origQty: number, revQty: number, unit: string, origCost: number, revCost: number) => ChangeOrder;
  updateChangeOrderStatus: (id: string, status: 'Pending Review' | 'Approved' | 'Rejected' | 'Incorporated', approvedBy?: string) => void;
  addAsset: (asset: BIMAsset) => void;
  updateAsset: (id: string, updates: Partial<BIMAsset>) => void;
  addMaintenanceTask: (task: MaintenanceTask) => void;
  updateMaintenanceTaskStatus: (taskId: string, status: 'Scheduled' | 'Overdue' | 'In Progress' | 'Completed' | 'Deferred', completedDate?: string) => void;
  updateHandoverChecklistItem: (id: string, isComplete: boolean) => void;
  getElementIntelligence: (elementId: string) => UnifiedElementIntelligence | null;
  getProjectIntelligenceKPIs: () => ProjectIntelligenceKPIs;
}

export const useBIMStore = create<BIMCoreState>((set, get) => {
  const levelSystem = new LevelSystem(DEFAULT_BIM_LEVELS);
  const familyCatalog = new FamilyCatalog(DEFAULT_BIM_FAMILIES);
  const relationshipGraph = new RelationshipGraph();
  const connectorSystem = new ConnectorSystem();
  const viewManager = new BIMViewManager(levelSystem.getAllLevels());
  const annotationEngine = new AnnotationEngine();
  const sheetEngine = new SheetEngine();
  const mepSystemManager = new MEPSystemManager();
  const coordinationEngine = new CoordinationEngine();

  // 4D, 5D, 6D Engines
  const wbsEngine = new WBSEngine();
  const timelineEngine = new TimelineEngine();
  const calendarEngine = new CalendarEngine();
  const baselineEngine = new BaselineEngine();
  const rateDatabase = new RateDatabase();
  const costEngine = new CostEngine(rateDatabase);
  const changeOrderEngine = new ChangeOrderEngine();
  const assetRegister = new AssetRegister();

  return {
    elements: new Map<string, BIMElement>(),
    levels: levelSystem.getAllLevels(),
    gridLines: DEFAULT_BIM_GRIDS,
    families: familyCatalog.getAllFamilies(),
    relationshipGraph,
    levelSystem,
    familyCatalog,
    connectorSystem,
    viewManager,
    annotationEngine,
    rooms: [],
    sheetEngine,
    mepSystemManager,
    analyticalModel: { nodes: new Map(), members: new Map(), surfaces: new Map(), diagnostics: [] },
    coordinationEngine,

    // 4D / 5D / 6D state
    wbsEngine,
    timelineEngine,
    calendarEngine,
    baselineEngine,
    rateDatabase,
    costEngine,
    changeOrderEngine,
    assetRegister,
    currentTimelineDate: timelineEngine.getCurrentDate(),
    isTimelinePlaying: false,
    timelineSpeed: 1,
    timelineZoom: 'Month',
    activeCurrency: 'USD',

    activeDisplayMode: 'Physical',
    activeViewId: 'view_3d_default',
    activeScheduleId: 'sched_doors',
    activeSheetId: 'sheet_a101',
    activeBIMTab: '4d_time',
    healthScore: 100,
    validationIssues: [],
    constraintDiagnostics: [],
    mepDiagnostics: [],

    getElementById: (id: string) => {
      return get().elements.get(id);
    },

    setActiveView: (viewId: string) => {
      get().viewManager.setActiveView(viewId);
      set({ activeViewId: viewId });
    },

    setActiveSchedule: (schedId: string) => {
      set({ activeScheduleId: schedId });
    },

    setActiveSheet: (sheetId: string) => {
      set({ activeSheetId: sheetId });
    },

    setActiveBIMTab: (tab) => {
      set({ activeBIMTab: tab });
    },

    setDisplayMode: (mode: 'Physical' | 'Analytical' | 'Overlay') => {
      set({ activeDisplayMode: mode });
    },

    // 4D Actions
    setTimelineDate: (dateStr: string) => {
      get().timelineEngine.setCurrentDate(dateStr);
      set({ currentTimelineDate: dateStr });
    },

    setTimelinePlaying: (playing: boolean) => {
      get().timelineEngine.setPlaying(playing);
      set({ isTimelinePlaying: playing });
    },

    setTimelineSpeed: (speed: number) => {
      get().timelineEngine.setPlaybackSpeed(speed);
      set({ timelineSpeed: speed });
    },

    setTimelineZoom: (zoom: TimelineZoomLevel) => {
      get().timelineEngine.setZoomLevel(zoom);
      set({ timelineZoom: zoom });
    },

    addActivity: (activity: ConstructionActivity) => {
      get().timelineEngine.addActivity(activity);
      set({});
    },

    updateActivity: (id: string, updates: Partial<ConstructionActivity>) => {
      get().timelineEngine.updateActivity(id, updates);
      set({});
    },

    linkElementToActivity: (elementId: string, activityId: string) => {
      get().timelineEngine.linkElementToActivity(elementId, activityId);
      set({});
    },

    captureScheduleBaseline: (name: string, description: string) => {
      const acts = get().timelineEngine.getAllActivities();
      const bl = get().baselineEngine.captureBaseline(name, description, acts);
      set({});
      return bl;
    },

    // 5D Actions
    setActiveCurrency: (currency: CurrencyCode) => {
      get().rateDatabase.setActiveCurrency(currency);
      set({ activeCurrency: currency });
    },

    updateCostRate: (rate: CostRateItem) => {
      get().rateDatabase.addRate(rate);
      get().costEngine.syncModelCosts(get().elements);
      set({});
    },

    createChangeOrder: (title, reason, author, elementIds, actIds, origQty, revQty, unit, origCost, revCost) => {
      const code = `CO-00${get().changeOrderEngine.getAllChangeOrders().length + 1}`;
      const co = get().changeOrderEngine.createChangeOrder(
        code,
        title,
        reason,
        author,
        elementIds,
        actIds,
        origQty,
        revQty,
        unit,
        origCost,
        revCost
      );
      set({});
      return co;
    },

    updateChangeOrderStatus: (id, status, approvedBy) => {
      get().changeOrderEngine.updateStatus(id, status, approvedBy);
      set({});
    },

    // 6D Actions
    addAsset: (asset: BIMAsset) => {
      get().assetRegister.addAsset(asset);
      set({});
    },

    updateAsset: (id: string, updates: Partial<BIMAsset>) => {
      get().assetRegister.updateAsset(id, updates);
      set({});
    },

    addMaintenanceTask: (task: MaintenanceTask) => {
      get().assetRegister.getMaintenanceEngine().addTask(task);
      set({});
    },

    updateMaintenanceTaskStatus: (taskId: string, status, completedDate) => {
      get().assetRegister.getMaintenanceEngine().updateTaskStatus(taskId, status, completedDate);
      set({});
    },

    updateHandoverChecklistItem: (id: string, isComplete: boolean) => {
      get().assetRegister.updateHandoverItem(id, isComplete);
      set({});
    },

    getElementIntelligence: (elementId: string) => {
      const elem = get().elements.get(elementId);
      if (!elem) return null;
      return BIM4D5D6DGraph.buildElementIntelligence(
        elem,
        get().timelineEngine,
        get().costEngine,
        get().assetRegister,
        get().coordinationEngine
      );
    },

    getProjectIntelligenceKPIs: () => {
      return ProjectIntelligenceEngine.computeKPIs(
        get().elements,
        get().timelineEngine,
        get().baselineEngine,
        get().costEngine,
        get().assetRegister
      );
    },

    addAnnotation: (annot: BIMAnnotation) => {
      get().annotationEngine.addAnnotation(annot);
      set({});
    },

    removeAnnotation: (id: string) => {
      get().annotationEngine.removeAnnotation(id);
      set({});
    },

    createTagForElement: (elemId: string) => {
      const elem = get().elements.get(elemId);
      if (!elem) return;
      get().annotationEngine.createTagForElement(elem);
      set({});
    },

    recalculateRooms: () => {
      const { elements, levels } = get();
      const rooms = RoomEngine.discoverRooms(elements, levels);
      set({ rooms });
    },

    routeMEP: (startConnId: string, endConnId: string) => {
      const { connectorSystem } = get();
      const c1 = connectorSystem.getConnector(startConnId);
      const c2 = connectorSystem.getConnector(endConnId);
      if (!c1 || !c2) return null;

      const res = RoutingEngine.calculateRoute(c1, c2, Math.min(c1.sizeMm, c2.sizeMm));
      connectorSystem.connect(startConnId, endConnId);
      get().validateBIMModel();
      return res;
    },

    exportIFC: (projectName = 'EVLab BIM Project') => {
      const { elements, levels, gridLines } = get();
      return IFCExporter.exportToIFC4STEP(elements, levels, gridLines, projectName);
    },

    importIFC: (ifcContent: string) => {
      const result = IFCImporter.parseIFC(ifcContent);
      const newElements = new Map<string, BIMElement>();
      result.elements.forEach((e) => newElements.set(e.id, e));

      set({
        elements: newElements,
        levels: result.levels.length > 0 ? result.levels : get().levels
      });

      get().recalculateRooms();
      get().validateBIMModel();
      return result;
    },

    runRoundTripTest: () => {
      const { elements, levels, gridLines } = get();
      const report = IFCRoundTripValidator.executeRoundTripTest(elements, levels, gridLines);
      set({ lastRoundTripReport: report });
      return report;
    },

    createBCFIssue: (title: string, desc: string, elemIds: string[], clashId?: string, priority?: BCFIssuePriority) => {
      const issue = get().coordinationEngine.createIssueFromClash(title, desc, elemIds, clashId || `CLASH-${Date.now()}`, priority);
      set({});
      return issue;
    },

    updateBCFIssueStatus: (id: string, status: BCFIssueStatus) => {
      get().coordinationEngine.updateIssueStatus(id, status);
      set({});
    },

    addBCFComment: (issueId: string, author: string, comment: string) => {
      get().coordinationEngine.addCommentToIssue(issueId, author, comment);
      set({});
    },

    syncFromSceneObjects: (sceneObjects: SceneObject[]) => {
      const elements = new Map<string, BIMElement>();
      const graph = get().relationshipGraph;
      const connSystem = get().connectorSystem;
      const mepMgr = get().mepSystemManager;
      graph.clear();
      connSystem.clear();

      sceneObjects.forEach((obj) => {
        const bimMeta = obj.bim || ({} as any);
        const category = obj.category || 'General';
        const materialId = obj.materialId || 'mat_concrete';
        
        // Compute quantities & trace
        const { quantities, trace } = ParametricEngine.calculateElementQuantities(
          category,
          obj.parametric,
          materialId
        );

        // Generate OpenBIM IFC mapping
        const ifcMapping = IFCMapper.createIfcMapping(
          category,
          obj.name,
          materialId,
          {
            ...bimMeta.customProperties,
            costEstimate: bimMeta.costEstimate || quantities.costTotal
          }
        );

        // Assign proper Level IDs
        let levelId = 'lvl_01_ground';
        let baseLevelId = 'lvl_01_ground';
        let topLevelId: string | undefined = undefined;

        const catStr = String(category);
        if (bimMeta.level?.includes('00') || bimMeta.level?.includes('Foundation')) {
          levelId = 'lvl_00_found';
          baseLevelId = 'lvl_00_found';
        } else if (bimMeta.level?.includes('02') || bimMeta.level?.includes('First')) {
          levelId = 'lvl_02_first';
          baseLevelId = 'lvl_02_first';
          topLevelId = 'lvl_03_roof';
        } else if (bimMeta.level?.includes('03') || bimMeta.level?.includes('Roof')) {
          levelId = 'lvl_03_roof';
          baseLevelId = 'lvl_03_roof';
        } else if (catStr === 'Column' || catStr === 'Wall' || catStr === 'Structure') {
          topLevelId = 'lvl_02_first';
        }

        // Host relationship for doors and windows
        let hostId: string | undefined = undefined;
        const openings: BIMOpening[] = [];

        if (catStr === 'Door' || catStr === 'Window' || obj.name.toLowerCase().includes('door') || obj.name.toLowerCase().includes('window')) {
          const wall = sceneObjects.find((s) => s.category === 'Architectural' && (s.name.includes('Wall') || s.parametric.type === 'wall'));
          if (wall) {
            hostId = wall.id;
            graph.setHost(obj.id, wall.id);
            openings.push({
              id: `op_${obj.id}`,
              hostElementId: wall.id,
              hostedElementId: obj.id,
              type: catStr === 'Door' ? 'Door' : 'Window',
              distanceAlongHostMm: obj.parametric.length ? obj.parametric.length / 2 : 2500,
              sillHeightMm: catStr === 'Window' ? 900 : 0,
              widthMm: obj.parametric.width || 900,
              heightMm: obj.parametric.height || 2100
            });
          }
        }

        // Connectors for MEP elements
        const connectors: BIMConnector[] = ConnectorSystem.createDefaultConnectorsForElement(
          obj.id,
          catStr,
          {
            length: obj.parametric.length,
            width: obj.parametric.width,
            height: obj.parametric.height,
            diameter: obj.parametric.diameter
          }
        );
        connectors.forEach((c) => connSystem.registerConnector(c));

        // Assign to MEP system if applicable
        if (category === 'Mechanical') {
          mepMgr.addElementToSystem('sys_hvac_sup_01', obj.id);
        } else if (category === 'Water') {
          mepMgr.addElementToSystem('sys_dcw_01', obj.id);
        }

        // Add constraints
        const constraints: BIMConstraint[] = [];
        if (baseLevelId) {
          const baseC: BIMConstraint = {
            id: `c_base_${obj.id}`,
            type: 'LevelConstraint',
            targetElementId: obj.id,
            referenceId: baseLevelId,
            description: `Base attached to ${baseLevelId}`,
            status: 'Satisfied'
          };
          constraints.push(baseC);
          graph.addConstraint(baseC);
        }
        if (topLevelId) {
          const topC: BIMConstraint = {
            id: `c_top_${obj.id}`,
            type: 'LevelConstraint',
            targetElementId: obj.id,
            referenceId: topLevelId,
            description: `Top attached to ${topLevelId}`,
            status: 'Satisfied'
          };
          constraints.push(topC);
          graph.addConstraint(topC);
        }
        if (hostId) {
          const hostC: BIMConstraint = {
            id: `c_host_${obj.id}`,
            type: 'HostConstraint',
            targetElementId: obj.id,
            referenceId: hostId,
            description: `Hosted in ${hostId}`,
            status: 'Satisfied'
          };
          constraints.push(hostC);
          graph.addConstraint(hostC);
        }

        // Grid constraint detection for columns
        if (catStr === 'Column' || catStr === 'Structure') {
          const gridC: BIMConstraint = {
            id: `c_grid_${obj.id}`,
            type: 'GridConstraint',
            targetElementId: obj.id,
            referenceId: 'A',
            description: 'Constrained to Grid Line A',
            status: 'Satisfied'
          };
          constraints.push(gridC);
          graph.addConstraint(gridC);
        }

        const bimElem: BIMElement = {
          id: obj.id,
          globalId: bimMeta.globalId || IFCMapper.generateIfcGuid(obj.id),
          name: obj.name,
          category: (category === 'Architectural' ? (catStr === 'Door' ? 'Door' : catStr === 'Window' ? 'Window' : 'Wall') : category === 'Structure' ? 'Column' : category === 'Mechanical' ? 'Duct' : category === 'Water' ? 'Pipe' : 'Generic') as any,
          discipline: (category === 'Architectural' ? 'Architecture' : category === 'Structure' ? 'Structure' : category === 'Mechanical' || category === 'Water' ? 'MEP' : 'Civil'),
          familyId: 'fam_basic_wall',
          typeId: 'type_wall_brick_250',
          instanceName: bimMeta.objectId || `EVL-${obj.id.slice(-6).toUpperCase()}`,
          levelId,
          baseLevelId,
          topLevelId,
          baseOffsetMm: 0,
          topOffsetMm: 0,
          phaseId: bimMeta.phase || 'Phase 2 - Superstructure',
          hostId,
          relationships: [],
          constraints,
          openings,
          connectors,
          formulas: FormulaEngine.getStandardFormulasForCategory(catStr),
          instanceParameters: {
            param_length: {
              id: 'param_length',
              name: 'Length',
              value: obj.parametric.length || 5000,
              unit: 'mm',
              dataType: 'Length',
              scope: 'Instance',
              group: 'Dimensions'
            },
            param_height: {
              id: 'param_height',
              name: 'Unconnected Height',
              value: obj.parametric.height || 3000,
              unit: 'mm',
              dataType: 'Length',
              scope: 'Instance',
              group: 'Dimensions'
            },
            param_thickness: {
              id: 'param_thickness',
              name: 'Width / Thickness',
              value: obj.parametric.thickness || obj.parametric.width || 250,
              unit: 'mm',
              dataType: 'Length',
              scope: 'Instance',
              group: 'Dimensions'
            },
            param_diameter: {
              id: 'param_diameter',
              name: 'Diameter',
              value: obj.parametric.diameter || 150,
              unit: 'mm',
              dataType: 'Length',
              scope: 'Instance',
              group: 'Dimensions'
            }
          },
          materialId,
          quantities,
          calculationTrace: trace,
          ifcMapping,
          classifications: [
            { system: 'OmniClass', code: '23.13.20.11', title: 'Exterior Wall Construction' },
            { system: 'Uniclass', code: 'EF_25_10', title: 'Walls and barrier elements' },
            { system: 'MasterFormat', code: '04 20 00', title: 'Unit Masonry' }
          ],
          validationStatus: 'Valid',
          validationMessages: []
        };

        elements.set(obj.id, bimElem);
      });

      // Recalculate Rooms & Analytical Model
      const levels = get().levels;
      const rooms = RoomEngine.discoverRooms(elements, levels);
      const analyticalModel = AnalyticalModelEngine.generateAnalyticalModel(elements, levels);

      set({ elements, rooms, analyticalModel });
      get().validateBIMModel();
    },

    updateElementParameter: (elementId: string, paramKey: string, newValue: any) => {
      const { elements } = get();
      const elem = elements.get(elementId);
      if (!elem) return;

      const updatedElem = { ...elem };
      if (updatedElem.instanceParameters[paramKey]) {
        updatedElem.instanceParameters[paramKey].value = newValue;
      }

      // Re-run Parametric Quantities calculation
      const paramMap: Record<string, any> = {};
      Object.keys(updatedElem.instanceParameters).forEach((k) => {
        paramMap[k.replace('param_', '')] = updatedElem.instanceParameters[k].value;
      });

      const { quantities, trace } = ParametricEngine.calculateElementQuantities(
        updatedElem.category,
        paramMap,
        updatedElem.materialId
      );

      updatedElem.quantities = quantities;
      updatedElem.calculationTrace = trace;

      const newMap = new Map(elements);
      newMap.set(elementId, updatedElem);
      set({ elements: newMap });
      get().recalculateRooms();
      get().validateBIMModel();
    },

    setElementLevel: (elementId: string, levelId: string, isTopLevel = false) => {
      const { elements, levelSystem } = get();
      const elem = elements.get(elementId);
      if (!elem) return;

      const updated = { ...elem };
      if (isTopLevel) {
        updated.topLevelId = levelId;
      } else {
        updated.levelId = levelId;
        updated.baseLevelId = levelId;
      }

      // Auto update height based on datum elevation difference
      if (updated.baseLevelId && updated.topLevelId) {
        const heightMm = levelSystem.getLevelHeightBetween(updated.baseLevelId, updated.topLevelId);
        if (updated.instanceParameters.param_height) {
          updated.instanceParameters.param_height.value = heightMm;
        }
      }

      const newMap = new Map(elements);
      newMap.set(elementId, updated);
      set({ elements: newMap });
      get().validateBIMModel();
    },

    setElementHost: (elementId: string, hostElementId: string) => {
      const { elements, relationshipGraph } = get();
      const elem = elements.get(elementId);
      if (!elem) return;

      relationshipGraph.setHost(elementId, hostElementId);
      const updated = { ...elem, hostId: hostElementId };
      const newMap = new Map(elements);
      newMap.set(elementId, updated);
      set({ elements: newMap });
      get().validateBIMModel();
    },

    changeLevelElevation: (levelId: string, newElevationMm: number) => {
      const { levelSystem, elements } = get();
      const result = levelSystem.updateLevelElevation(levelId, newElevationMm);
      if (!result) return { affectedElementIds: [] };

      const affectedIds: string[] = [];
      const newElements = new Map(elements);

      newElements.forEach((elem, id) => {
        let isAffected = false;
        if (elem.topLevelId === levelId || elem.baseLevelId === levelId) {
          isAffected = true;
          affectedIds.push(id);

          // Update height parameter if constrained
          if (elem.baseLevelId && elem.topLevelId) {
            const h = levelSystem.getLevelHeightBetween(elem.baseLevelId, elem.topLevelId);
            if (elem.instanceParameters.param_height) {
              elem.instanceParameters.param_height.value = h;
            }
          }
        }
      });

      set({ levels: levelSystem.getAllLevels(), elements: newElements });
      get().recalculateRooms();
      get().validateBIMModel();
      return { affectedElementIds: affectedIds };
    },

    updateGridLine: (gridId: string, newPositionMm: number) => {
      const { gridLines, elements } = get();
      const targetGrid = gridLines.find((g) => g.id === gridId || g.name === gridId);
      if (!targetGrid) return { affectedElementIds: [] };

      const updatedGrids = gridLines.map((g) => (g.id === targetGrid.id ? { ...g, positionMm: newPositionMm } : g));
      const affectedIds: string[] = [];
      
      elements.forEach((elem, id) => {
        const hasGridConstraint = elem.constraints?.some((c) => c.type === 'GridConstraint' && c.referenceId === targetGrid.name);
        if (hasGridConstraint) {
          affectedIds.push(id);
        }
      });

      set({ gridLines: updatedGrids });
      get().validateBIMModel();
      return { affectedElementIds: affectedIds };
    },

    addGridLine: (grid: BIMGridLine) => {
      const { gridLines } = get();
      set({ gridLines: [...gridLines, grid] });
    },

    addConstraintToElement: (constraint: BIMConstraint) => {
      const { elements, relationshipGraph } = get();
      const elem = elements.get(constraint.targetElementId);
      if (!elem) return;

      const updatedConstraints = [...(elem.constraints || []), constraint];
      const updated = { ...elem, constraints: updatedConstraints };
      relationshipGraph.addConstraint(constraint);

      const newMap = new Map(elements);
      newMap.set(elem.id, updated);
      set({ elements: newMap });
      get().validateBIMModel();
    },

    removeConstraintFromElement: (elementId: string, constraintId: string) => {
      const { elements } = get();
      const elem = elements.get(elementId);
      if (!elem) return;

      const updatedConstraints = (elem.constraints || []).filter((c) => c.id !== constraintId);
      const updated = { ...elem, constraints: updatedConstraints };

      const newMap = new Map(elements);
      newMap.set(elem.id, updated);
      set({ elements: newMap });
      get().validateBIMModel();
    },

    addFormulaToElement: (elementId: string, formula: BIMFormula) => {
      const { elements } = get();
      const elem = elements.get(elementId);
      if (!elem) return;

      const updatedFormulas = [...(elem.formulas || []), formula];
      const updated = { ...elem, formulas: updatedFormulas };

      const newMap = new Map(elements);
      newMap.set(elem.id, updated);
      set({ elements: newMap });
    },

    validateBIMModel: () => {
      const { elements, relationshipGraph, levels, gridLines, connectorSystem, mepSystemManager } = get();
      const issues: BIMCoreState['validationIssues'] = [];
      let errorCount = 0;

      // 1. Run Constraint Solver
      const solveResult = ConstraintSolver.solve(elements, levels, gridLines);

      // 2. Run MEP Validation
      const mepDiagnostics = MEPValidator.validate(elements, connectorSystem, mepSystemManager);

      elements.forEach((elem) => {
        const msgs: string[] = [];

        // Level Check
        if (!elem.levelId && !elem.baseLevelId) {
          msgs.push('Element is unconstrained to any Building Level.');
          issues.push({ elementId: elem.id, elementName: elem.name, severity: 'Warning', message: 'Missing Base Level constraint.' });
        }

        // Host Check for Doors / Windows
        if (elem.category === 'Door' || elem.category === 'Window') {
          const host = relationshipGraph.getHost(elem.id);
          if (!host) {
            msgs.push('Hosted element missing structural wall host.');
            issues.push({ elementId: elem.id, elementName: elem.name, severity: 'Error', message: 'Unattached door/window requires a Host Wall.' });
            errorCount++;
          }
        }

        // Material Check
        if (!elem.materialId) {
          msgs.push('No engineering material assigned.');
          issues.push({ elementId: elem.id, elementName: elem.name, severity: 'Warning', message: 'Missing material definition.' });
        }

        // IFC Mapping Check
        if (!elem.ifcMapping?.ifcEntity) {
          msgs.push('Missing OpenBIM IFC entity mapping.');
          issues.push({ elementId: elem.id, elementName: elem.name, severity: 'Error', message: 'Element cannot be exported to IFC 4.' });
          errorCount++;
        }

        elem.validationMessages = msgs;
        elem.validationStatus = msgs.length === 0 ? 'Valid' : msgs.some((m) => m.includes('requires')) ? 'Error' : 'Warning';
      });

      const totalElements = Math.max(1, elements.size);
      const score = Math.max(0, Math.min(100, Math.round(100 - (errorCount * 15 + (issues.length - errorCount) * 5 + solveResult.diagnostics.length * 5 + mepDiagnostics.length * 2) / totalElements * 10)));

      set({
        validationIssues: issues,
        constraintDiagnostics: solveResult.diagnostics,
        mepDiagnostics,
        healthScore: score
      });
    }
  };
});
