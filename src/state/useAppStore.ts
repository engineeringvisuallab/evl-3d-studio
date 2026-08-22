/**
 * EVLab 3D Studio - Application State Store
 * Central zustand store for the viewport session: scene objects, selection,
 * active tool/edit-mode, display settings, layers/materials, and a linear
 * undo/redo command stack. This is the state layer App.tsx and ThreeCanvas
 * both read from and dispatch into.
 */

import { create } from 'zustand';
import {
  SceneObject,
  ToolType,
  EditModeType,
  DisplayMode,
  ViewportMode,
  LayerTag,
  MaterialDef,
  CommandHistoryItem,
  ParametricData,
  BimMetadata,
  SavedScene,
  Vector3D,
} from '../types';
import { buildDemoScene } from './seedDemoScene';
import { BIMLevel } from '../bim/core/BIMTypes';
import { DEFAULT_BIM_LEVELS } from '../bim/core/LevelSystem';

function seedObjects(): Record<string, SceneObject> {
  const objects: Record<string, SceneObject> = {};
  buildDemoScene().forEach((obj) => {
    objects[obj.id] = obj;
  });
  return objects;
}

/** One counter per parametric.type, seeded from whatever's already in the demo scene, so a freshly-placed "Wall N" never collides with an existing name even after deletes (deleting doesn't roll the counter back). */
function seedInstanceCounters(objects: Record<string, SceneObject>): Record<string, number> {
  const counters: Record<string, number> = {};
  Object.values(objects).forEach((obj) => {
    const type = obj.parametric.type;
    counters[type] = (counters[type] ?? 0) + 1;
  });
  return counters;
}

const DEFAULT_LAYER: LayerTag = {
  id: 'layer_default',
  name: 'Layer 0',
  color: '#94a3b8',
  visible: true,
  locked: false,
};

const DEFAULT_MATERIAL: MaterialDef = {
  id: 'mat_default',
  name: 'Default',
  color: '#cbd5e1',
  metalness: 0.1,
  roughness: 0.7,
  opacity: 1,
  transparent: false,
  wireframe: false,
  category: 'General',
};

interface AppState {
  // Scene data
  objects: Record<string, SceneObject>;
  selectedObjectIds: string[];

  // Tool / viewport UI state
  activeTool: ToolType;
  editMode: EditModeType;
  displayMode: DisplayMode;
  viewportMode: ViewportMode;
  showLabels: boolean;
  fps: number;

  // Project resources
  layers: LayerTag[];
  materials: MaterialDef[];

  // Building levels (floors/stories) - Revit-style. New elements are
  // tagged with the active level's name; the level list drives the
  // Building Levels panel and (later) level-based view filtering.
  levels: BIMLevel[];
  activeLevelId: string;
  setActiveLevelId: (id: string) => void;
  addLevel: (name: string, elevationMm: number) => void;
  renameLevel: (id: string, name: string) => void;
  updateLevelElevation: (id: string, elevationMm: number) => void;
  updateLevel: (id: string, patch: Partial<BIMLevel>) => void;
  removeLevel: (id: string) => void;
  isLevelManagerOpen: boolean;
  setIsLevelManagerOpen: (open: boolean) => void;

  // Instance naming - monotonic per parametric.type, survives deletes so
  // names never collide (see seedInstanceCounters)
  typeInstanceCounters: Record<string, number>;
  nextInstanceNumber: (type: string) => number;

  // Undo/redo
  history: CommandHistoryItem[];
  historyIndex: number; // index of the last *applied* command; -1 = nothing applied yet

  // Selection
  selectObject: (id: string, additive?: boolean) => void;
  setSelectedObjectIds: (ids: string[]) => void;
  clearSelection: () => void;

  // Object CRUD
  addObject: (object: SceneObject) => void;
  updateObject: (id: string, patch: Partial<SceneObject>, actionName?: string) => void;
  updateObjectParametric: (id: string, patch: Partial<ParametricData>) => void;
  updateObjectBim: (id: string, patch: Partial<BimMetadata>) => void;
  removeObject: (id: string) => void;
  removeSelectedObjects: () => void;
  duplicateSelectedObjects: () => void;
  groupSelectedObjects: () => void;

