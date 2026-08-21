/**
 * EVLab BIM Core v1.1 - Constraint Solver & Conflict Detection Engine
 * Solves Level, Grid, Distance, Align, Lock, and Host constraints with cycle & conflict diagnostics.
 */

import { BIMConstraint, BIMElement, BIMLevel, BIMGridLine } from '../core/BIMTypes';

export interface ConstraintDiagnostic {
  constraintId: string;
  elementId: string;
  elementName: string;
  severity: 'Error' | 'Warning' | 'Info';
  message: string;
  suggestedAction?: string;
}

export interface ConstraintSolveResult {
  solvedConstraints: BIMConstraint[];
  diagnostics: ConstraintDiagnostic[];
  hasConflicts: boolean;
}

export class ConstraintSolver {
  /**
   * Evaluates all constraints across elements and returns diagnostics and status
   */
  public static solve(
    elements: Map<string, BIMElement>,
    levels: BIMLevel[],
    gridLines: BIMGridLine[] = []
  ): ConstraintSolveResult {
    const diagnostics: ConstraintDiagnostic[] = [];
    const solvedConstraints: BIMConstraint[] = [];
    let hasConflicts = false;

    const levelMap = new Map(levels.map((l) => [l.id, l]));
    const gridMap = new Map(gridLines.map((g) => [g.name, g]));

    elements.forEach((element) => {
      const elementConstraints = element.constraints || [];
      const visitedReferences = new Set<string>();

      elementConstraints.forEach((c) => {
        const solved = { ...c };

        switch (c.type) {
          case 'LevelConstraint': {
            const lvl = levelMap.get(c.referenceId);
            if (!lvl) {
              solved.status = 'Violated';
              solved.conflictReason = `Referenced Level ID '${c.referenceId}' does not exist in model.`;
              diagnostics.push({
                constraintId: c.id,
                elementId: element.id,
                elementName: element.name,
                severity: 'Error',
                message: `Level constraint failed: Level '${c.referenceId}' missing.`,
                suggestedAction: 'Re-assign element to an active building level.'
              });
              hasConflicts = true;
            } else {
              solved.status = 'Satisfied';
            }
            break;
          }

          case 'GridConstraint': {
            const gridName = c.referenceId;
            const grid = gridMap.get(gridName);
            if (gridLines.length > 0 && !grid) {
              solved.status = 'Violated';
              solved.conflictReason = `Structural Grid Line '${gridName}' not found.`;
              diagnostics.push({
                constraintId: c.id,
                elementId: element.id,
                elementName: element.name,
                severity: 'Warning',
                message: `Grid constraint on '${gridName}' cannot be verified.`,
                suggestedAction: 'Check Grid definition in Project Browser.'
              });
            } else {
              solved.status = 'Satisfied';
            }
            break;
          }

          case 'HostConstraint': {
            const hostId = c.referenceId || element.hostId;
            const hostElem = hostId ? elements.get(hostId) : undefined;
            if (!hostElem) {
              solved.status = 'Violated';
              solved.conflictReason = `Hosting parent element '${hostId}' is missing or deleted.`;
              diagnostics.push({
                constraintId: c.id,
                elementId: element.id,
                elementName: element.name,
                severity: 'Error',
                message: `Orphaned hosted element: Host '${hostId}' missing.`,
                suggestedAction: 'Select a valid host wall or convert to standalone family.'
              });
              hasConflicts = true;
            } else {
              solved.status = 'Satisfied';
            }
            break;
          }

          case 'Distance':
          case 'Equal':
          case 'Align':
          case 'Lock': {
            if (c.referenceId === element.id) {
              solved.status = 'Conflicted';
              solved.conflictReason = 'Self-referencing constraint loop detected.';
              diagnostics.push({
                constraintId: c.id,
                elementId: element.id,
                elementName: element.name,
                severity: 'Error',
                message: `Circular constraint error on element ${element.id}.`,
                suggestedAction: 'Remove duplicate constraint.'
              });
              hasConflicts = true;
            } else if (visitedReferences.has(c.referenceId)) {
              solved.status = 'Conflicted';
              solved.conflictReason = `Duplicate conflicting constraint on reference '${c.referenceId}'.`;
              diagnostics.push({
                constraintId: c.id,
                elementId: element.id,
                elementName: element.name,
                severity: 'Warning',
                message: `Multiple conflicting constraints targeting '${c.referenceId}'.`,
                suggestedAction: 'Unlock or simplify constraints.'
              });
            } else {
              visitedReferences.add(c.referenceId);
              solved.status = 'Satisfied';
            }
            break;
          }

          default:
            solved.status = 'Satisfied';
        }

        solvedConstraints.push(solved);
      });
    });

    return {
      solvedConstraints,
      diagnostics,
      hasConflicts
    };
  }
}
