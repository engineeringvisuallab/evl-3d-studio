/**
 * EVLab BIM Core v1.0 - Relationships & Constraint Graph Engine
 * Manages parent/host relationships, dependencies, and geometric/level/grid constraints.
 */

import { BIMRelationship, BIMConstraint } from '../core/BIMTypes';

export class RelationshipGraph {
  private hostMap: Map<string, string> = new Map(); // childElementId -> hostElementId
  private hostedElementsMap: Map<string, Set<string>> = new Map(); // hostElementId -> Set<childElementId>
  private relationships: Map<string, BIMRelationship[]> = new Map(); // elementId -> relationships
  private constraints: Map<string, BIMConstraint[]> = new Map(); // elementId -> constraints

  public clear() {
    this.hostMap.clear();
    this.hostedElementsMap.clear();
    this.relationships.clear();
    this.constraints.clear();
  }

  // --- HOSTING ---
  public setHost(childElementId: string, hostElementId: string) {
    // Remove old host if any
    const oldHost = this.hostMap.get(childElementId);
    if (oldHost && this.hostedElementsMap.has(oldHost)) {
      this.hostedElementsMap.get(oldHost)?.delete(childElementId);
    }

    this.hostMap.set(childElementId, hostElementId);
    if (!this.hostedElementsMap.has(hostElementId)) {
      this.hostedElementsMap.set(hostElementId, new Set());
    }
    this.hostedElementsMap.get(hostElementId)!.add(childElementId);
  }

  public getHost(childElementId: string): string | undefined {
    return this.hostMap.get(childElementId);
  }

  public getHostedElements(hostElementId: string): string[] {
    return Array.from(this.hostedElementsMap.get(hostElementId) || []);
  }

  public removeElement(elementId: string) {
    // If element is a host, orphan children
    const hosted = this.hostedElementsMap.get(elementId);
    if (hosted) {
      hosted.forEach((childId) => this.hostMap.delete(childId));
      this.hostedElementsMap.delete(elementId);
    }
    // If element is hosted, remove from parent
    const host = this.hostMap.get(elementId);
    if (host && this.hostedElementsMap.has(host)) {
      this.hostedElementsMap.get(host)?.delete(elementId);
    }
    this.hostMap.delete(elementId);
    this.relationships.delete(elementId);
    this.constraints.delete(elementId);
  }

  // --- RELATIONSHIPS ---
  public addRelationship(rel: BIMRelationship) {
    if (!this.relationships.has(rel.sourceElementId)) {
      this.relationships.set(rel.sourceElementId, []);
    }
    this.relationships.get(rel.sourceElementId)!.push(rel);
  }

  public getRelationships(elementId: string): BIMRelationship[] {
    return this.relationships.get(elementId) || [];
  }

  // --- CONSTRAINTS ---
  public addConstraint(constraint: BIMConstraint) {
    if (!this.constraints.has(constraint.targetElementId)) {
      this.constraints.set(constraint.targetElementId, []);
    }
    this.constraints.get(constraint.targetElementId)!.push(constraint);
  }

  public getConstraints(elementId: string): BIMConstraint[] {
    return this.constraints.get(elementId) || [];
  }

  public getDependents(elementId: string): string[] {
    const dependents = new Set<string>();
    // Hosted elements are direct dependents
    const hosted = this.hostedElementsMap.get(elementId);
    if (hosted) {
      hosted.forEach((id) => dependents.add(id));
    }
    // Find any element whose constraint references elementId
    this.constraints.forEach((cList, targetId) => {
      if (cList.some((c) => c.referenceId === elementId)) {
        dependents.add(targetId);
      }
    });
    // Find connected elements in relationships
    this.relationships.forEach((relList, srcId) => {
      relList.forEach((rel) => {
        if (rel.targetElementId === elementId) {
          dependents.add(srcId);
        }
      });
    });
    return Array.from(dependents);
  }

  public getUpstreamDependencies(elementId: string): string[] {
    const upstream = new Set<string>();
    const host = this.hostMap.get(elementId);
    if (host) {
      upstream.add(host);
    }
    const cList = this.constraints.get(elementId) || [];
    cList.forEach((c) => {
      if (c.referenceId) {
        upstream.add(c.referenceId);
      }
    });
    const relList = this.relationships.get(elementId) || [];
    relList.forEach((r) => {
      if (r.targetElementId) {
        upstream.add(r.targetElementId);
      }
    });
    return Array.from(upstream);
  }
}
