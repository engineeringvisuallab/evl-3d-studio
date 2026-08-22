/**
 * EVLab BIM Core v1.4 - Revit-Style Level & Story Constraint Engine
 * Handles Level-to-Level geometry calculation, parametric height propagation,
 * and automatic elevation anchoring for walls, columns, beams, slabs, doors, and windows.
 */

import { SceneObject, BIMLevel } from '../../types';

export const DEFAULT_BIM_LEVELS: BIMLevel[] = [
  {
    id: 'lvl_00_found',
    name: 'Level 00 Foundation',
    elevationM: -0.5,
    elevationMm: -500,
    isStory: false
  },
  {
    id: 'lvl_01_ground',
    name: 'Level 01 Ground Floor',
    elevationM: 0.0,
    elevationMm: 0,
    isStory: true
  },
  {
    id: 'lvl_02_first',
    name: 'Level 02 First Floor',
    elevationM: 3.5,
    elevationMm: 3500,
    isStory: true
  },
  {
    id: 'lvl_03_roof',
    name: 'Level 03 Roof Level',
    elevationM: 7.0,
    elevationMm: 7000,
    isStory: true
  },
  {
    id: 'lvl_04_parapet',
    name: 'Level 04 Parapet / Top',
    elevationM: 8.2,
    elevationMm: 8200,
    isStory: false
  }
];

export interface LevelConstraintUpdateParams {
  baseLevelId?: string;
  topLevelId?: string; // Level ID or 'unconnected'
  baseOffset?: number; // mm
  topOffset?: number; // mm
  unconnectedHeight?: number; // mm
  isRoomBounding?: boolean;
}

export class LevelConstraintEngine {
  /**
   * Resolves the base level for an object.
   */
  public static resolveBaseLevel(obj: SceneObject, levels: BIMLevel[]): BIMLevel {
    if (obj.bim?.baseLevelId) {
      const found = levels.find((l) => l.id === obj.bim.baseLevelId);
      if (found) return found;
    }
    // Match by level string if exists (e.g. 'Level 01 Ground')
    if (obj.bim?.level) {
      const matched = levels.find(
        (l) => l.name.toLowerCase().includes(obj.bim.level.toLowerCase()) || obj.bim.level.toLowerCase().includes(l.name.toLowerCase())
      );
      if (matched) return matched;
    }
    // Default to Ground floor or first level
    return levels.find((l) => l.elevationMm === 0) || levels[1] || levels[0];
  }

  /**
   * Resolves the top level for an object (returns null if unconnected).
   */
  public static resolveTopLevel(obj: SceneObject, levels: BIMLevel[]): BIMLevel | null {
    if (!obj.bim?.topLevelId || obj.bim.topLevelId === 'unconnected') {
      return null;
    }
    return levels.find((l) => l.id === obj.bim.topLevelId) || null;
  }

  /**
   * Calculates the authoritative base elevation (in mm) including base offset.
   */
  public static calculateBaseElevationMm(obj: SceneObject, levels: BIMLevel[]): number {
    const baseLevel = this.resolveBaseLevel(obj, levels);
    const baseOffset = obj.bim?.baseOffset || 0;
    return (baseLevel ? baseLevel.elevationMm : 0) + baseOffset;
  }

  /**
   * Calculates the authoritative top elevation (in mm) including top offset.
   */
  public static calculateTopElevationMm(obj: SceneObject, levels: BIMLevel[]): { topElevationMm: number; isUnconnected: boolean } {
    const baseElevation = this.calculateBaseElevationMm(obj, levels);
    const topLevel = this.resolveTopLevel(obj, levels);

    if (!topLevel) {
      const unconnectedH = obj.bim?.unconnectedHeight || obj.parametric?.height || 3500;
      return {
        topElevationMm: baseElevation + unconnectedH,
        isUnconnected: true
      };
    }

    const topOffset = obj.bim?.topOffset || 0;
    return {
      topElevationMm: topLevel.elevationMm + topOffset,
      isUnconnected: false
    };
  }

