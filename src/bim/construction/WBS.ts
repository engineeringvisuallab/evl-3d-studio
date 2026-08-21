/**
 * EVLab BIM Core v1.3 - Construction Work Breakdown Structure (WBS) Engine
 * Hierarchical WBS tree: Project -> Phase -> Zone -> Work Package -> Activity -> BIM Elements.
 */

export interface WBSNode {
  id: string;
  code: string;
  name: string;
  level: 'Project' | 'Phase' | 'Zone' | 'WorkPackage' | 'Activity';
  parentId?: string;
  childrenIds: string[];
  description?: string;
  discipline?: 'Architectural' | 'Structural' | 'MEP' | 'Civil' | 'General';
  activityIds: string[];
}

export class WBSEngine {
  private nodes: Map<string, WBSNode> = new Map();

  constructor() {
    this.initializeDefaultWBS();
  }

  private initializeDefaultWBS() {
    const defaultNodes: WBSNode[] = [
      {
        id: 'wbs_root',
        code: '1.0',
        name: 'Commercial Mixed-Use Development',
        level: 'Project',
        childrenIds: ['wbs_p1', 'wbs_p2', 'wbs_p3'],
        activityIds: []
      },
      // Phase 1 - Substructure & Foundation
      {
        id: 'wbs_p1',
        code: '1.1',
        name: 'Phase 1 - Substructure & Foundation',
        level: 'Phase',
        parentId: 'wbs_root',
        childrenIds: ['wbs_p1_z1', 'wbs_p1_z2'],
        discipline: 'Civil',
        activityIds: []
      },
      {
        id: 'wbs_p1_z1',
        code: '1.1.1',
        name: 'Zone A - Basement & Footings',
        level: 'Zone',
        parentId: 'wbs_p1',
        childrenIds: ['wbs_wp_excavation', 'wbs_wp_footings'],
        discipline: 'Structural',
        activityIds: []
      },
      {
        id: 'wbs_wp_excavation',
        code: '1.1.1.1',
        name: 'Earthwork & Bulk Excavation',
        level: 'WorkPackage',
        parentId: 'wbs_p1_z1',
        childrenIds: [],
        discipline: 'Civil',
        activityIds: ['act_01_excavation']
      },
      {
        id: 'wbs_wp_footings',
        code: '1.1.1.2',
        name: 'Reinforced Concrete Foundations',
        level: 'WorkPackage',
        parentId: 'wbs_p1_z1',
        childrenIds: [],
        discipline: 'Structural',
        activityIds: ['act_02_blinding', 'act_03_footings', 'act_04_ground_slab']
      },
      {
        id: 'wbs_p1_z2',
        code: '1.1.2',
        name: 'Zone B - Retaining & Underground Services',
        level: 'Zone',
        parentId: 'wbs_p1',
        childrenIds: [],
        discipline: 'Civil',
        activityIds: []
      },
      // Phase 2 - Superstructure
      {
        id: 'wbs_p2',
        code: '1.2',
        name: 'Phase 2 - Superstructure & Framing',
        level: 'Phase',
        parentId: 'wbs_root',
        childrenIds: ['wbs_p2_columns', 'wbs_p2_slabs', 'wbs_p2_walls'],
        discipline: 'Structural',
        activityIds: []
      },
      {
        id: 'wbs_p2_columns',
        code: '1.2.1',
        name: 'RC Columns & Shear Walls (L1 - L3)',
        level: 'WorkPackage',
        parentId: 'wbs_p2',
        childrenIds: [],
        discipline: 'Structural',
        activityIds: ['act_05_columns_l1', 'act_06_columns_l2']
      },
      {
        id: 'wbs_p2_slabs',
        code: '1.2.2',
        name: 'Suspended Slabs & Framing Beams',
        level: 'WorkPackage',
        parentId: 'wbs_p2',
        childrenIds: [],
        discipline: 'Structural',
        activityIds: ['act_07_slab_l1', 'act_08_slab_l2']
      },
      {
        id: 'wbs_p2_walls',
        code: '1.2.3',
        name: 'Exterior & Interior Partition Walls',
        level: 'WorkPackage',
        parentId: 'wbs_p2',
        childrenIds: [],
        discipline: 'Architectural',
        activityIds: ['act_09_walls_ext', 'act_10_walls_int']
      },
      // Phase 3 - MEP & Fitout
      {
        id: 'wbs_p3',
        code: '1.3',
        name: 'Phase 3 - Building Services (MEP) & Interior Fitout',
        level: 'Phase',
        parentId: 'wbs_root',
        childrenIds: ['wbs_p3_mep', 'wbs_p3_fitout'],
        discipline: 'MEP',
        activityIds: []
      },
      {
        id: 'wbs_p3_mep',
        code: '1.3.1',
        name: 'HVAC Ducting, Plumbing & Electrical Distribution',
        level: 'WorkPackage',
        parentId: 'wbs_p3',
        childrenIds: [],
        discipline: 'MEP',
        activityIds: ['act_11_mep_roughin', 'act_12_mep_equipment']
      },
      {
        id: 'wbs_p3_fitout',
        code: '1.3.2',
        name: 'Doors, Windows, Finishes & Commissioning',
        level: 'WorkPackage',
        parentId: 'wbs_p3',
        childrenIds: [],
        discipline: 'Architectural',
        activityIds: ['act_13_doors_windows', 'act_14_commissioning']
      }
    ];

    defaultNodes.forEach((node) => this.nodes.set(node.id, node));
  }

  public getAllNodes(): WBSNode[] {
    return Array.from(this.nodes.values());
  }

  public getNode(id: string): WBSNode | undefined {
    return this.nodes.get(id);
  }

  public getNodeByCode(code: string): WBSNode | undefined {
    return Array.from(this.nodes.values()).find((n) => n.code === code);
  }

  public addNode(node: WBSNode): void {
    this.nodes.set(node.id, node);
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent && !parent.childrenIds.includes(node.id)) {
        parent.childrenIds.push(node.id);
      }
    }
  }

  public linkActivityToWBS(wbsId: string, activityId: string): void {
    const node = this.nodes.get(wbsId);
    if (node && !node.activityIds.includes(activityId)) {
      node.activityIds.push(activityId);
    }
  }

  public getTree(): WBSNode[] {
    return this.getAllNodes().filter((n) => !n.parentId);
  }
}
