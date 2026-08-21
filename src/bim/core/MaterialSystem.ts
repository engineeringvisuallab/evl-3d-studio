/**
 * EVLab BIM Core v1.0 - Central Material Database
 * Standard engineering materials with physical, thermal, mechanical, and IFC properties.
 */

export interface EngineeringMaterial {
  id: string;
  name: string;
  category: 'Concrete' | 'Steel' | 'Masonry' | 'Timber' | 'Glass' | 'Polymer' | 'Fluid' | 'Earth' | 'Finishes';
  densityKgM3: number;
  color: string;
  opacity: number;
  metalness: number;
  roughness: number;
  thermalConductivityWMK?: number;
  yieldStrengthMPa?: number;
  costPerM3?: number;
  costPerM2?: number;
  costPerM?: number;
  manufacturer?: string;
  ifcMaterialName: string;
  description: string;
}

export const CENTRAL_MATERIAL_DATABASE: Record<string, EngineeringMaterial> = {
  mat_concrete: {
    id: 'mat_concrete',
    name: 'Structural Concrete C30/37',
    category: 'Concrete',
    densityKgM3: 2400,
    color: '#9ca3af',
    opacity: 1,
    metalness: 0.1,
    roughness: 0.85,
    thermalConductivityWMK: 1.65,
    yieldStrengthMPa: 30,
    costPerM3: 135,
    ifcMaterialName: 'IfcMaterialConcrete',
    description: 'Ready-mix reinforced concrete for foundations, columns, beams, and slabs.'
  },
  mat_steel: {
    id: 'mat_steel',
    name: 'Structural Steel S355 JR',
    category: 'Steel',
    densityKgM3: 7850,
    color: '#475569',
    opacity: 1,
    metalness: 0.85,
    roughness: 0.25,
    thermalConductivityWMK: 50.0,
    yieldStrengthMPa: 355,
    costPerM3: 3200,
    ifcMaterialName: 'IfcMaterialSteel',
    description: 'Hot-rolled structural steel sections for framing and I-beams.'
  },
  mat_brick: {
    id: 'mat_brick',
    name: 'Red Facing Brick Masonry',
    category: 'Masonry',
    densityKgM3: 1800,
    color: '#b91c1c',
    opacity: 1,
    metalness: 0.05,
    roughness: 0.95,
    thermalConductivityWMK: 0.77,
    yieldStrengthMPa: 15,
    costPerM3: 220,
    costPerM2: 55,
    ifcMaterialName: 'IfcMaterialBrick',
    description: 'Clay facing brick with Portland cement mortar for cavity & partition walls.'
  },
  mat_glass: {
    id: 'mat_glass',
    name: 'Double Glazed Architectural Glass',
    category: 'Glass',
    densityKgM3: 2500,
    color: '#38bdf8',
    opacity: 0.35,
    metalness: 0.9,
    roughness: 0.05,
    thermalConductivityWMK: 1.3,
    costPerM2: 120,
    ifcMaterialName: 'IfcMaterialGlass',
    description: 'Low-E coated architectural glass with Argon-filled thermal cavity.'
  },
  mat_wood: {
    id: 'mat_wood',
    name: 'Hardwood Timber Framing',
    category: 'Timber',
    densityKgM3: 650,
    color: '#d97706',
    opacity: 1,
    metalness: 0.05,
    roughness: 0.75,
    thermalConductivityWMK: 0.13,
    yieldStrengthMPa: 24,
    costPerM3: 450,
    ifcMaterialName: 'IfcMaterialWood',
    description: 'Kiln-dried solid timber for doors, window frames, and trim.'
  },
  mat_hdpe: {
    id: 'mat_hdpe',
    name: 'HDPE PE100 SDR11',
    category: 'Polymer',
    densityKgM3: 955,
    color: '#0284c7',
    opacity: 1,
    metalness: 0.15,
    roughness: 0.35,
    thermalConductivityWMK: 0.45,
    costPerM: 28,
    ifcMaterialName: 'IfcMaterialPlastic',
    description: 'High-density polyethylene for pressurized potable water mains (PN16).'
  },
  mat_pvc: {
    id: 'mat_pvc',
    name: 'PVC-U Drainage Pipe',
    category: 'Polymer',
    densityKgM3: 1400,
    color: '#f59e0b',
    opacity: 1,
    metalness: 0.1,
    roughness: 0.3,
    costPerM: 18,
    ifcMaterialName: 'IfcMaterialPlastic',
    description: 'Rigid unplasticized PVC for gravity sanitary and rainwater systems.'
  },
  mat_asphalt: {
    id: 'mat_asphalt',
    name: 'Bituminous Road Asphalt',
    category: 'Finishes',
    densityKgM3: 2350,
    color: '#1e293b',
    opacity: 1,
    metalness: 0.05,
    roughness: 0.95,
    costPerM3: 95,
    ifcMaterialName: 'IfcMaterialAsphalt',
    description: 'Dense-graded hot mix asphalt wearing course for roads and parking.'
  },
  mat_water: {
    id: 'mat_water',
    name: 'Potable Treated Water',
    category: 'Fluid',
    densityKgM3: 1000,
    color: '#0284c7',
    opacity: 0.7,
    metalness: 0.3,
    roughness: 0.1,
    ifcMaterialName: 'IfcMaterialWater',
    description: 'Fluid storage in water treatment plants and reservoir tanks.'
  }
};
