import { InventoryItem } from '../types';
import { MOCK_ITEMS } from './mockItems';

export type MockApiOptions = {
  minDelayMs?: number;
  maxDelayMs?: number;
  errorRate?: number; // 0..1
  forceError?: boolean;
};

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function randomIntInclusive(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function fetchInventoryItems(
  opts: MockApiOptions = {}
): Promise<InventoryItem[]> {
  const minDelayMs = opts.minDelayMs ?? 300;
  const maxDelayMs = opts.maxDelayMs ?? 800;
  const errorRate = opts.errorRate ?? 0.07;
  const forceError = opts.forceError ?? false;

  await wait(randomIntInclusive(minDelayMs, maxDelayMs));

  if (forceError || Math.random() < errorRate) {
    throw new Error('Error simulado cargando el inventario. Intenta de nuevo.');
  }

  // return a fresh copy
  return MOCK_ITEMS.map((it) => ({ ...it }));
}