  /**
   * Calculates the calculated height (mm) and absolute Y position for the object
   * based on its Revit Level Constraints.
   */
  public static calculatePositionAndHeight(
    obj: SceneObject,
    levels: BIMLevel[]
  ): { positionY: number; height?: number; totalHeightMm: number } {
    const baseElevation = this.calculateBaseElevationMm(obj, levels);
    const { topElevationMm, isUnconnected } = this.calculateTopElevationMm(obj, levels);

    let totalHeightMm = Math.max(50, topElevationMm - baseElevation);
    if (isUnconnected && obj.bim?.unconnectedHeight) {
      totalHeightMm = obj.bim.unconnectedHeight;
    }

    const paramType = obj.parametric?.type || 'cube';
    let positionY = baseElevation;
    let height: number | undefined = undefined;

    switch (paramType) {
      case 'wall':
      case 'column':
      case 'duct':
      case 'stairs':
      case 'tank': {
        positionY = baseElevation;
        height = totalHeightMm;
        break;
      }

      case 'beam': {
        // Structural beam top is flush with the top elevation or base elevation
        const beamH = obj.parametric?.height || 500;
        positionY = baseElevation + totalHeightMm - beamH;
        height = beamH;
        break;
      }

      case 'slab':
      case 'road':
      case 'footing': {
        positionY = baseElevation;
        height = obj.parametric?.thickness || obj.parametric?.height || 300;
        break;
      }

      case 'door': {
        positionY = baseElevation;
        height = obj.parametric?.height || 2100;
        break;
      }

      case 'window': {
        const sillHeight = 900; // standard window sill
        positionY = baseElevation + sillHeight;
        height = obj.parametric?.height || 1500;
        break;
      }

      default: {
        positionY = baseElevation;
        height = obj.parametric?.height || totalHeightMm;
        break;
      }
    }

    return { positionY, height, totalHeightMm };
  }

  /**
   * Applies Revit Level Constraints to a SceneObject and regenerates its position & parametric dimensions.
   */
  public static applyConstraints(
    obj: SceneObject,
    updates: LevelConstraintUpdateParams,
    levels: BIMLevel[]
  ): SceneObject {
    const newBim = {
      ...obj.bim,
      ...updates
    };

    if (updates.baseLevelId) {
      const lvl = levels.find((l) => l.id === updates.baseLevelId);
      if (lvl) newBim.level = lvl.name;
    }

    const tempObj: SceneObject = {
      ...obj,
      bim: newBim
    };

    const { positionY, height } = this.calculatePositionAndHeight(tempObj, levels);

    const newParametric = { ...obj.parametric };
    if (height !== undefined && (obj.parametric.type === 'wall' || obj.parametric.type === 'column' || obj.parametric.type === 'stairs')) {
      newParametric.height = height;
    }

    return {
      ...tempObj,
      position: {
        ...obj.position,
        y: positionY
      },
      parametric: newParametric,
      bim: newBim
    };
  }

  /**
   * Recalculates all objects constrained to a specific Level or across the entire project.
   */
  public static recalculateAllObjects(objects: SceneObject[], levels: BIMLevel[]): SceneObject[] {
    return objects.map((obj) => {
      // If object has baseLevelId or topLevelId, re-evaluate
      if (obj.bim?.baseLevelId || obj.bim?.topLevelId) {
        const { positionY, height } = this.calculatePositionAndHeight(obj, levels);
        const newParametric = { ...obj.parametric };
        if (height !== undefined && (obj.parametric.type === 'wall' || obj.parametric.type === 'column' || obj.parametric.type === 'stairs')) {
          newParametric.height = height;
        }
        return {
          ...obj,
          position: { ...obj.position, y: positionY },
          parametric: newParametric
        };
      }
      return obj;
    });
  }
}
