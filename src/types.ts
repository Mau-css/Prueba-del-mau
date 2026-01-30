export type ItemCategory = 'Electrónica' | 'Hogar' | 'Ropa' | 'Deportes' | 'Libros';

export type SortKey = 'id' | 'nombre' | 'categoría' | 'precio' | 'stock' | 'actualizado_en';
export type SortDir = 'asc' | 'desc';

export type InventoryItem = {
  id: string;
  nombre: string;
  categoría: ItemCategory;
  precio: number;
  stock: number;
  actualizado_en: string; // ISO string
};

