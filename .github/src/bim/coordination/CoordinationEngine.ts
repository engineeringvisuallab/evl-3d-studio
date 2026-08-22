/**
 * EVLab BIM Core v1.2 - OpenBIM BCF Coordination & Clash Issue Engine
 * Bridges 3D Spatial Clash Detection with BIM Collaboration Format (BCF 2.1/3.0) issue tracking and discipline assignments.
 */

import { BCFIssue, BCFIssueStatus, BCFIssuePriority, BIMElement, DisciplineType } from '../core/BIMTypes';

export class CoordinationEngine {
  private issues: Map<string, BCFIssue> = new Map();

  constructor() {
    this.initializeDefaultIssues();
  }

  public initializeDefaultIssues(): void {
    this.issues.clear();

    const issue1: BCFIssue = {
      id: 'BCF-001',
      title: 'MEP Chilled Water Pipe Collides with Structural Beam 03',
      description: 'Chilled water supply pipe penetrates structural beam web without required sleeve clearance (min 50mm).',
      status: 'Open',
      priority: 'Critical',
      author: 'MEP Coordinator',
      assignedTo: 'Structural Lead',
      discipline: 'Coordination',
      elementIds: ['EVL-PIPE-001', 'EVL-BEAM-003'],
      clashRefId: 'CLASH-2026-08-01',
      viewpoint: {
        cameraPosition: [4, 3.5, 6],
        cameraTarget: [0, 3, 0]
      },
      createdAt: '2026-08-20T08:00:00Z',
      updatedAt: '2026-08-20T08:00:00Z',
      comments: [
        {
          id: 'comm_1',
          author: 'MEP Coordinator',
          date: '2026-08-20T08:00:00Z',
          comment: 'Identified during multidisciplinary clash coordination. Reroute pipe lower by 250mm or design web opening.'
        }
      ]
    };
    this.issues.set(issue1.id, issue1);

    const issue2: BCFIssue = {
      id: 'BCF-002',
      title: 'Door 101 Egress Width Code Compliance',
      description: 'Fire exit door clear opening is 850mm; building code requires minimum 900mm clear width.',
      status: 'In Progress',
      priority: 'High',
      author: 'Code Compliance Officer',
      assignedTo: 'Architectural Lead',
      discipline: 'Architecture',
      elementIds: ['EVL-DOOR-101'],
      createdAt: '2026-08-20T08:10:00Z',
      updatedAt: '2026-08-20T08:15:00Z',
      comments: [
        {
          id: 'comm_2',
          author: 'Architectural Lead',
          date: '2026-08-20T08:15:00Z',
          comment: 'Updating door family type to 1000mm clear leaf width.'
        }
      ]
    };
    this.issues.set(issue2.id, issue2);
  }

  public getAllIssues(): BCFIssue[] {
    return Array.from(this.issues.values());
  }

  public getIssuesForElement(elementId: string): BCFIssue[] {
    return Array.from(this.issues.values()).filter((i) => i.elementIds && i.elementIds.includes(elementId));
  }

  public getIssue(id: string): BCFIssue | undefined {
    return this.issues.get(id);
  }

  public createIssueFromClash(
    title: string,
    description: string,
    elementIds: string[],
    clashRefId: string,
    priority: BCFIssuePriority = 'High',
    author: string = 'EVLab Clash Engine'
  ): BCFIssue {
    const issueId = `BCF-${String(this.issues.size + 1).padStart(3, '0')}`;
    const newIssue: BCFIssue = {
      id: issueId,
      title,
      description,
      status: 'Open',
      priority,
      author,
      assignedTo: 'Engineering Coordinator',
      discipline: 'Coordination',
      elementIds,
      clashRefId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [
        {
          id: `comm_${Date.now()}`,
          author,
          date: new Date().toISOString(),
          comment: `Automated clash report converted to OpenBIM BCF Issue (${clashRefId}).`
        }
      ]
    };

    this.issues.set(newIssue.id, newIssue);
    return newIssue;
  }

  public updateIssueStatus(id: string, status: BCFIssueStatus): void {
    const issue = this.issues.get(id);
    if (issue) {
      issue.status = status;
      issue.updatedAt = new Date().toISOString();
      this.issues.set(id, { ...issue });
    }
  }

  public addCommentToIssue(issueId: string, author: string, comment: string): void {
    const issue = this.issues.get(issueId);
    if (issue) {
      issue.comments.push({
        id: `comm_${Date.now()}`,
        author,
        date: new Date().toISOString(),
        comment
      });
      issue.updatedAt = new Date().toISOString();
      this.issues.set(issueId, { ...issue });
    }
  }
}
