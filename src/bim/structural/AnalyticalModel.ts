/**
 * EVLab BIM Core v1.2 - Structural Analytical Model Generator
 * Maps physical structural objects (Columns, Beams, Slabs, Foundations) into an analytical engineering model
 * composed of Nodes, 1D Members, 2D Surfaces, and Boundary Supports.
 */

import {
  BIMElement,
  BIMLevel,
  StructuralAnalyticalModel,
  AnalyticalNode,
  AnalyticalMember,
  AnalyticalSurface
} from '../core/BIMTypes';
import { StructuralValidator } from './StructuralValidator';

export class AnalyticalModelEngine {
  public static generateAnalyticalModel(
    elements: Map<string, BIMElement>,
    levels: BIMLevel[]
  ): StructuralAnalyticalModel {
    const nodes = new Map<string, AnalyticalNode>();
    const members = new Map<string, AnalyticalMember>();
    const surfaces = new Map<string, AnalyticalSurface>();

    elements.forEach((elem) => {
      const cat = elem.category;
      const baseLevel = levels.find((l) => l.id === (elem.baseLevelId || elem.levelId));
      const topLevel = levels.find((l) => l.id === elem.topLevelId);

      const baseElevationM = baseLevel ? baseLevel.elevationM : 0;
      const heightM = ((elem.instanceParameters?.param_height?.value as number) || 3000) / 1000;
      const topElevationM = topLevel ? topLevel.elevationM : baseElevationM + heightM;

      if (cat === 'Column') {
        // Physical Column -> Base Node + Top Node + 1D Analytical Member
        const baseNodeId = `node_${elem.id}_base`;
        const topNodeId = `node_${elem.id}_top`;

        const baseNode: AnalyticalNode = {
          id: baseNodeId,
          physicalElementId: elem.id,
          position: { x: 0, y: baseElevationM, z: 0 },
          supportType: baseLevel?.id === 'lvl_00_found' ? 'Fixed' : 'Free'
        };

        const topNode: AnalyticalNode = {
          id: topNodeId,
          physicalElementId: elem.id,
          position: { x: 0, y: topElevationM, z: 0 },
          supportType: 'Free'
        };

        nodes.set(baseNodeId, baseNode);
        nodes.set(topNodeId, topNode);

        const member: AnalyticalMember = {
          id: `member_${elem.id}`,
          physicalElementId: elem.id,
          type: 'Column',
          startNodeId: baseNodeId,
          endNodeId: topNodeId,
          sectionProfile: 'RC_400x400',
          materialId: elem.materialId,
          axialStiffnessEA_kN: 4800000,
          bendingStiffnessEI_kNm2: 64000
        };

        members.set(member.id, member);
      } else if (cat === 'Beam') {
        // Physical Beam -> Start Node + End Node + 1D Analytical Member
        const lengthM = ((elem.instanceParameters?.param_length?.value as number) || 5000) / 1000;
        const startNodeId = `node_${elem.id}_start`;
        const endNodeId = `node_${elem.id}_end`;

        const startNode: AnalyticalNode = {
          id: startNodeId,
          physicalElementId: elem.id,
          position: { x: -lengthM / 2, y: topElevationM, z: 0 },
          supportType: 'Free'
        };

        const endNode: AnalyticalNode = {
          id: endNodeId,
          physicalElementId: elem.id,
          position: { x: lengthM / 2, y: topElevationM, z: 0 },
          supportType: 'Free'
        };

        nodes.set(startNodeId, startNode);
        nodes.set(endNodeId, endNode);

        const member: AnalyticalMember = {
          id: `member_${elem.id}`,
          physicalElementId: elem.id,
          type: 'Beam',
          startNodeId,
          endNodeId,
          sectionProfile: 'UB_305x165x40',
          materialId: elem.materialId,
          axialStiffnessEA_kN: 1050000,
          bendingStiffnessEI_kNm2: 17800
        };

        members.set(member.id, member);
      } else if (cat === 'Slab' || cat === 'Floor') {
        // Physical Slab -> Analytical 2D Surface
        const surface: AnalyticalSurface = {
          id: `surf_${elem.id}`,
          physicalElementId: elem.id,
          type: 'Slab',
          boundaryNodeIds: [],
          thicknessMm: (elem.instanceParameters?.param_thickness?.value as number) || 200,
          materialId: elem.materialId
        };
        surfaces.set(surface.id, surface);
      } else if (cat === 'Footing') {
        // Physical Footing -> Fixed boundary support
        const footingNodeId = `node_${elem.id}_footing`;
        const footingNode: AnalyticalNode = {
          id: footingNodeId,
          physicalElementId: elem.id,
          position: { x: 0, y: baseElevationM, z: 0 },
          supportType: 'Fixed'
        };
        nodes.set(footingNodeId, footingNode);
      }
    });

    const model: StructuralAnalyticalModel = {
      nodes,
      members,
      surfaces,
      diagnostics: []
    };

    model.diagnostics = StructuralValidator.validate(model, elements);
    return model;
  }
}
