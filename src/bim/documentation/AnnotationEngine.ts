/**
 * EVLab BIM Core v1.2 - BIM Annotation & Tagging Engine
 * Manages tags, associative dimensions, spot elevations, and note annotations linked to real BIM elements.
 */

import { BIMAnnotation, BIMElement, AnnotationType } from '../core/BIMTypes';

export class AnnotationEngine {
  private annotations: Map<string, BIMAnnotation> = new Map();

  public getAnnotations(): BIMAnnotation[] {
    return Array.from(this.annotations.values());
  }

  public getAnnotationsForView(viewId?: string): BIMAnnotation[] {
    if (!viewId) return this.getAnnotations();
    return this.getAnnotations().filter((a) => !a.viewId || a.viewId === viewId);
  }

  public addAnnotation(annotation: BIMAnnotation): void {
    this.annotations.set(annotation.id, annotation);
  }

  public removeAnnotation(id: string): void {
    this.annotations.delete(id);
  }

  public createTagForElement(element: BIMElement, position?: { x: number; y: number; z: number }): BIMAnnotation {
    let tagType: AnnotationType = 'TextNote';
    let text = element.instanceName || element.name;

    if (element.category === 'Door') {
      tagType = 'DoorTag';
      text = `D-${element.instanceName.slice(-3)}`;
    } else if (element.category === 'Window') {
      tagType = 'WindowTag';
      text = `W-${element.instanceName.slice(-3)}`;
    } else if (element.category === 'Wall') {
      tagType = 'WallTag';
      text = `WL-${(element.instanceParameters?.param_thickness?.value as number) || 250}mm`;
    } else if (element.category === 'Column') {
      tagType = 'TextNote';
      text = `C-${element.instanceName.slice(-3)}`;
    }

    const pos = position || { x: 0, y: 1.5, z: 0 };

    const tag: BIMAnnotation = {
      id: `tag_${element.id}_${Date.now()}`,
      type: tagType,
      targetElementId: element.id,
      position: pos,
      text,
      isAssociated: true
    };

    this.annotations.set(tag.id, tag);
    return tag;
  }

  public createSpotElevation(elevationMm: number, pos: { x: number; y: number; z: number }): BIMAnnotation {
    const elevM = (elevationMm / 1000).toFixed(3);
    const tag: BIMAnnotation = {
      id: `spot_${Date.now()}`,
      type: 'SpotElevation',
      position: pos,
      value: elevationMm,
      unit: 'mm',
      text: `EL. +${elevM}m`,
      isAssociated: false
    };
    this.annotations.set(tag.id, tag);
    return tag;
  }
}
