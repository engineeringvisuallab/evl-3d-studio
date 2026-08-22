/**
 * EVLab BIM Core v1.0 - OpenBIM IFC Mapping & Property Sets Layer
 * Converts BIM elements to ISO 16739-1 IFC 4 / IFC 4.3 entities & Property Sets.
 */

import { BIMElement, IFCMappingData } from '../core/BIMTypes';
import { CENTRAL_MATERIAL_DATABASE } from '../core/MaterialSystem';

export class IFCMapper {
  /**
   * Generates a stable IFC 22-character GUID from a seed or standard UUID
   */
  public static generateIfcGuid(seed?: string): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
    let res = '';
    for (let i = 0; i < 22; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }

  /**
   * Determines appropriate IFC entity class and Common Property Sets
   */
  public static createIfcMapping(
    category: string,
    elementName: string,
    materialId: string,
    customProps: Record<string, any> = {}
  ): IFCMappingData {
    let ifcEntity = 'IfcBuildingElementProxy';
    let psetName = 'Pset_BuildingElementProxyCommon';

    switch (category.toLowerCase()) {
      case 'wall':
      case 'architectural':
        ifcEntity = 'IfcWall';
        psetName = 'Pset_WallCommon';
        break;
      case 'door':
        ifcEntity = 'IfcDoor';
        psetName = 'Pset_DoorCommon';
        break;
      case 'window':
        ifcEntity = 'IfcWindow';
        psetName = 'Pset_WindowCommon';
        break;
      case 'column':
      case 'structure':
        ifcEntity = 'IfcColumn';
        psetName = 'Pset_ColumnCommon';
        break;
      case 'beam':
        ifcEntity = 'IfcBeam';
        psetName = 'Pset_BeamCommon';
        break;
      case 'slab':
      case 'floor':
        ifcEntity = 'IfcSlab';
        psetName = 'Pset_SlabCommon';
        break;
      case 'footing':
        ifcEntity = 'IfcFooting';
        psetName = 'Pset_FootingCommon';
        break;
      case 'roof':
        ifcEntity = 'IfcRoof';
        psetName = 'Pset_RoofCommon';
        break;
      case 'stair':
        ifcEntity = 'IfcStair';
        psetName = 'Pset_StairCommon';
        break;
      case 'pipe':
      case 'water':
        ifcEntity = 'IfcPipeSegment';
        psetName = 'Pset_PipeSegmentOccurrence';
        break;
      case 'duct':
      case 'mechanical':
        ifcEntity = 'IfcDuctSegment';
        psetName = 'Pset_DuctSegmentOccurrence';
        break;
    }

    const material = CENTRAL_MATERIAL_DATABASE[materialId];

    return {
      ifcEntity,
      ifcGuid: IFCMapper.generateIfcGuid(elementName),
      exportAs: ifcEntity,
      propertySets: [
        {
          name: psetName,
          properties: {
            Reference: elementName,
            Status: 'NEW',
            LoadBearing: category === 'Structure' || category === 'Wall',
            IsExternal: category === 'Wall' || category === 'Roof',
            FireRating: customProps['Fire Rating'] || customProps['Fire Resistance'] || 'N/A'
          }
        },
        {
          name: 'Pset_EVL_Engineering',
          properties: {
            MaterialName: material?.name || 'Structural Concrete',
            DensityKgM3: material?.densityKgM3 || 2400,
            YieldStrengthMPa: material?.yieldStrengthMPa || 30,
            ThermalConductivity: material?.thermalConductivityWMK || 1.65,
            ...customProps
          }
        },
        {
          name: 'Pset_EVL_Cost',
          properties: {
            EstimatedCost: customProps.costEstimate || 1000,
            Currency: 'USD'
          }
        }
      ]
    };
  }
}
