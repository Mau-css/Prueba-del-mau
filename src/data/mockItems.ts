import { InventoryItem, ItemCategory } from '../types';

const CATEGORIES: ItemCategory[] = ['Electrónica', 'Hogar', 'Ropa', 'Deportes', 'Libros'];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function isoDaysAgo(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  // trunc to minutes for nicer display
  d.setSeconds(0, 0);
  return d.toISOString();
}

export function createMockItems(count: number = 60): InventoryItem[] {
  const rand = mulberry32(42);

  const nouns = [
    'Auriculares',
    'Lámpara',
    'Camiseta',
    'Zapatillas',
    'Libro',
    'Teclado',
    'Sartén',
    'Mochila',
    'Pelota',
    'Novela',
    'Monitor',
    'Toalla',
    'Sudadera',
    'Bicicleta',
    'Guía',
  ];

  const adjectives = [
    'Pro',
    'Mini',
    'Plus',
    'Eco',
    'Premium',
    'Clásico',
    'Smart',
    'Compacto',
    'Deluxe',
    'Edición 2026',
  ];

  const items: InventoryItem[] = [];
  for (let i = 1; i <= count; i += 1) {
    const cat = CATEGORIES[Math.floor(rand() * CATEGORIES.length)];
    const noun = nouns[Math.floor(rand() * nouns.length)];
    const adj = adjectives[Math.floor(rand() * adjectives.length)];
    const precio = Math.round((rand() * 500 + 1) * 100) / 100;
    const stock = Math.floor(rand() * 120);
    const daysAgo = Math.floor(rand() * 45);

    items.push({
      id: `ITM-${pad2(Math.floor(i / 100))}${pad2(i % 100)}`,
      nombre: `${noun} ${adj}`,
      categoría: cat,
      precio,
      stock,
      actualizado_en: isoDaysAgo(daysAgo),
    });
  }
  return items;
}

export const MOCK_ITEMS: InventoryItem[] = createMockItems(60);

