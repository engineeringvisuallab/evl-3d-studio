/**
 * EVLab BIM Core v1.2 - BIM View Engine Manager
 * Handles persistent BIM Views (Floor Plans, Elevations, Sections, 3D Views, Schedules, Sheets),
 * view ranges, view clipping, and live element visibility queries.
 */

import { BIMView, BIMViewType, BIMLevel, BIMElement, ViewFilter, ViewRangeConfig, DetailLevel } from '../core/BIMTypes';
import { ViewFilterEngine } from './ViewFilter';
import { DEFAULT_VIEW_TEMPLATES } from './ViewTemplate';

export class BIMViewManager {
  private views: Map<string, BIMView> = new Map();
  private activeViewId: string = 'view_3d_default';

  constructor(levels: BIMLevel[] = []) {
    this.initializeDefaultViews(levels);
  }

  public initializeDefaultViews(levels: BIMLevel[]) {
    this.views.clear();

    // 1. Default 3D View
    const view3D: BIMView = {
      id: 'view_3d_default',
      name: '{3D} Coordination Model',
      type: '3D View',
      discipline: 'Coordination',
      camera: {
        position: [12, 10, 12],
        target: [0, 1.5, 0],
        fov: 45
      },
      visibilityRules: {
        categories: {},
        disciplines: { Architecture: true, Structure: true, MEP: true, Civil: true },
        showAnnotations: false,
        showGrids: true,
        showLevels: true,
        showAnalytical: false
      },
      detailLevel: 'Fine',
      scale: '1:100'
    };
    this.views.set(view3D.id, view3D);

    // 2. Floor Plans for each level
    levels.forEach((lvl) => {
      const planView: BIMView = {
        id: `view_plan_${lvl.id}`,
        name: `${lvl.name} Floor Plan`,
        type: 'Floor Plan',
        levelId: lvl.id,
        discipline: 'Architecture',
        camera: {
          position: [0, lvl.elevationM + 15, 0],
          target: [0, lvl.elevationM, 0],
          orthographic: true,
          zoom: 25
        },
        viewRange: {
          topOffsetMm: 2300,
          cutPlaneOffsetMm: 1200,
          bottomOffsetMm: 0,
          viewDepthOffsetMm: -500
        },
        visibilityRules: {
          categories: { Wall: true, Door: true, Window: true, Column: true, Slab: true, Stair: true },
          disciplines: { Architecture: true, Structure: true, MEP: false, Civil: false },
          showAnnotations: true,
          showGrids: true,
          showLevels: true,
          showAnalytical: false
        },
        detailLevel: 'Fine',
        scale: '1:100'
      };
      this.views.set(planView.id, planView);
    });

    // 3. Elevations (North, South, East, West)
    const elevations: { id: string; name: string; pos: [number, number, number]; target: [number, number, number] }[] = [
      { id: 'view_elev_south', name: 'South Elevation', pos: [0, 3, 20], target: [0, 3, 0] },
      { id: 'view_elev_north', name: 'North Elevation', pos: [0, 3, -20], target: [0, 3, 0] },
      { id: 'view_elev_east', name: 'East Elevation', pos: [20, 3, 0], target: [0, 3, 0] },
      { id: 'view_elev_west', name: 'West Elevation', pos: [-20, 3, 0], target: [0, 3, 0] }
    ];

    elevations.forEach((elev) => {
      const elevView: BIMView = {
        id: elev.id,
        name: elev.name,
        type: 'Elevation',
        discipline: 'Architecture',
        camera: {
          position: elev.pos,
          target: elev.target,
          orthographic: true,
          zoom: 25
        },
        visibilityRules: {
          categories: { Wall: true, Door: true, Window: true, Roof: true, Column: true },
          disciplines: { Architecture: true, Structure: true, MEP: true, Civil: false },
          showAnnotations: true,
          showGrids: true,
          showLevels: true,
          showAnalytical: false
        },
        detailLevel: 'Fine',
        scale: '1:100'
      };
      this.views.set(elevView.id, elevView);
    });

    // 4. Building Sections (Transverse & Longitudinal)
    const sections: { id: string; name: string; axis: 'X' | 'Z'; posMm: number }[] = [
      { id: 'view_sec_1', name: 'Section 1 - Transverse', axis: 'X', posMm: 0 },
      { id: 'view_sec_2', name: 'Section 2 - Longitudinal', axis: 'Z', posMm: 0 }
    ];

    sections.forEach((sec) => {
      const secView: BIMView = {
        id: sec.id,
        name: sec.name,
        type: 'Section',
        discipline: 'Architecture',
        camera: {
          position: sec.axis === 'X' ? [sec.posMm / 1000 + 15, 3, 0] : [0, 3, sec.posMm / 1000 + 15],
          target: [0, 3, 0],
          orthographic: true,
          zoom: 25
        },
        sectionPlane: {
          axis: sec.axis === 'X' ? 'X' : 'Z',
          direction: 1,
          positionMm: sec.posMm,
          depthMm: 12000
        },
        visibilityRules: {
          categories: { Wall: true, Slab: true, Roof: true, Column: true, Beam: true, Stair: true },
          disciplines: { Architecture: true, Structure: true, MEP: true, Civil: false },
          showAnnotations: true,
          showGrids: true,
          showLevels: true,
          showAnalytical: false
        },
        detailLevel: 'Fine',
        scale: '1:50'
      };
      this.views.set(secView.id, secView);
    });
  }