  // Layers
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  addLayer: (name: string, color: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;

  // Materials
  activeMaterialId: string;
  setActiveMaterialId: (id: string) => void;
  addMaterial: (material: MaterialDef) => void;

  // Saved camera scenes / viewpoints
  savedScenes: SavedScene[];
  saveCurrentScene: (name: string, cameraPosition: Vector3D, targetPosition: Vector3D) => void;

  // Tools / viewport
  setActiveTool: (tool: ToolType) => void;
  setEditMode: (mode: EditModeType) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setViewportMode: (mode: ViewportMode) => void;
  toggleShowLabels: () => void;
  setFps: (fps: number) => void;

  // History
  pushHistory: (item: Omit<CommandHistoryItem, 'id' | 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;
}

let historySeq = 0;
const initialObjects = seedObjects();

export const useAppStore = create<AppState>((set, get) => ({
  objects: initialObjects,
  selectedObjectIds: [],
  activeTool: 'select',
  editMode: 'object',
  displayMode: 'shaded',
  viewportMode: '3D',
  showLabels: true,
  fps: 60,
  layers: [DEFAULT_LAYER],
  materials: [DEFAULT_MATERIAL],
  levels: DEFAULT_BIM_LEVELS.map((l) => ({ ...l })),
  activeLevelId: 'lvl_01_ground',
  isLevelManagerOpen: false,
  activeLayerId: DEFAULT_LAYER.id,
  activeMaterialId: DEFAULT_MATERIAL.id,
  savedScenes: [],
  typeInstanceCounters: seedInstanceCounters(initialObjects),
  history: [],
  historyIndex: -1,

  setActiveLevelId: (id) => set({ activeLevelId: id }),

  addLevel: (name, elevationMm) =>
    set((state) => {
      const id = `lvl_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newLevel: BIMLevel = {
        id,
        name,
        elevationMm,
        elevationM: elevationMm / 1000,
        isStory: true,
      };
      return { levels: [...state.levels, newLevel] };
    }),

  renameLevel: (id, name) =>
    set((state) => ({
      levels: state.levels.map((l) => (l.id === id ? { ...l, name } : l)),
    })),

  updateLevelElevation: (id, elevationMm) =>
    set((state) => ({
      levels: state.levels.map((l) =>
        l.id === id ? { ...l, elevationMm, elevationM: elevationMm / 1000 } : l
      ),
    })),

  updateLevel: (id, patch) =>
    set((state) => ({
      levels: state.levels.map((l) => {
        if (l.id !== id) return l;
        const merged = { ...l, ...patch };
        // Keep the mm/m mirrors in sync no matter which one the caller patched.
        if (patch.elevationMm !== undefined && patch.elevationM === undefined) {
          merged.elevationM = patch.elevationMm / 1000;
        } else if (patch.elevationM !== undefined && patch.elevationMm === undefined) {
          merged.elevationMm = Math.round(patch.elevationM * 1000);
        }
        return merged;
      }),
    })),

  removeLevel: (id) =>
    set((state) => {
      if (state.levels.length <= 1) return {}; // always keep at least one level
      const remaining = state.levels.filter((l) => l.id !== id);
      const activeLevelId = state.activeLevelId === id ? remaining[0].id : state.activeLevelId;
      return { levels: remaining, activeLevelId };
    }),

  setIsLevelManagerOpen: (open) => set({ isLevelManagerOpen: open }),

  selectObject: (id, additive = false) =>
    set((state) => {
      if (!additive) return { selectedObjectIds: [id] };
      const already = state.selectedObjectIds.includes(id);
      return {
        selectedObjectIds: already
          ? state.selectedObjectIds.filter((s) => s !== id)
          : [...state.selectedObjectIds, id],
      };
    }),

  setSelectedObjectIds: (ids) => set({ selectedObjectIds: ids }),

  clearSelection: () => set({ selectedObjectIds: [] }),

  nextInstanceNumber: (type) => {
    const current = get().typeInstanceCounters[type] ?? 0;
    const next = current + 1;
    set((s) => ({ typeInstanceCounters: { ...s.typeInstanceCounters, [type]: next } }));
    return next;
  },

  addObject: (object) => set((state) => ({ objects: { ...state.objects, [object.id]: object } })),

  updateObjectParametric: (id, patch) => {
    const target = get().objects[id];
    if (!target) return;
    get().updateObject(id, { parametric: { ...target.parametric, ...patch } }, 'Edit Geometry');
  },

  updateObjectBim: (id, patch) => {
    const target = get().objects[id];
    if (!target) return;
    get().updateObject(id, { bim: { ...target.bim, ...patch } }, 'Edit BIM Data');
  },

  updateObject: (id, patch, actionName = 'Modify Object') => {
    const before = get().objects[id];
    if (!before) return;
    const after: SceneObject = { ...before, ...patch };

    set((s) => ({ objects: { ...s.objects, [id]: after } }));

    get().pushHistory({
      actionName,
      undo: () => set((s) => ({ objects: { ...s.objects, [id]: before } })),
      redo: () => set((s) => ({ objects: { ...s.objects, [id]: after } })),
    });
  },

  removeObject: (id) => {
    const removed = get().objects[id];
    if (!removed) return;

    set((s) => {
      const next = { ...s.objects };
      delete next[id];
      return { objects: next, selectedObjectIds: s.selectedObjectIds.filter((sid) => sid !== id) };
    });

    get().pushHistory({
      actionName: 'Delete Object',
      undo: () => set((s) => ({ objects: { ...s.objects, [id]: removed } })),
      redo: () =>
        set((s) => {
          const next = { ...s.objects };
          delete next[id];
          return { objects: next, selectedObjectIds: s.selectedObjectIds.filter((sid) => sid !== id) };
        }),
    });
  },

  removeSelectedObjects: () => {
    const { selectedObjectIds, objects } = get();
    const removedEntries = selectedObjectIds.map((id) => [id, objects[id]] as const).filter(([, o]) => !!o);
    if (removedEntries.length === 0) return;

    set((s) => {
      const next = { ...s.objects };
      removedEntries.forEach(([id]) => delete next[id]);
      return { objects: next, selectedObjectIds: [] };
    });

    get().pushHistory({
      actionName: `Delete ${removedEntries.length} Object(s)`,
      undo: () => set((s) => ({ objects: { ...s.objects, ...Object.fromEntries(removedEntries) } })),
      redo: () =>
        set((s) => {
          const next = { ...s.objects };
          removedEntries.forEach(([id]) => delete next[id]);
          return { objects: next, selectedObjectIds: [] };
        }),
    });
  },

  duplicateSelectedObjects: () => {
    const { selectedObjectIds, objects } = get();
    const sources = selectedObjectIds.map((id) => objects[id]).filter((o): o is SceneObject => !!o);
    if (sources.length === 0) return;

    const clones: SceneObject[] = sources.map((src) => {
      const type = src.parametric.type;
      const n = get().nextInstanceNumber(type);
      const namePrefix = src.name.replace(/\s+\d+$/, '');
      return {
        ...src,
        id: `${type}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        name: `${namePrefix} ${n}`,
        position: { ...src.position, x: src.position.x + 300, z: src.position.z + 300 },
        bim: {
          ...src.bim,
          objectId: `${src.bim.objectId}-COPY`,
          globalId: Math.random().toString(36).substring(2, 10),
        },
      };
    });

    set((s) => ({
      objects: { ...s.objects, ...Object.fromEntries(clones.map((c) => [c.id, c])) },
      selectedObjectIds: clones.map((c) => c.id),
    }));

    get().pushHistory({
      actionName: `Duplicate ${clones.length} Object(s)`,
      undo: () =>
        set((s) => {
          const next = { ...s.objects };
          clones.forEach((c) => delete next[c.id]);
          return { objects: next, selectedObjectIds: [] };
        }),
      redo: () =>
        set((s) => ({
          objects: { ...s.objects, ...Object.fromEntries(clones.map((c) => [c.id, c])) },
          selectedObjectIds: clones.map((c) => c.id),
        })),
    });
  },

  groupSelectedObjects: () => {
    const { selectedObjectIds, objects } = get();
    if (selectedObjectIds.length < 2) return;

    const groupId = `group_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const before = Object.fromEntries(
      selectedObjectIds.map((id) => [id, objects[id]?.parentId] as const)
    );

    set((s) => {
      const next = { ...s.objects };
      selectedObjectIds.forEach((id) => {
        if (next[id]) next[id] = { ...next[id], parentId: groupId };
      });
      return { objects: next };
    });

    get().pushHistory({
      actionName: `Group ${selectedObjectIds.length} Object(s)`,
      undo: () =>
        set((s) => {
          const next = { ...s.objects };
          Object.entries(before).forEach(([id, parentId]) => {
            if (next[id]) next[id] = { ...next[id], parentId };
          });
          return { objects: next };
        }),
      redo: () =>
        set((s) => {
          const next = { ...s.objects };
          selectedObjectIds.forEach((id) => {
            if (next[id]) next[id] = { ...next[id], parentId: groupId };
          });
          return { objects: next };
        }),
    });
  },

  setActiveTool: (tool) => set({ activeTool: tool, editMode: 'object' }),
  setEditMode: (mode) => set({ editMode: mode }),
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setViewportMode: (mode) => set({ viewportMode: mode }),
  toggleShowLabels: () => set((s) => ({ showLabels: !s.showLabels })),
  setFps: (fps) => set({ fps }),

  pushHistory: (item) =>
    set((s) => {
      historySeq += 1;
      const entry: CommandHistoryItem = { id: `hist_${historySeq}`, timestamp: Date.now(), ...item };
      // Discard any redo-able entries beyond the current pointer before pushing a new one
      const truncated = s.history.slice(0, s.historyIndex + 1);
      return { history: [...truncated, entry], historyIndex: truncated.length };
    }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;
    history[historyIndex].undo();
    set({ historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    history[historyIndex + 1].redo();
    set({ historyIndex: historyIndex + 1 });
  },

  setActiveLayerId: (id) => set({ activeLayerId: id }),

  addLayer: (name, color) =>
    set((state) => {
      const id = `layer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newLayer: LayerTag = { id, name, color, visible: true, locked: false };
      return { layers: [...state.layers, newLayer], activeLayerId: id };
    }),

  toggleLayerVisibility: (id) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    })),

  toggleLayerLock: (id) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
    })),

  setActiveMaterialId: (id) => set({ activeMaterialId: id }),

  addMaterial: (material) =>
    set((state) => ({
      materials: [...state.materials, material],
      activeMaterialId: material.id,
    })),

  saveCurrentScene: (name, cameraPosition, targetPosition) =>
    set((state) => {
      const layerVisibilities: Record<string, boolean> = {};
      state.layers.forEach((l) => {
        layerVisibilities[l.id] = l.visible;
      });
      const scene: SavedScene = {
        id: `scene_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name,
        cameraPosition,
        targetPosition,
        displayMode: state.displayMode,
        layerVisibilities,
      };
      return { savedScenes: [...state.savedScenes, scene] };
    }),
}));
