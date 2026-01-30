import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { fetchInventoryItems } from '../data/mockApi';
import { MOCK_ITEMS } from '../data/mockItems';
import { InventoryItem } from '../types';
import { clearStoredItems, loadStoredItems, storeItems } from './inventoryStorage';

type InventoryState = {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  forceErrorNextLoad: boolean;
  lastSaveMessage: string | null;
  undoSnapshot: InventoryItem[] | null;
  persistEnabled: boolean;
};

type Action =
  | { type: 'load_start' }
  | { type: 'load_success'; items: InventoryItem[] }
  | { type: 'load_error'; error: string }
  | { type: 'select'; id: string | null }
  | { type: 'set_force_error_next_load'; value: boolean }
  | { type: 'save_item'; id: string; precio: number; stock: number }
  | { type: 'clear_save_message' }
  | { type: 'reset_to_mock' }
  | { type: 'undo' };

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
  selectedId: null,
  forceErrorNextLoad: false,
  lastSaveMessage: null,
  undoSnapshot: null,
  persistEnabled: false,
};

function reducer(state: InventoryState, action: Action): InventoryState {
  switch (action.type) {
    case 'load_start':
      return { ...state, loading: true, error: null, lastSaveMessage: null };
    case 'load_success':
      return { ...state, loading: false, error: null, items: action.items, persistEnabled: false };
    case 'load_error':
      return { ...state, loading: false, error: action.error };
    case 'select':
      return { ...state, selectedId: action.id };
    case 'set_force_error_next_load':
      return { ...state, forceErrorNextLoad: action.value };
    case 'save_item': {
      const prevItems = state.items;
      const now = new Date();
      now.setSeconds(0, 0);
      const updatedIso = now.toISOString();

      const nextItems = prevItems.map((it) =>
        it.id !== action.id
          ? it
          : { ...it, precio: action.precio, stock: action.stock, actualizado_en: updatedIso }
      );

      return {
        ...state,
        items: nextItems,
        undoSnapshot: prevItems,
        lastSaveMessage: 'Cambios guardados.',
        persistEnabled: true,
      };
    }
    case 'clear_save_message':
      return { ...state, lastSaveMessage: null };
    case 'reset_to_mock':
      return {
        ...state,
        items: MOCK_ITEMS.map((it) => ({ ...it })),
        selectedId: null,
        error: null,
        loading: false,
        undoSnapshot: null,
        lastSaveMessage: 'Inventario restaurado al mock original.',
        persistEnabled: false,
      };
    case 'undo':
      if (!state.undoSnapshot) return state;
      return {
        ...state,
        items: state.undoSnapshot,
        undoSnapshot: null,
        lastSaveMessage: 'Último cambio deshecho.',
        persistEnabled: true,
      };
    default:
      return state;
  }
}

type InventoryContextValue = InventoryState & {
  load: () => Promise<void>;
  reset: () => void;
  saveItem: (input: { id: string; precio: number; stock: number }) => void;
  undo: () => void;
  setSelectedId: (id: string | null) => void;
  setForceErrorNextLoad: (value: boolean) => void;
  clearSaveMessage: () => void;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(async () => {
    dispatch({ type: 'load_start' });
    try {
      const stored = loadStoredItems();
      const base = await fetchInventoryItems({ forceError: state.forceErrorNextLoad });
      const items = stored ?? base;
      dispatch({ type: 'load_success', items });
      dispatch({ type: 'set_force_error_next_load', value: false });
    } catch (e) {
      dispatch({
        type: 'load_error',
        error: e instanceof Error ? e.message : 'Error desconocido.',
      });
      dispatch({ type: 'set_force_error_next_load', value: false });
    }
  }, []);

  const reset = useCallback(() => {
    clearStoredItems();
    dispatch({ type: 'reset_to_mock' });
  }, []);

  const saveItem = useCallback((input: { id: string; precio: number; stock: number }) => {
    dispatch({ type: 'save_item', ...input });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'undo' });
  }, []);

  const setSelectedId = useCallback((id: string | null) => dispatch({ type: 'select', id }), []);

  const setForceErrorNextLoad = useCallback(
    (value: boolean) => dispatch({ type: 'set_force_error_next_load', value }),
    []
  );

  const clearSaveMessage = useCallback(() => dispatch({ type: 'clear_save_message' }), []);

  // Persist only after user changes (save/undo). Reset must clear localStorage.
  React.useEffect(() => {
    if (!state.persistEnabled) return;
    if (state.items.length === 0) return;
    storeItems(state.items);
  }, [state.items, state.persistEnabled]);

  const value: InventoryContextValue = useMemo(
    () => ({
      ...state,
      load,
      reset,
      saveItem,
      undo,
      setSelectedId,
      setForceErrorNextLoad,
      clearSaveMessage,
    }),
    [state, load, reset, saveItem, undo, setSelectedId, setForceErrorNextLoad, clearSaveMessage]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}

