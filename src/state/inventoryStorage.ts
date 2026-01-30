import { InventoryItem } from '../types';

const STORAGE_KEY = 'inventory_items_v1';

export function loadStoredItems(): InventoryItem[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as InventoryItem[];
  } catch {
    return null;
  }
}

export function storeItems(items: InventoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function clearStoredItems() {
  localStorage.removeItem(STORAGE_KEY);
}

