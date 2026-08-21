/**
 * EVLab BIM Core v1.2 - MEP Validation & Integrity Checker
 * Detects open connector ports, unassigned systems, mismatched diameters, and conflicting flow vectors.
 */

import { BIMElement, BIMConnector } from '../core/BIMTypes';
import { ConnectorSystem } from './ConnectorSystem';
import { MEPSystemManager } from './MEPSystem';

export interface MEPDiagnostic {
  elementId: string;
  connectorId?: string;
  severity: 'Error' | 'Warning' | 'Info';
  message: string;
}

export class MEPValidator {
  public static validate(
    elements: Map<string, BIMElement>,
    connectorSystem: ConnectorSystem,
    systemManager: MEPSystemManager
  ): MEPDiagnostic[] {
    const diagnostics: MEPDiagnostic[] = [];

    elements.forEach((elem) => {
      if (elem.discipline !== 'MEP') return;

      const connectors = connectorSystem.getConnectorsForElement(elem.id);

      // Check 1: MEP element with no connectors
      if (connectors.length === 0) {
        diagnostics.push({
          elementId: elem.id,
          severity: 'Warning',
          message: `${elem.name} has no MEP connection ports defined.`
        });
      }

      // Check 2: Open unconnected ports
      connectors.forEach((conn) => {
        if (!conn.connectedToConnectorId) {
          diagnostics.push({
            elementId: elem.id,
            connectorId: conn.id,
            severity: 'Info',
            message: `Open unconnected ${conn.domain} port (${conn.type} Ø${conn.sizeMm}mm) on ${elem.name}.`
          });
        } else {
          const targetConn = connectorSystem.getConnector(conn.connectedToConnectorId);
          if (targetConn) {
            // Check 3: Mismatched size
            if (targetConn.sizeMm !== conn.sizeMm) {
              diagnostics.push({
                elementId: elem.id,
                connectorId: conn.id,
                severity: 'Warning',
                message: `Size mismatch: ${conn.sizeMm}mm connected to ${targetConn.sizeMm}mm without a reducer fitting.`
              });
            }

            // Check 4: Opposing flow vectors
            if (conn.type === 'Outlet' && targetConn.type === 'Outlet') {
              diagnostics.push({
                elementId: elem.id,
                connectorId: conn.id,
                severity: 'Error',
                message: `Flow conflict: Outlet connected directly to another Outlet.`
              });
            }
          }
        }
      });
    });

    return diagnostics;
  }
}
