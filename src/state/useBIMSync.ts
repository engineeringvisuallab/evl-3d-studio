import { useEffect } from 'react';
import { useAppStore } from './useAppStore';
import { useBIMStore } from '../bim/BIMCoreStore';

/**
 * Bridges the viewport's scene-object store (useAppStore) with the BIM
 * engine store (useBIMStore / BIMCoreStore). Every time objects in the
 * viewport change (add / edit / delete / undo / redo), this re-runs
 * BIMCoreStore.syncFromSceneObjects() and validateBIMModel() so that every
 * downstream BIM engine (parametric quantities, IFC mapping, MEP
 * connectors, structural, schedules, cost, 4D/5D/6D) has current data —
 * without the viewport needing to know any BIM engines exist.
 *
 * One-way sync (viewport -> BIM core) for Phase 1. Mount once near the
 * root of the app (see App.tsx).
 */
export function useBIMSync() {
  useEffect(() => {
    const syncNow = () => {
      const objects = Object.values(useAppStore.getState().objects);
      useBIMStore.getState().syncFromSceneObjects(objects);
      useBIMStore.getState().validateBIMModel();
    };

    // Sync once immediately (covers the seeded demo scene on first load).
    syncNow();

    // Re-sync whenever the objects map identity changes (add/update/delete/
    // undo/redo all replace this map in useAppStore).
    const unsubscribe = useAppStore.subscribe((state, prevState) => {
      if (state.objects !== prevState.objects) {
        syncNow();
      }
    });

    return unsubscribe;
  }, []);
}
