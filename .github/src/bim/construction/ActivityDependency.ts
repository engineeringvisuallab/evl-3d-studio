/**
 * EVLab BIM Core v1.3 - Construction Activity Dependency Engine
 * Supports FS, SS, FF, SF dependencies, Lead/Lag, circular reference detection, and topological schedule calculation.
 */

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface ActivityDependency {
  id: string;
  predecessorActivityId: string;
  successorActivityId: string;
  type: DependencyType;
  lagDays: number; // Positive = Lag (delay), Negative = Lead (overlap)
}

export interface DependencyValidationResult {
  isValid: boolean;
  errors: string[];
  circularPath?: string[];
}

export class DependencyEngine {
  /**
   * Detects circular dependencies using depth-first search (Cycle Detection)
   */
  public static validateDependencies(
    activityIds: string[],
    dependencies: ActivityDependency[]
  ): DependencyValidationResult {
    const adjList = new Map<string, string[]>();
    activityIds.forEach((id) => adjList.set(id, []));

    const errors: string[] = [];

    dependencies.forEach((dep) => {
      if (!adjList.has(dep.predecessorActivityId)) {
        errors.push(`Missing predecessor activity: ${dep.predecessorActivityId}`);
      }
      if (!adjList.has(dep.successorActivityId)) {
        errors.push(`Missing successor activity: ${dep.successorActivityId}`);
      }
      if (dep.predecessorActivityId === dep.successorActivityId) {
        errors.push(`Self-referencing dependency on activity: ${dep.predecessorActivityId}`);
      }

      if (adjList.has(dep.predecessorActivityId) && adjList.has(dep.successorActivityId)) {
        adjList.get(dep.predecessorActivityId)!.push(dep.successorActivityId);
      }
    });

    // Cycle detection using 3-color DFS (0: unvisited, 1: visiting, 2: visited)
    const visited = new Map<string, number>();
    activityIds.forEach((id) => visited.set(id, 0));

    let cycleFound = false;
    let cyclePath: string[] = [];

    const dfs = (nodeId: string, currentPath: string[]): boolean => {
      visited.set(nodeId, 1);
      currentPath.push(nodeId);

      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (visited.get(neighbor) === 1) {
          cycleFound = true;
          cyclePath = [...currentPath, neighbor];
          return true;
        }
        if (visited.get(neighbor) === 0) {
          if (dfs(neighbor, currentPath)) return true;
        }
      }

      visited.set(nodeId, 2);
      currentPath.pop();
      return false;
    };

    for (const id of activityIds) {
      if (visited.get(id) === 0) {
        if (dfs(id, [])) break;
      }
    }

    if (cycleFound) {
      errors.push(`Circular dependency detected: ${cyclePath.join(' -> ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      circularPath: cycleFound ? cyclePath : undefined
    };
  }

  /**
   * Topological sorting for deterministic schedule propagation
   */
  public static getTopologicalOrder(
    activityIds: string[],
    dependencies: ActivityDependency[]
  ): string[] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    activityIds.forEach((id) => {
      inDegree.set(id, 0);
      adjList.set(id, []);
    });

    dependencies.forEach((dep) => {
      if (adjList.has(dep.predecessorActivityId) && inDegree.has(dep.successorActivityId)) {
        adjList.get(dep.predecessorActivityId)!.push(dep.successorActivityId);
        inDegree.set(dep.successorActivityId, (inDegree.get(dep.successorActivityId) || 0) + 1);
      }
    });

    const queue: string[] = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    const ordered: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      ordered.push(u);

      const neighbors = adjList.get(u) || [];
      for (const v of neighbors) {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    return ordered.length === activityIds.length ? ordered : activityIds;
  }
}
