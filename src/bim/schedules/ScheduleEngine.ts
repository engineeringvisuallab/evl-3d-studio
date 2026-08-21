/**
 * EVLab BIM Core v1.2 - Live Schedule & Takeoff Engine 2.0
 * Provides dynamic querying, live calculated fields (FormulaEngine), sorting, grouping, and totals across all BIM elements.
 */

import { BIMElement, BIMScheduleDefinition, BIMScheduleColumn, BIMRoom } from '../core/BIMTypes';
import { FormulaEngine } from '../parametric/FormulaEngine';
import { CENTRAL_MATERIAL_DATABASE } from '../core/MaterialSystem';

export interface ScheduleRow {
  elementId: string;
  values: Record<string, any>;
  calculationTrace?: Record<string, any>;
}

export interface ScheduleQueryResult {
  definition: BIMScheduleDefinition;
  columns: BIMScheduleColumn[];
  rows: ScheduleRow[];
  totals: Record<string, number>;
  totalRowCount: number;
}

export class ScheduleEngine {
  public static readonly DEFAULT_SCHEDULES: BIMScheduleDefinition[] = [
    {
      id: 'sched_doors',
      title: 'Door Schedule',
      targetCategory: 'Door',
      discipline: 'Architecture',
      columns: [
        { id: 'col_mark', field: 'instanceName', header: 'Door Mark', widthPx: 100, alignment: 'left' },
        { id: 'col_level', field: 'levelId', header: 'Level', widthPx: 120, alignment: 'left' },
        { id: 'col_width', field: 'width', header: 'Width (mm)', unit: 'mm', widthPx: 90, alignment: 'right' },
        { id: 'col_height', field: 'height', header: 'Height (mm)', unit: 'mm', widthPx: 90, alignment: 'right' },
        { id: 'col_material', field: 'material', header: 'Material', widthPx: 130, alignment: 'left' },
        { id: 'col_cost', field: 'costTotal', header: 'Cost ($)', unit: 'currency', widthPx: 100, alignment: 'right', showTotal: true }
      ],
      filters: [],
      sortField: 'instanceName',
      sortDirection: 'asc',
      grandTotal: true
    },
    {
      id: 'sched_windows',
      title: 'Window Schedule',
      targetCategory: 'Window',
      discipline: 'Architecture',
      columns: [
        { id: 'col_mark', field: 'instanceName', header: 'Window Mark', widthPx: 100, alignment: 'left' },
        { id: 'col_level', field: 'levelId', header: 'Level', widthPx: 120, alignment: 'left' },
        { id: 'col_width', field: 'width', header: 'Width (mm)', unit: 'mm', widthPx: 90, alignment: 'right' },
        { id: 'col_height', field: 'height', header: 'Height (mm)', unit: 'mm', widthPx: 90, alignment: 'right' },
        { id: 'col_material', field: 'material', header: 'Frame / Glazing', widthPx: 130, alignment: 'left' },
        { id: 'col_cost', field: 'costTotal', header: 'Cost ($)', unit: 'currency', widthPx: 100, alignment: 'right', showTotal: true }
      ],
      filters: [],
      sortField: 'instanceName',
      sortDirection: 'asc',
      grandTotal: true
    },
    {
      id: 'sched_walls',
      title: 'Wall Takeoff & Quantities',
      targetCategory: 'Wall',
      discipline: 'Architecture',
      columns: [
        { id: 'col_name', field: 'name', header: 'Wall Description', widthPx: 140, alignment: 'left' },
        { id: 'col_length', field: 'length', header: 'Length (m)', unit: 'm', widthPx: 90, alignment: 'right' },
        { id: 'col_height', field: 'height', header: 'Height (m)', unit: 'm', widthPx: 90, alignment: 'right' },
        { id: 'col_thickness', field: 'thickness', header: 'Thickness (mm)', unit: 'mm', widthPx: 90, alignment: 'right' },
        { id: 'col_area', field: 'surfaceAreaM2', header: 'Area (m²)', unit: 'm2', widthPx: 90, alignment: 'right', showTotal: true },
        { id: 'col_vol', field: 'volumeM3', header: 'Volume (m³)', unit: 'm3', widthPx: 90, alignment: 'right', showTotal: true },
        { id: 'col_cost', field: 'costTotal', header: 'Total ($)', unit: 'currency', widthPx: 100, alignment: 'right', showTotal: true }
      ],
      filters: [],
      sortField: 'name',
      sortDirection: 'asc',
      grandTotal: true
    },
    {
      id: 'sched_structure',
      title: 'Structural Column & Beam Schedule',
      targetCategory: 'Column',
      discipline: 'Structure',
      columns: [
        { id: 'col_mark', field: 'instanceName', header: 'Mark', widthPx: 100, alignment: 'left' },
        { id: 'col_cat', field: 'category', header: 'Category', widthPx: 90, alignment: 'left' },
        { id: 'col_mat', field: 'material', header: 'Material Spec', widthPx: 140, alignment: 'left' },
        { id: 'col_vol', field: 'volumeM3', header: 'Volume (m³)', unit: 'm3', widthPx: 90, alignment: 'right', showTotal: true },
        { id: 'col_cost', field: 'costTotal', header: 'Cost ($)', unit: 'currency', widthPx: 100, alignment: 'right', showTotal: true }
      ],
      filters: [],
      sortField: 'instanceName',
      sortDirection: 'asc',
      grandTotal: true
    },
    {
      id: 'sched_mep',
      title: 'MEP Piping & Ductwork Schedule',
      targetCategory: 'Pipe',
      discipline: 'MEP',
      columns: [
        { id: 'col_name', field: 'name', header: 'Segment', widthPx: 130, alignment: 'left' },
        { id: 'col_sys', field: 'system', header: 'MEP System', widthPx: 140, alignment: 'left' },
        { id: 'col_dia', field: 'diameter', header: 'Size (mm)', unit: 'mm', widthPx: 90, alignment: 'right' },
        { id: 'col_len', field: 'length', header: 'Length (m)', unit: 'm', widthPx: 90, alignment: 'right', showTotal: true },
        { id: 'col_cost', field: 'costTotal', header: 'Cost ($)', unit: 'currency', widthPx: 90, alignment: 'right', showTotal: true }
      ],
      filters: [],
      sortField: 'name',
      sortDirection: 'asc',
      grandTotal: true
    },
    {
      id: 'sched_rooms',
      title: 'Room & Space Schedule',
      targetCategory: 'Room',
      discipline: 'Architecture',
      columns: [
        { id: 'col_num', field: 'number', header: 'Room No.', widthPx: 80, alignment: 'center' },
        { id: 'col_name', field: 'name', header: 'Room Name', widthPx: 150, alignment: 'left' },
        { id: 'col_dept', field: 'department', header: 'Department', widthPx: 110, alignment: 'left' },
        { id: 'col_level', field: 'levelId', header: 'Level', widthPx: 100, alignment: 'left' },
        { id: 'col_area', field: 'areaM2', header: 'Area (m²)', unit: 'm2', widthPx: 90, alignment: 'right', showTotal: true },
        { id: 'col_vol', field: 'volumeM3', header: 'Volume (m³)', unit: 'm3', widthPx: 90, alignment: 'right', showTotal: true }
      ],
      filters: [],
      sortField: 'number',
      sortDirection: 'asc',
      grandTotal: true
    }
  ];

