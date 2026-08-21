/**
 * EVLab BIM Core v1.0 - Level & Datum System
 * Controls Base Level, Top Level, and Height Propagation.
 */

import { BIMLevel } from './BIMTypes';

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
  }
];

export class LevelSystem {
  private levels: Map<string, BIMLevel> = new Map();

  constructor(initialLevels: BIMLevel[] = DEFAULT_BIM_LEVELS) {
    initialLevels.forEach((lvl) => this.levels.set(lvl.id, { ...lvl }));
  }

  public getAllLevels(): BIMLevel[] {
    return Array.from(this.levels.values()).sort((a, b) => a.elevationMm - b.elevationMm);
  }

  public getLevel(levelId: string): BIMLevel | undefined {
    return this.levels.get(levelId);
  }

  public getLevelHeightBetween(baseLevelId?: string, topLevelId?: string, defaultHeight = 3500): number {
    if (!baseLevelId || !topLevelId) return defaultHeight;
    const base = this.levels.get(baseLevelId);
    const top = this.levels.get(topLevelId);
    if (!base || !top) return defaultHeight;
    return Math.max(100, top.elevationMm - base.elevationMm);
  }

  public updateLevelElevation(levelId: string, newElevationMm: number): { deltaMm: number; affectedLevel: BIMLevel } | null {
    const level = this.levels.get(levelId);
    if (!level) return null;
    const deltaMm = newElevationMm - level.elevationMm;
    level.elevationMm = newElevationMm;
    level.elevationM = Number((newElevationMm / 1000).toFixed(3));
    return { deltaMm, affectedLevel: { ...level } };
  }
}
