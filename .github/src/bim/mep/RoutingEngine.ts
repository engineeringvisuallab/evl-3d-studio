/**
 * EVLab BIM Core v1.2 - MEP Auto-Routing Foundation
 * Computes orthogonal 3D routes (horizontal/vertical segments, elbows, reducers) between MEP connection ports.
 */

import { BIMConnector } from '../core/BIMTypes';

export interface RoutePoint {
  x: number;
  y: number;
  z: number;
}

export interface RouteSegment {
  id: string;
  type: 'Horizontal' | 'Vertical' | 'Elbow' | 'Reducer';
  start: RoutePoint;
  end: RoutePoint;
  diameterMm: number;
  lengthMm: number;
}

export interface MEPRouteResult {
  startConnectorId: string;
  endConnectorId: string;
  segments: RouteSegment[];
  totalLengthMm: number;
  elbowCount: number;
  slopePercentage: number;
}

export class RoutingEngine {
  /**
   * Generates an orthogonal Manhattan routing path between two MEP connectors
   */
  public static calculateRoute(
    startConn: BIMConnector,
    endConn: BIMConnector,
    preferredDiameterMm: number = 100,
    slopePercentage: number = 0.5
  ): MEPRouteResult {
    const p1 = startConn.position;
    const p2 = endConn.position;

    const segments: RouteSegment[] = [];
    let current = { ...p1 };
    let totalLengthMm = 0;
    let elbowCount = 0;

    // Segment 1: Offset along start connector direction (0.5m)
    const pStartLead: RoutePoint = {
      x: p1.x + startConn.direction.x * 0.5,
      y: p1.y + startConn.direction.y * 0.5,
      z: p1.z + startConn.direction.z * 0.5
    };

    const len1 = Math.round(Math.sqrt(0.5 * 0.5) * 1000);
    segments.push({
      id: `seg_lead_${Date.now()}_1`,
      type: 'Horizontal',
      start: { ...current },
      end: { ...pStartLead },
      diameterMm: preferredDiameterMm,
      lengthMm: len1
    });
    totalLengthMm += len1;
    current = { ...pStartLead };

    // Segment 2: Intermediate waypoint routing (X -> Z -> Y)
    const midX: RoutePoint = { x: p2.x, y: current.y, z: current.z };
    const dx = Math.abs(midX.x - current.x);
    if (dx > 0.05) {
      const lenX = Math.round(dx * 1000);
      segments.push({
        id: `seg_x_${Date.now()}`,
        type: 'Horizontal',
        start: { ...current },
        end: { ...midX },
        diameterMm: preferredDiameterMm,
        lengthMm: lenX
      });
      totalLengthMm += lenX;
      elbowCount++;
      current = { ...midX };
    }

    const midZ: RoutePoint = { x: current.x, y: current.y, z: p2.z };
    const dz = Math.abs(midZ.z - current.z);
    if (dz > 0.05) {
      const lenZ = Math.round(dz * 1000);
      segments.push({
        id: `seg_z_${Date.now()}`,
        type: 'Horizontal',
        start: { ...current },
        end: { ...midZ },
        diameterMm: preferredDiameterMm,
        lengthMm: lenZ
      });
      totalLengthMm += lenZ;
      elbowCount++;
      current = { ...midZ };
    }

    // Segment 3: Vertical rise/drop to target Y
    const dy = Math.abs(p2.y - current.y);
    if (dy > 0.05) {
      const lenY = Math.round(dy * 1000);
      segments.push({
        id: `seg_y_${Date.now()}`,
        type: 'Vertical',
        start: { ...current },
        end: { ...p2 },
        diameterMm: preferredDiameterMm,
        lengthMm: lenY
      });
      totalLengthMm += lenY;
      elbowCount++;
    }

    return {
      startConnectorId: startConn.id,
      endConnectorId: endConn.id,
      segments,
      totalLengthMm,
      elbowCount,
      slopePercentage
    };
  }
}
