/**
 * EVLab BIM Core v1.2 - Rule-Based Visibility Filter Engine
 * Evaluates BIM parameters and categories to determine element visibility and color overrides.
 */

import { BIMElement, ViewFilter, ViewFilterRule } from '../core/BIMTypes';

export class ViewFilterEngine {
  public static evaluateRule(element: BIMElement, rule: ViewFilterRule): boolean {
    const { field, operator, value } = rule;
    let elemValue: any;

    // Check top-level properties
    if (field in element) {
      elemValue = (element as any)[field];
    } else if (element.instanceParameters && element.instanceParameters[field]) {
      elemValue = element.instanceParameters[field].value;
    } else if (element.instanceParameters && element.instanceParameters[`param_${field}`]) {
      elemValue = element.instanceParameters[`param_${field}`].value;
    } else if (field === 'material' && element.materialId) {
      elemValue = element.materialId;
    }

    if (elemValue === undefined) return false;

    switch (operator) {
      case 'equals':
        return String(elemValue).toLowerCase() === String(value).toLowerCase();
      case 'notEquals':
        return String(elemValue).toLowerCase() !== String(value).toLowerCase();
      case 'contains':
        return String(elemValue).toLowerCase().includes(String(value).toLowerCase());
      case 'greaterThan':
        return Number(elemValue) > Number(value);
      case 'lessThan':
        return Number(elemValue) < Number(value);
      default:
        return false;
    }
  }

  public static isElementVisibleWithFilters(element: BIMElement, filters: ViewFilter[]): { visible: boolean; overrideColor?: string } {
    let visible = true;
    let overrideColor: string | undefined = undefined;

    for (const filter of filters) {
      if (!filter.enabled || filter.rules.length === 0) continue;

      const matchesAllRules = filter.rules.every((rule) => this.evaluateRule(element, rule));

      if (matchesAllRules) {
        if (filter.action === 'Hide') {
          return { visible: false };
        } else if (filter.action === 'Show') {
          visible = true;
        } else if (filter.action === 'OverrideColor') {
          overrideColor = filter.overrideColorHex;
        }
      }
    }

    return { visible, overrideColor };
  }
}
