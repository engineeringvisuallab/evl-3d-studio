/**
 * EVLab BIM Core v1.0 - Parametric Family & FamilyType Catalog
 * Architecture, Structure, MEP, and Civil predefined engineering families.
 */

import { BIMFamily, BIMCategoryType, DisciplineType } from './BIMTypes';

export const DEFAULT_BIM_FAMILIES: BIMFamily[] = [
  // --- ARCHITECTURE ---
  {
    id: 'fam_basic_wall',
    name: 'Basic Cavity Wall',
    category: 'Wall',
    discipline: 'Architecture',
    isSystemFamily: true,
    description: 'Layered masonry cavity wall with thermal insulation.',
    types: [
      {
        id: 'type_wall_brick_250',
        familyId: 'fam_basic_wall',
        name: '250mm Insulated Brick Wall',
        category: 'Wall',
        discipline: 'Architecture',
        defaultMaterialId: 'mat_brick',
        ifcEntity: 'IfcWall',
        costPerUnit: 360,
        typeParameters: {
          param_thickness: {
            id: 'param_thickness',
            name: 'Wall Thickness',
            value: 250,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions',
            isReadOnly: true
          },
          param_fire_rating: {
            id: 'param_fire_rating',
            name: 'Fire Rating',
            value: '120 min',
            unit: 'dimensionless',
            dataType: 'Text',
            scope: 'Type',
            group: 'Identity'
          },
          param_u_value: {
            id: 'param_u_value',
            name: 'Thermal Transmittance (U-Value)',
            value: 0.18,
            unit: 'dimensionless',
            dataType: 'Number',
            scope: 'Type',
            group: 'Custom'
          }
        }
      },
      {
        id: 'type_wall_partition_150',
        familyId: 'fam_basic_wall',
        name: '150mm Interior Partition Wall',
        category: 'Wall',
        discipline: 'Architecture',
        defaultMaterialId: 'mat_brick',
        ifcEntity: 'IfcWallStandardCase',
        costPerUnit: 220,
        typeParameters: {
          param_thickness: {
            id: 'param_thickness',
            name: 'Wall Thickness',
            value: 150,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions',
            isReadOnly: true
          },
          param_fire_rating: {
            id: 'param_fire_rating',
            name: 'Fire Rating',
            value: '60 min',
            unit: 'dimensionless',
            dataType: 'Text',
            scope: 'Type',
            group: 'Identity'
          }
        }
      }
    ]
  },
  {
    id: 'fam_timber_door',
    name: 'Single Flush Timber Door',
    category: 'Door',
    discipline: 'Architecture',
    isSystemFamily: false,
    description: 'Pre-hung solid timber interior door with acoustic gasket.',
    types: [
      {
        id: 'type_door_flush_900',
        familyId: 'fam_timber_door',
        name: '900 x 2100 mm Flush Door',
        category: 'Door',
        discipline: 'Architecture',
        defaultMaterialId: 'mat_wood',
        ifcEntity: 'IfcDoor',
        costPerUnit: 450,
        typeParameters: {
          param_door_width: {
            id: 'param_door_width',
            name: 'Door Width',
            value: 900,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_door_height: {
            id: 'param_door_height',
            name: 'Door Height',
            value: 2100,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          }
        }
      },
      {
        id: 'type_door_entrance_1200',
        familyId: 'fam_timber_door',
        name: '1200 x 2200 mm Entrance Door',
        category: 'Door',
        discipline: 'Architecture',
        defaultMaterialId: 'mat_wood',
        ifcEntity: 'IfcDoor',
        costPerUnit: 750,
        typeParameters: {
          param_door_width: {
            id: 'param_door_width',
            name: 'Door Width',
            value: 1200,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_door_height: {
            id: 'param_door_height',
            name: 'Door Height',
            value: 2200,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          }
        }
      }
    ]
  },
  {
    id: 'fam_casement_window',
    name: 'Double Glazed Casement Window',
    category: 'Window',
    discipline: 'Architecture',
    isSystemFamily: false,
    description: 'Thermally broken aluminum casement window with Low-E glass.',
    types: [
      {
        id: 'type_window_casement_1200',
        familyId: 'fam_casement_window',
        name: '1200 x 1500 mm Double Glazed',
        category: 'Window',
        discipline: 'Architecture',
        defaultMaterialId: 'mat_glass',
        ifcEntity: 'IfcWindow',
        costPerUnit: 620,
        typeParameters: {
          param_win_width: {
            id: 'param_win_width',
            name: 'Window Width',
            value: 1200,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_win_height: {
            id: 'param_win_height',
            name: 'Window Height',
            value: 1500,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          }
        }
      },
      {
        id: 'type_window_casement_2400',
        familyId: 'fam_casement_window',
        name: '2400 x 1500 mm Wide Casement',
        category: 'Window',
        discipline: 'Architecture',
        defaultMaterialId: 'mat_glass',
        ifcEntity: 'IfcWindow',
        costPerUnit: 1100,
        typeParameters: {
          param_win_width: {
            id: 'param_win_width',
            name: 'Window Width',
            value: 2400,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_win_height: {
            id: 'param_win_height',
            name: 'Window Height',
            value: 1500,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          }
        }
      }
    ]
  },

  // --- STRUCTURE ---
  {
    id: 'fam_rc_column',
    name: 'Rectangular RC Column',
    category: 'Column',
    discipline: 'Structure',
    isSystemFamily: true,
    description: 'Reinforced concrete square and rectangular load-bearing column.',
    types: [
      {
        id: 'type_column_500x500',
        familyId: 'fam_rc_column',
        name: '500 x 500 mm RC Column C40',
        category: 'Column',
        discipline: 'Structure',
        defaultMaterialId: 'mat_concrete',
        ifcEntity: 'IfcColumn',
        costPerUnit: 1400,
        typeParameters: {
          param_col_w: {
            id: 'param_col_w',
            name: 'Section Width',
            value: 500,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_col_l: {
            id: 'param_col_l',
            name: 'Section Depth',
            value: 500,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_axial_cap: {
            id: 'param_axial_cap',
            name: 'Axial Load Capacity',
            value: 3500,
            unit: 'kN',
            dataType: 'Number',
            scope: 'Type',
            group: 'Structural'
          }
        }
      }
    ]
  },
  {
    id: 'fam_steel_beam',
    name: 'Universal Steel I-Beam',
    category: 'Beam',
    discipline: 'Structure',
    isSystemFamily: true,
    description: 'Hot-rolled structural steel I-section girder.',
    types: [
      {
        id: 'type_beam_ipe_300',
        familyId: 'fam_steel_beam',
        name: 'IPE 300 / UB 305x165x40',
        category: 'Beam',
        discipline: 'Structure',
        defaultMaterialId: 'mat_steel',
        ifcEntity: 'IfcBeam',
        costPerUnit: 2400,
        typeParameters: {
          param_beam_w: {
            id: 'param_beam_w',
            name: 'Flange Width',
            value: 300,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_beam_h: {
            id: 'param_beam_h',
            name: 'Section Depth',
            value: 450,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          }
        }
      }
    ]
  },
  {
    id: 'fam_rc_slab',
    name: 'Reinforced Concrete Suspended Slab',
    category: 'Slab',
    discipline: 'Structure',
    isSystemFamily: true,
    description: 'Two-way suspended monolithic reinforced concrete floor slab.',
    types: [
      {
        id: 'type_slab_200mm',
        familyId: 'fam_rc_slab',
        name: '200mm Suspended Floor Slab C35',
        category: 'Slab',
        discipline: 'Structure',
        defaultMaterialId: 'mat_concrete',
        ifcEntity: 'IfcSlab',
        costPerUnit: 4200,
        typeParameters: {
          param_slab_t: {
            id: 'param_slab_t',
            name: 'Slab Thickness',
            value: 200,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          }
        }
      }
    ]
  },
  {
    id: 'fam_spread_footing',
    name: 'Isolated Spread Footing Pad',
    category: 'Footing',
    discipline: 'Structure',
    isSystemFamily: true,
    description: 'Cast-in-place shallow foundation pad.',
    types: [
      {
        id: 'type_footing_1800x1800',
        familyId: 'fam_spread_footing',
        name: '1800 x 1800 x 500 mm Pad Footing',
        category: 'Footing',
        discipline: 'Structure',
        defaultMaterialId: 'mat_concrete',
        ifcEntity: 'IfcFooting',
        costPerUnit: 850,
        typeParameters: {
          param_ftg_w: {
            id: 'param_ftg_w',
            name: 'Footing Width',
            value: 1800,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_ftg_t: {
            id: 'param_ftg_t',
            name: 'Footing Thickness',
            value: 500,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          }
        }
      }
    ]
  },

  // --- MEP ---
  {
    id: 'fam_hvac_duct',
    name: 'Rectangular HVAC Supply Air Duct',
    category: 'Duct',
    discipline: 'MEP',
    isSystemFamily: true,
    description: 'Galvanized sheet metal rectangular air distribution duct.',
    types: [
      {
        id: 'type_duct_600x400',
        familyId: 'fam_hvac_duct',
        name: '600 x 400 mm Supply Air Duct',
        category: 'Duct',
        discipline: 'MEP',
        defaultMaterialId: 'mat_steel',
        ifcEntity: 'IfcDuctSegment',
        costPerUnit: 1450,
        typeParameters: {
          param_duct_w: {
            id: 'param_duct_w',
            name: 'Duct Width',
            value: 600,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_duct_h: {
            id: 'param_duct_h',
            name: 'Duct Height',
            value: 400,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          }
        }
      }
    ]
  },
  {
    id: 'fam_hdpe_pipe',
    name: 'HDPE Potable Water Pressure Pipe',
    category: 'Pipe',
    discipline: 'MEP',
    isSystemFamily: true,
    description: 'Butt-fused PE100 pressurized potable water distribution pipe (PN16).',
    types: [
      {
        id: 'type_pipe_dn200',
        familyId: 'fam_hdpe_pipe',
        name: 'DN200 PE100 SDR11 Pipe',
        category: 'Pipe',
        discipline: 'MEP',
        defaultMaterialId: 'mat_hdpe',
        ifcEntity: 'IfcPipeSegment',
        costPerUnit: 2800,
        typeParameters: {
          param_diameter: {
            id: 'param_diameter',
            name: 'Nominal Diameter',
            value: 200,
            unit: 'mm',
            dataType: 'Length',
            scope: 'Type',
            group: 'Dimensions'
          },
          param_pressure_bar: {
            id: 'param_pressure_bar',
            name: 'Pressure Class',
            value: 16,
            unit: 'bar',
            dataType: 'Number',
            scope: 'Type',
            group: 'Mechanical'
          }
        }
      }
    ]
  }
];

export class FamilyCatalog {
  private families: Map<string, BIMFamily> = new Map();
  private types: Map<string, { family: BIMFamily; type: any }> = new Map();

  constructor(initialFamilies: BIMFamily[] = DEFAULT_BIM_FAMILIES) {
    initialFamilies.forEach((f) => {
      this.families.set(f.id, f);
      f.types.forEach((t) => {
        this.types.set(t.id, { family: f, type: t });
      });
    });
  }

  public getAllFamilies(): BIMFamily[] {
    return Array.from(this.families.values());
  }

  public getFamily(familyId: string): BIMFamily | undefined {
    return this.families.get(familyId);
  }

  public getType(typeId: string) {
    return this.types.get(typeId);
  }
}