  public getAllViews(): BIMView[] {
    return Array.from(this.views.values());
  }

  public getViewsByType(type: BIMViewType): BIMView[] {
    return this.getAllViews().filter((v) => v.type === type);
  }

  public getView(id: string): BIMView | undefined {
    return this.views.get(id);
  }

  public getActiveView(): BIMView {
    return this.views.get(this.activeViewId) || this.getAllViews()[0];
  }

  public setActiveView(id: string): void {
    if (this.views.has(id)) {
      this.activeViewId = id;
    }
  }

  public addView(view: BIMView): void {
    this.views.set(view.id, view);
  }

  public removeView(id: string): void {
    if (id !== 'view_3d_default') {
      this.views.delete(id);
      if (this.activeViewId === id) {
        this.activeViewId = 'view_3d_default';
      }
    }
  }

  public updateView(id: string, updates: Partial<BIMView>): void {
    const existing = this.views.get(id);
    if (existing) {
      this.views.set(id, { ...existing, ...updates });
    }
  }

  public applyTemplateToView(viewId: string, templateId: string): void {
    const view = this.views.get(viewId);
    const tmpl = DEFAULT_VIEW_TEMPLATES.find((t) => t.id === templateId);
    if (!view || !tmpl) return;

    view.discipline = tmpl.discipline;
    view.detailLevel = tmpl.detailLevel;
    view.scale = tmpl.scale;
    view.visibilityRules = { ...tmpl.visibilityRules };
    view.viewTemplateId = templateId;
    this.views.set(viewId, { ...view });
  }

  /**
   * Evaluates which BIM elements should be displayed in the given view
   */
  public queryVisibleElements(view: BIMView, elements: Map<string, BIMElement>, levels: BIMLevel[]): string[] {
    const visibleIds: string[] = [];

    elements.forEach((elem) => {
      // 1. Discipline Check
      if (view.visibilityRules.disciplines && !view.visibilityRules.disciplines[elem.discipline]) {
        return;
      }

      // 2. Category Check
      if (view.visibilityRules.categories && view.visibilityRules.categories[elem.category] === false) {
        return;
      }

      // 3. Plan View Range Check
      if (view.type === 'Floor Plan' && view.levelId && view.viewRange) {
        const level = levels.find((l) => l.id === view.levelId);
        if (level) {
          const cutPlaneElevation = level.elevationMm + view.viewRange.cutPlaneOffsetMm;
          const bottomElevation = level.elevationMm + view.viewRange.bottomOffsetMm + view.viewRange.viewDepthOffsetMm;
          const topElevation = level.elevationMm + view.viewRange.topOffsetMm;

          // Check if element intersects the range
          const elemBaseElevation = levels.find((l) => l.id === elem.baseLevelId || l.id === elem.levelId)?.elevationMm || 0;
          const elemHeight = (elem.instanceParameters?.param_height?.value as number) || 3000;
          const elemTopElevation = elemBaseElevation + elemHeight;

          if (elemTopElevation < bottomElevation || elemBaseElevation > topElevation) {
            return; // Out of view range bounds
          }
        }
      }

      visibleIds.push(elem.id);
    });

    return visibleIds;
  }
}
