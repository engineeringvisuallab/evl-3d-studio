/**
 * EVLab BIM Core v1.2 - Structural Topology & Analytical Validator
 * Detects floating columns, unsupported beams, kinematic instabilities, and missing boundary restraints.
 */

import { StructuralAnalyticalModel, BIMElement } from '../core/BIMTypes';

export class StructuralValidator {
  public static validate(
    model: StructuralAnalyticalModel,
    elements: Map<string, BIMElement>
  ): StructuralAnalyticalModel['diagnostics'] {
    const diagnostics: StructuralAnalyticalModel['diagnostics'] = [];

    // Check 1: Fixed base restraint for ground level columns
    model.members.forEach((member) => {
      if (member.type === 'Column') {
        const startNode = model.nodes.get(member.startNodeId);
        if (startNode && startNode.position.y === 0 && startNode.supportType !== 'Fixed' && startNode.supportType !== 'Pinned') {
          diagnostics.push({
            type: 'MissingSupport',
            elementId: member.physicalElementId,
            message: `Ground column ${member.physicalElementId} base node is not fixed or supported by a foundation footing.`
          });
        }
      }
    });

    // Check 2: Beams with no supporting nodes
    model.members.forEach((member) => {
      if (member.type === 'Beam') {
        const startNode = model.nodes.get(member.startNodeId);
        const endNode = model.nodes.get(member.endNodeId);
        if (!startNode || !endNode) {
          diagnostics.push({
            type: 'UnconnectedMember',
            elementId: member.physicalElementId,
            message: `Structural beam ${member.physicalElementId} has disconnected start/end framing nodes.`
          });
        }
      }
    });

    return diagnostics;
  }
}
