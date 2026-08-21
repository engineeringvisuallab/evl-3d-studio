/**
 * EVLab BIM Core v1.2 - Advanced MEP System & Topology Engine
 * Manages MEP Systems (Water, HVAC, Fire Protection, Electrical), flow direction, and network connectivity graphs.
 */

import { MEPSystemDefinition, MEPSystemClassification, BIMElement, BIMConnector } from '../core/BIMTypes';
import { ConnectorSystem } from './ConnectorSystem';

export class MEPSystemManager {
  private systems: Map<string, MEPSystemDefinition> = new Map();

  constructor() {
    this.initializeDefaultSystems();
  }

  public initializeDefaultSystems(): void {
    this.systems.clear();

    const dcw: MEPSystemDefinition = {
      id: 'sys_dcw_01',
      name: 'Domestic Cold Water Supply',
      systemType: 'Domestic Cold Water',
      elementIds: [],
      flowRateL_s: 4.5,
      designVelocityM_s: 1.5,
      headLossKPa: 22.0,
      fluidTemperatureC: 15,
      colorHex: '#0ea5e9'
    };
    this.systems.set(dcw.id, dcw);

    const dhw: MEPSystemDefinition = {
      id: 'sys_dhw_01',
      name: 'Domestic Hot Water Loop',
      systemType: 'Domestic Hot Water',
      elementIds: [],
      flowRateL_s: 2.8,
      designVelocityM_s: 1.2,
      headLossKPa: 18.5,
      fluidTemperatureC: 60,
      colorHex: '#ef4444'
    };
    this.systems.set(dhw.id, dhw);

    const hvacSupply: MEPSystemDefinition = {
      id: 'sys_hvac_sup_01',
      name: 'HVAC Supply Air 01',
      systemType: 'HVAC Supply Air',
      elementIds: [],
      airVolumeM3_h: 3500,
      designVelocityM_s: 4.5,
      headLossKPa: 0.15,
      fluidTemperatureC: 18,
      colorHex: '#10b981'
    };
    this.systems.set(hvacSupply.id, hvacSupply);

    const hvacReturn: MEPSystemDefinition = {
      id: 'sys_hvac_ret_01',
      name: 'HVAC Return Air 01',
      systemType: 'HVAC Return Air',
      elementIds: [],
      airVolumeM3_h: 3200,
      designVelocityM_s: 3.8,
      headLossKPa: 0.12,
      fluidTemperatureC: 24,
      colorHex: '#f59e0b'
    };
    this.systems.set(hvacReturn.id, hvacReturn);

    const drainage: MEPSystemDefinition = {
      id: 'sys_drain_01',
      name: 'Sanitary Soil & Waste',
      systemType: 'Sanitary Drainage',
      elementIds: [],
      flowRateL_s: 6.0,
      designVelocityM_s: 0.9,
      colorHex: '#8b5cf6'
    };
    this.systems.set(drainage.id, drainage);

    const fire: MEPSystemDefinition = {
      id: 'sys_fire_01',
      name: 'Fire Sprinkler Main',
      systemType: 'Fire Protection',
      elementIds: [],
      flowRateL_s: 25.0,
      designVelocityM_s: 3.0,
      headLossKPa: 85.0,
      colorHex: '#dc2626'
    };
    this.systems.set(fire.id, fire);
  }

  public getAllSystems(): MEPSystemDefinition[] {
    return Array.from(this.systems.values());
  }

  public getSystem(id: string): MEPSystemDefinition | undefined {
    return this.systems.get(id);
  }

  public addElementToSystem(systemId: string, elementId: string): void {
    const sys = this.systems.get(systemId);
    if (sys && !sys.elementIds.includes(elementId)) {
      sys.elementIds.push(elementId);
    }
  }

  /**
   * Discovers and traverses the full connected MEP element graph starting from any element
   */
  public getConnectedSystem(startElementId: string, connectorSystem: ConnectorSystem): string[] {
    const visited = new Set<string>();
    const queue: string[] = [startElementId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const connectors = connectorSystem.getConnectorsForElement(current);
      connectors.forEach((conn) => {
        if (conn.connectedToConnectorId) {
          const targetConn = connectorSystem.getConnector(conn.connectedToConnectorId);
          if (targetConn && !visited.has(targetConn.ownerElementId)) {
            queue.push(targetConn.ownerElementId);
          }
        }
      });
    }

    return Array.from(visited);
  }
}
