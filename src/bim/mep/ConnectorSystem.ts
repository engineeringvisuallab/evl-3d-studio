/**
 * EVLab BIM Core v1.1 - MEP & Structural Connector Foundation
 * Standardized logical and spatial connection ports for Pipes, Ducts, Cable Trays, and Equipment.
 */

import { BIMConnector } from '../core/BIMTypes';

export class ConnectorSystem {
  private connectors: Map<string, BIMConnector> = new Map();
  private elementConnectorMap: Map<string, string[]> = new Map();

  public clear() {
    this.connectors.clear();
    this.elementConnectorMap.clear();
  }

  public registerConnector(connector: BIMConnector) {
    this.connectors.set(connector.id, { ...connector });
    const list = this.elementConnectorMap.get(connector.ownerElementId) || [];
    if (!list.includes(connector.id)) {
      list.push(connector.id);
      this.elementConnectorMap.set(connector.ownerElementId, list);
    }
  }

  public getConnector(id: string): BIMConnector | undefined {
    return this.connectors.get(id);
  }

  public getConnectorsForElement(elementId: string): BIMConnector[] {
    const ids = this.elementConnectorMap.get(elementId) || [];
    return ids.map((id) => this.connectors.get(id)!).filter(Boolean);
  }

  public connect(connectorAId: string, connectorBId: string) {
    this.connectPorts(connectorAId, connectorBId);
  }

  public connectPorts(connectorAId: string, connectorBId: string) {
    const connA = this.connectors.get(connectorAId);
    const connB = this.connectors.get(connectorBId);
    if (connA && connB) {
      connA.connectedToConnectorId = connectorBId;
      connB.connectedToConnectorId = connectorAId;
    }
  }

  /**
   * Generates default engineering connectors based on category & dimensions
   */
  public static createDefaultConnectorsForElement(
    elementId: string,
    category: string,
    params: { length?: number; width?: number; height?: number; diameter?: number }
  ): BIMConnector[] {
    const l = params.length || 6000;
    const w = params.width || 600;
    const h = params.height || 400;
    const d = params.diameter || 200;

    switch (category.toLowerCase()) {
      case 'pipe':
      case 'water':
        return [
          {
            id: `conn_in_${elementId}`,
            ownerElementId: elementId,
            domain: 'Piping',
            type: 'Inlet',
            position: { x: 0, y: 0, z: -l / 2 },
            direction: { x: 0, y: 0, z: -1 },
            sizeMm: d,
            systemName: 'Domestic Potable Water (PN16)'
          },
          {
            id: `conn_out_${elementId}`,
            ownerElementId: elementId,
            domain: 'Piping',
            type: 'Outlet',
            position: { x: 0, y: 0, z: l / 2 },
            direction: { x: 0, y: 0, z: 1 },
            sizeMm: d,
            systemName: 'Domestic Potable Water (PN16)'
          }
        ];

      case 'duct':
      case 'mechanical':
        return [
          {
            id: `conn_in_${elementId}`,
            ownerElementId: elementId,
            domain: 'HVAC',
            type: 'Inlet',
            position: { x: -l / 2, y: 0, z: 0 },
            direction: { x: -1, y: 0, z: 0 },
            sizeMm: Math.max(w, h),
            widthMm: w,
            heightMm: h,
            systemName: 'Supply Air System'
          },
          {
            id: `conn_out_${elementId}`,
            ownerElementId: elementId,
            domain: 'HVAC',
            type: 'Outlet',
            position: { x: l / 2, y: 0, z: 0 },
            direction: { x: 1, y: 0, z: 0 },
            sizeMm: Math.max(w, h),
            widthMm: w,
            heightMm: h,
            systemName: 'Supply Air System'
          }
        ];

      default:
        return [];
    }
  }
}