  public static executeSchedule(
    definition: BIMScheduleDefinition,
    elements: Map<string, BIMElement>,
    rooms: BIMRoom[] = []
  ): ScheduleQueryResult {
    let rows: ScheduleRow[] = [];
    const totals: Record<string, number> = {};

    definition.columns.forEach((col) => {
      if (col.showTotal) totals[col.field] = 0;
    });

    if (definition.targetCategory === 'Room') {
      // Query Rooms
      rooms.forEach((rm) => {
        const values: Record<string, any> = {
          number: rm.number,
          name: rm.name,
          department: rm.department,
          levelId: rm.levelId.replace('lvl_', '').toUpperCase(),
          areaM2: rm.areaM2,
          perimeterM: rm.perimeterM,
          volumeM3: rm.volumeM3
        };

        if (totals.areaM2 !== undefined) totals.areaM2 += rm.areaM2;
        if (totals.volumeM3 !== undefined) totals.volumeM3 += rm.volumeM3;

        rows.push({
          elementId: rm.id,
          values
        });
      });
    } else {
      // Query Elements
      elements.forEach((elem) => {
        // Filter by category
        if (definition.targetCategory !== 'All' && elem.category !== definition.targetCategory) {
          if (!(definition.targetCategory === 'Column' && (elem.category === 'Beam' || elem.category === 'Column'))) {
            if (!(definition.targetCategory === 'Pipe' && (elem.category === 'Duct' || elem.category === 'Pipe' || elem.category === 'CableTray'))) {
              return;
            }
          }
        }

        // Filter by discipline
        if (definition.discipline && elem.discipline !== definition.discipline) {
          return;
        }

        const mat = CENTRAL_MATERIAL_DATABASE[elem.materialId] || CENTRAL_MATERIAL_DATABASE.mat_concrete;
        const lengthMm = (elem.instanceParameters?.param_length?.value as number) || 5000;
        const heightMm = (elem.instanceParameters?.param_height?.value as number) || 3000;
        const thicknessMm = (elem.instanceParameters?.param_thickness?.value as number) || 250;
        const diameterMm = (elem.instanceParameters?.param_diameter?.value as number) || 150;

        const values: Record<string, any> = {
          id: elem.id,
          name: elem.name,
          instanceName: elem.instanceName,
          category: elem.category,
          discipline: elem.discipline,
          levelId: (elem.baseLevelId || elem.levelId || '').replace('lvl_', '').toUpperCase(),
          material: mat.name,
          length: Math.round((lengthMm / 1000) * 100) / 100,
          height: Math.round((heightMm / 1000) * 100) / 100,
          width: Math.round((lengthMm / 1000) * 100) / 100,
          thickness: thicknessMm,
          diameter: diameterMm,
          surfaceAreaM2: elem.quantities?.surfaceAreaM2 || 0,
          volumeM3: elem.quantities?.volumeM3 || 0,
          costTotal: elem.quantities?.costTotal || 0,
          system: elem.connectors?.[0]?.systemName || 'Standard'
        };

        // Evaluate custom calculated columns
        const calcTrace: Record<string, any> = {};
        definition.columns.forEach((col) => {
          if (col.isCalculated && col.formula) {
            const numVars: Record<string, number> = {};
            Object.entries(values).forEach(([k, v]) => {
              if (typeof v === 'number') numVars[k] = v;
            });
            const res = FormulaEngine.evaluate(col.formula, numVars);
            values[col.field] = res.value;
            calcTrace[col.field] = res.calcTraceId;
          }

          if (col.showTotal && typeof values[col.field] === 'number') {
            totals[col.field] = (totals[col.field] || 0) + values[col.field];
          }
        });

        rows.push({
          elementId: elem.id,
          values,
          calculationTrace: calcTrace
        });
      });
    }

    // Sort rows
    if (definition.sortField) {
      const field = definition.sortField;
      const dir = definition.sortDirection === 'desc' ? -1 : 1;
      rows.sort((a, b) => {
        const valA = a.values[field];
        const valB = b.values[field];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * dir;
        }
        return String(valA || '').localeCompare(String(valB || '')) * dir;
      });
    }

    // Round totals
    Object.keys(totals).forEach((k) => {
      totals[k] = Math.round(totals[k] * 100) / 100;
    });

    return {
      definition,
      columns: definition.columns,
      rows,
      totals,
      totalRowCount: rows.length
    };
  }

  public static exportToCSV(result: ScheduleQueryResult): string {
    const headers = result.columns.map((c) => `"${c.header}"`).join(',');
    const dataLines = result.rows.map((r) => {
      return result.columns
        .map((c) => {
          const val = r.values[c.field] !== undefined ? r.values[c.field] : '';
          return `"${val}"`;
        })
        .join(',');
    });

    if (result.definition.grandTotal) {
      const totalLine = result.columns
        .map((c, idx) => {
          if (idx === 0) return '"TOTAL"';
          if (c.showTotal && result.totals[c.field] !== undefined) return `"${result.totals[c.field]}"`;
          return '""';
        })
        .join(',');
      dataLines.push(totalLine);
    }

    return [headers, ...dataLines].join('\n');
  }
}
