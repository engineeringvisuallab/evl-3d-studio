/**
 * EVLab BIM Core v1.4 - Parametric Engine
 * Instantiates BIMElements from BIMFamily/BIMFamilyType definitions, applies
 * type + instance parameter overrides, drives formula recomputation via
 * FormulaEngine, and derives BIMQuantity (length/area/volume/cost) from the
 * resulting parameter set. This is the layer BIMCoreStore calls whenever a
 * user places a new element or edits a parameter in the properties panel.
 */

import { BIMElement, BIMFamily, BIMFamilyType, BIMParameter, BIMQuantity, IFCMappingData } from '../core/BIMTypes';
import { FormulaEngine, FormulaRecomputeReport } from './FormulaEngine';

let elementSequence = 0;

function generateElementId(prefix: string): string {
  elementSequence += 1;
  return `EVL-${prefix.toUpperCase()}-${String(elementSequence).padStart(6, '0')}`;
}

/** 22-char GUID shaped like an IFC GlobalId (not a real IFC base64 encoding, just visually consistent). */
function generateGlobalId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
  let id = '';
  for (let i = 0; i < 22; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export interface CreateInstanceOptions {
  levelId: string;
  phaseId: string;
  instanceName?: string;
  instanceParameterOverrides?: Record<string, number | string | boolean>;
}

export interface ParametricUpdateResult {
  element: BIMElement;
  formulaReport: FormulaRecomputeReport;
  quantities: BIMQuantity;
}

export class ParametricEngine {
  /**
   * Creates a new BIMElement instance from a family type definition, seeding
   * instance parameters from the type's parameter set, applying any
   * caller-supplied overrides, then running formulas + quantity takeoff so
   * the element is fully consistent the moment it's placed.
   */
  public static createInstance(
    family: BIMFamily,
    familyType: BIMFamilyType,
    options: CreateInstanceOptions
  ): ParametricUpdateResult {
    const instanceParameters: Record<string, BIMParameter> = {};

    Object.values(familyType.typeParameters).forEach((typeParam) => {
      instanceParameters[typeParam.id] = { ...typeParam, scope: 'Instance' };
    });

    if (options.instanceParameterOverrides) {
      Object.entries(options.instanceParameterOverrides).forEach(([paramId, value]) => {
        const existing = instanceParameters[paramId];
        instanceParameters[paramId] = existing
          ? { ...existing, value }
          : {
              id: paramId,
              name: paramId,
              value,
              unit: 'dimensionless',
              dataType: typeof value === 'number' ? 'Number' : typeof value === 'boolean' ? 'Boolean' : 'Text',
              scope: 'Instance',
            };
      });
    }

    const ifcMapping: IFCMappingData = {
      ifcEntity: familyType.ifcEntity,
      ifcGuid: generateGlobalId(),
      exportAs: familyType.ifcEntity,
      propertySets: [],
    };

    const element: BIMElement = {
      id: generateElementId(familyType.category),
      globalId: generateGlobalId(),
      name: familyType.name,
      category: familyType.category,
      discipline: familyType.discipline,
      familyId: family.id,
      typeId: familyType.id,
      instanceName: options.instanceName || `${familyType.name} 1`,
      levelId: options.levelId,
      phaseId: options.phaseId,
      relationships: [],
      constraints: [],
      openings: [],
      connectors: [],
      formulas: [],
      instanceParameters,
      materialId: familyType.defaultMaterialId,
      quantities: ParametricEngine.emptyQuantity(),
      ifcMapping,
      classifications: [],
      validationStatus: 'Valid',
    };

    return ParametricEngine.recompute(element);
  }

  /**
   * Applies instance parameter edits to an existing element (e.g. the user
   * types a new wall length into the properties panel), then re-runs
   * formulas and quantity takeoff so dependent values stay in sync.
   * Type-locked (isReadOnly) parameters are silently ignored, matching
   * Revit's behaviour where instance edits can't override a locked type
   * parameter.
   */
  public static updateInstanceParameters(
    element: BIMElement,
    updates: Record<string, number | string | boolean>
  ): ParametricUpdateResult {
    Object.entries(updates).forEach(([paramId, value]) => {
      const existing = element.instanceParameters[paramId];
      if (existing) {
        if (existing.isReadOnly) return;
        existing.value = value;
        existing.isComputed = false;
      } else {
        element.instanceParameters[paramId] = {
          id: paramId,
          name: paramId,
          value,
          unit: 'dimensionless',
          dataType: typeof value === 'number' ? 'Number' : typeof value === 'boolean' ? 'Boolean' : 'Text',
          scope: 'Instance',
        };
      }
    });

    return ParametricEngine.recompute(element);
  }

  /**
   * Re-runs formulas then recalculates derived quantities for an element,
   * and rolls any formula errors up into validationStatus/validationMessages
   * so the properties panel and ConstraintSolver diagnostics can surface
   * them consistently.
   */
  public static recompute(element: BIMElement): ParametricUpdateResult {
    const formulaReport = FormulaEngine.recompute(element);
    const quantities = ParametricEngine.computeQuantities(element);

    element.quantities = quantities;
    element.validationStatus = formulaReport.hasErrors ? 'Warning' : 'Valid';
    element.validationMessages = formulaReport.results
      .filter((r) => r.error)
      .map((r) => `Formula ${r.formulaId}: ${r.error}`);

    return { element, formulaReport, quantities };
  }

  private static getParamValue(element: BIMElement, paramId: string): number {
    const p = element.instanceParameters[paramId];
    return p && typeof p.value === 'number' ? p.value : 0;
  }

  private static emptyQuantity(): BIMQuantity {
    return { lengthM: 0, surfaceAreaM2: 0, volumeM3: 0, count: 1, costTotal: 0 };
  }

  /**
   * Derives length/area/volume/cost from an element's category and its
   * current (post-formula) parameter values. Uses the conventional
   * parameter ids established by FamilyCatalog's default families
   * (param_length, param_width, param_height, param_thickness,
   * param_diameter) - unrecognised categories fall back to a length-only
   * or count-only quantity rather than throwing.
   */
  public static computeQuantities(element: BIMElement): BIMQuantity {
    const lengthMm = ParametricEngine.getParamValue(element, 'param_length');
    const widthMm = ParametricEngine.getParamValue(element, 'param_width');
    const heightMm = ParametricEngine.getParamValue(element, 'param_height');
    const thicknessMm = ParametricEngine.getParamValue(element, 'param_thickness');
    const diameterMm = ParametricEngine.getParamValue(element, 'param_diameter');

    let lengthM = 0;
    let surfaceAreaM2 = 0;
    let volumeM3 = 0;

    switch (element.category) {
      case 'Wall':
      case 'Slab':
      case 'Roof': {
        lengthM = lengthMm / 1000;
        surfaceAreaM2 = (lengthMm / 1000) * ((heightMm || 1000) / 1000);
        volumeM3 = surfaceAreaM2 * (thicknessMm / 1000);
        break;
      }
      case 'Column':
      case 'Beam':
      case 'Footing': {
        const runM = (element.category === 'Column' ? heightMm : lengthMm) / 1000;
        const crossSectionM2 = (widthMm / 1000) * ((thicknessMm || widthMm) / 1000);
        lengthM = runM;
        volumeM3 = crossSectionM2 * runM;
        surfaceAreaM2 = 2 * (widthMm / 1000 + (thicknessMm || widthMm) / 1000) * runM;
        break;
      }
      case 'Door':
      case 'Window': {
        surfaceAreaM2 = (widthMm / 1000) * (heightMm / 1000);
        break;
      }
      case 'Pipe':
      case 'Duct':
      case 'CableTray': {
        lengthM = lengthMm / 1000;
        const radiusM = diameterMm / 2000;
        surfaceAreaM2 = 2 * Math.PI * radiusM * lengthM;
        volumeM3 = Math.PI * radiusM * radiusM * lengthM;
        break;
      }
      default: {
        lengthM = lengthMm / 1000;
        break;
      }
    }

    const costTotal = ParametricEngine.estimateCost({ lengthM, surfaceAreaM2, volumeM3 });

    return {
      lengthM: round3(lengthM),
      surfaceAreaM2: round3(surfaceAreaM2),
      volumeM3: round3(volumeM3),
      count: 1,
      costTotal: round3(costTotal),
    };
  }

  /**
   * Lightweight per-element cost placeholder for immediate UI feedback
   * (properties panel, live BOQ preview). CostEngine (the 5D module) is
   * the authoritative source of truth once a real RateDatabase entry is
   * matched to the element's typeId.
   */
  private static estimateCost(q: { lengthM: number; surfaceAreaM2: number; volumeM3: number }): number {
    return q.volumeM3 > 0 ? q.volumeM3 : q.surfaceAreaM2 > 0 ? q.surfaceAreaM2 : q.lengthM;
  }
}
