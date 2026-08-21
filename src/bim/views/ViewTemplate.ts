/**
 * EVLab BIM Core v1.2 - Reusable View Templates
 * Provides standard BIM view template definitions for Architecture, Structure, MEP, and Coordination.
 */

import { ViewTemplate } from '../core/BIMTypes';

export const DEFAULT_VIEW_TEMPLATES: ViewTemplate[] = [
  {
    id: 'tmpl_arch_plan',
    name: 'Architectural Plan',
    discipline: 'Architecture',
    detailLevel: 'Fine',
    scale: '1:100',
    visibilityRules: {
      categories: {
        Wall: true,
        Door: true,
        Window: true,
        Floor: true,
        Roof: true,
        Stair: true,
        Column: true,
        Beam: false,
        Slab: true,
        Footing: false,
        Pipe: false,
        Duct: false,
        CableTray: false,
        Equipment: true,
        Generic: true
      },
      disciplines: {
        Architecture: true,
        Structure: false,
        MEP: false,
        Civil: false
      },
      showAnnotations: true,
      showGrids: true,
      showLevels: true,
      showAnalytical: false
    },
    filters: []
  },
  {
    id: 'tmpl_struct_plan',
    name: 'Structural Plan',
    discipline: 'Structure',
    detailLevel: 'Medium',
    scale: '1:100',
    visibilityRules: {
      categories: {
        Wall: true,
        Door: false,
        Window: false,
        Floor: false,
        Roof: false,
        Stair: false,
        Column: true,
        Beam: true,
        Slab: true,
        Footing: true,
        Pipe: false,
        Duct: false,
        CableTray: false,
        Equipment: false,
        Generic: false
      },
      disciplines: {
        Architecture: false,
        Structure: true,
        MEP: false,
        Civil: false
      },
      showAnnotations: true,
      showGrids: true,
      showLevels: true,
      showAnalytical: false
    },
    filters: []
  },
  {
    id: 'tmpl_mep_plan',
    name: 'MEP Coordination Plan',
    discipline: 'MEP',
    detailLevel: 'Fine',
    scale: '1:50',
    visibilityRules: {
      categories: {
        Wall: true,
        Door: true,
        Window: true,
        Floor: false,
        Roof: false,
        Stair: false,
        Column: true,
        Beam: true,
        Slab: false,
        Footing: false,
        Pipe: true,
        Duct: true,
        CableTray: true,
        Equipment: true,
        Generic: true
      },
      disciplines: {
        Architecture: true,
        Structure: true,
        MEP: true,
        Civil: false
      },
      showAnnotations: true,
      showGrids: true,
      showLevels: true,
      showAnalytical: false
    },
    filters: []
  },
  {
    id: 'tmpl_coordination_3d',
    name: 'Coordination 3D',
    discipline: 'Coordination',
    detailLevel: 'Fine',
    scale: '1:100',
    visibilityRules: {
      categories: {
        Wall: true,
        Door: true,
        Window: true,
        Floor: true,
        Roof: true,
        Stair: true,
        Column: true,
        Beam: true,
        Slab: true,
        Footing: true,
        Pipe: true,
        Duct: true,
        CableTray: true,
        Equipment: true,
        Generic: true
      },
      disciplines: {
        Architecture: true,
        Structure: true,
        MEP: true,
        Civil: true
      },
      showAnnotations: false,
      showGrids: true,
      showLevels: true,
      showAnalytical: false
    },
    filters: []
  }
];
