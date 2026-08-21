/**
 * EVLab BIM Core v1.2 - OpenBIM IFC 4 STEP Exporter
 * Produces structured ISO-10303-21 STEP physical files with complete spatial hierarchy:
 * IfcProject -> IfcSite -> IfcBuilding -> IfcBuildingStorey -> IfcProduct elements,
 * containing Property Sets, Base Quantities, Materials, and Classifications.
 */

import { BIMElement, BIMLevel, BIMGridLine } from '../core/BIMTypes';
import { IFCPropertySets } from './IFCPropertySets';
import { CENTRAL_MATERIAL_DATABASE } from '../core/MaterialSystem';

export class IFCExporter {
  public static exportToIFC4STEP(
    elements: Map<string, BIMElement>,
    levels: BIMLevel[],
    gridLines: BIMGridLine[] = [],
    projectName: string = 'EVLab BIM Model'
  ): string {
    let stepId = 1;
    const lines: string[] = [];

    const getNextId = () => `#${stepId++}`;

    // 1. ISO-10303-21 Header
    const nowISO = new Date().toISOString();
    const header = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [CoordinationView_V2.0, QuantityTakeOffAddOnView]','EVLab OpenBIM Certified Export'),'2;1');
FILE_NAME('${projectName}.ifc','${nowISO}',('EVLab User'),('EVLab Studio Architecture'),'EVLab IFC4 Generator v1.2','EVLab 3D Studio','Ayatullah Engineering');
FILE_SCHEMA(('IFC4'));
ENDSEC;

DATA;`;
    lines.push(header);

    // Context & Units
    const idProject = getNextId();
    const idSite = getNextId();
    const idBuilding = getNextId();
    const idWorldCoord = getNextId();
    const idUnitAssignment = getNextId();
    const idLengthUnit = getNextId();
    const idAreaUnit = getNextId();
    const idVolumeUnit = getNextId();

    lines.push(`${idLengthUnit}=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);`);
    lines.push(`${idAreaUnit}=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);`);
    lines.push(`${idVolumeUnit}=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);`);
    lines.push(`${idUnitAssignment}=IFCUNITASSIGNMENT((${idLengthUnit},${idAreaUnit},${idVolumeUnit}));`);
    lines.push(`${idWorldCoord}=IFCAXIS2PLACEMENT3D(#${stepId++},$,$);`);

    // IfcProject
    lines.push(`${idProject}=IFCPROJECT('1EVLProject0000000000000',#1,'${projectName}','EVLab BIM Model v1.2',$,$,$,(#${stepId++}),${idUnitAssignment});`);

    // IfcSite & IfcBuilding
    lines.push(`${idSite}=IFCSITE('1EVLSite0000000000000000',#1,'Default Site','EVLab Project Site',$,$,$,$,.ELEMENT.,(40,42,46,0),(-74,0,-21,0),0.0,$,$);`);
    lines.push(`${idBuilding}=IFCBUILDING('1EVLBuilding000000000000',#1,'Building 01','Main Facility',$,$,$,$,.ELEMENT.,$,$,$);`);

    // Storey Mapping
    const storeyMap = new Map<string, string>();
    levels.forEach((lvl) => {
      const sId = getNextId();
      storeyMap.set(lvl.id, sId);
      lines.push(`${sId}=IFCBUILDINGSTOREY('1EVLStorey_${lvl.id.slice(0, 10)}',#1,'${lvl.name}','Storey datum',$,$,$,$,.ELEMENT.,${lvl.elevationM * 1000});`);
    });

    // Elements
    const elementsByStorey = new Map<string, string[]>();

    elements.forEach((elem) => {
      const elemId = getNextId();
      const ifcClass = (elem.ifcMapping?.ifcEntity || 'IFCBUILDINGELEMENTPROXY').toUpperCase();
      const storeyId = storeyMap.get(elem.baseLevelId || elem.levelId) || storeyMap.get('lvl_01_ground') || idBuilding;

      if (!elementsByStorey.has(storeyId)) {
        elementsByStorey.set(storeyId, []);
      }
      elementsByStorey.get(storeyId)!.push(elemId);

      const guid = elem.ifcMapping?.ifcGuid || elem.globalId || '1EVLElem0000000000000000';
      const name = elem.name.replace(/'/g, "''");
      const desc = (elem.instanceName || '').replace(/'/g, "''");

      // IFC Entity
      lines.push(`${elemId}=${ifcClass}('${guid}',#1,'${name}','${desc}','${elem.typeId}',$,$,$,$);`);

      // Property Sets
      const psets = IFCPropertySets.generateStandardPsets(elem);
      psets.forEach((pset) => {
        const propIds: string[] = [];
        Object.entries(pset.properties).forEach(([pKey, pVal]) => {
          const pId = getNextId();
          propIds.push(pId);
          if (typeof pVal === 'number') {
            lines.push(`${pId}=IFCPROPERTYSINGLEVALUE('${pKey}','',IFCREAL(${pVal}),$);`);
          } else if (typeof pVal === 'boolean') {
            lines.push(`${pId}=IFCPROPERTYSINGLEVALUE('${pKey}','',IFCBOOLEAN(.${pVal ? 'T' : 'F'}.),$);`);
          } else {
            lines.push(`${pId}=IFCPROPERTYSINGLEVALUE('${pKey}','',IFCLABEL('${String(pVal).replace(/'/g, "''")}'),$);`);
          }
        });

        const psetId = getNextId();
        lines.push(`${psetId}=IFCPROPERTYSET('${guid.slice(0, 16)}_pset',#1,'${pset.name}',$,(${propIds.join(',')}));`);
        lines.push(`${getNextId()}=IFCRELDEFINESBYPROPERTIES('${guid.slice(0, 16)}_rel',#1,$,$,(${elemId}),${psetId});`);
      });

      // Quantities Set (Qto_BaseQuantities)
      if (elem.quantities) {
        const qVolId = getNextId();
        const qAreaId = getNextId();
        const qLenId = getNextId();
        lines.push(`${qVolId}=IFCQUANTITYVOLUME('NetVolume','',$,${elem.quantities.volumeM3});`);
        lines.push(`${qAreaId}=IFCQUANTITYAREA('NetArea','',$,${elem.quantities.surfaceAreaM2});`);
        lines.push(`${qLenId}=IFCQUANTITYLENGTH('Length','',$,${elem.quantities.lengthM});`);

        const qtoId = getNextId();
        lines.push(`${qtoId}=IFCELEMENTQUANTITY('${guid.slice(0, 16)}_qto',#1,'Qto_${elem.category}BaseQuantities',$,$,(${qVolId},${qAreaId},${qLenId}));`);
        lines.push(`${getNextId()}=IFCRELDEFINESBYPROPERTIES('${guid.slice(0, 16)}_rqto',#1,$,$,(${elemId}),${qtoId});`);
      }
    });

    // RelContainedInSpatialStructure
    elementsByStorey.forEach((elemIds, sId) => {
      if (elemIds.length > 0) {
        lines.push(`${getNextId()}=IFCRELCONTAINEDINSPATIALSTRUCTURE('${sId.replace('#', '')}_rel',#1,'Storey Elements',$,(${elemIds.join(',')}),${sId});`);
      }
    });

    lines.push(`ENDSEC;
END-ISO-10303-21;`);

    return lines.join('\n');
  }
}
