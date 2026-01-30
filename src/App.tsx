import React from 'react';
import './App.css';
import { InventoryProvider, useInventory } from './state/InventoryProvider';
import { InventoryTable } from './components/InventoryTable';
import { InventoryToolbar } from './components/InventoryToolbar';
import { ItemDetailModal } from './components/ItemDetailModal';
import { StatePanel } from './components/StatePanel';
import { Toast } from './components/Toast';
import { InventoryItem, ItemCategory, SortDir, SortKey } from './types';
import { useDebouncedValue } from './utils/useDebouncedValue';

const LOW_STOCK_THRESHOLD = 10;

function uniqCategories(items: InventoryItem[]): ItemCategory[] {
  const set = new Set<ItemCategory>();
  for (const it of items) set.add(it.categoría);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function compare(a: InventoryItem, b: InventoryItem, key: SortKey) {
  switch (key) {
    case 'id':
      return a.id.localeCompare(b.id);
    case 'nombre':
      return a.nombre.localeCompare(b.nombre, 'es');
    case 'categoría':
      return a.categoría.localeCompare(b.categoría, 'es');
    case 'precio':
      return a.precio - b.precio;
    case 'stock':
      return a.stock - b.stock;
    case 'actualizado_en':
      return new Date(a.actualizado_en).getTime() - new Date(b.actualizado_en).getTime();
    default:
      return 0;
  }
}

function sortItems(items: InventoryItem[], key: SortKey, dir: SortDir) {
  const sign = dir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => sign * compare(a, b, key));
}

function InventoryPage() {
  const {
    items,
    loading,
    error,
    selectedId,
    forceErrorNextLoad,
    undoSnapshot,
    lastSaveMessage,
    load,
    reset,
    saveItem,
    undo,
    setSelectedId,
    setForceErrorNextLoad,
    clearSaveMessage,
  } = useInventory();

  const [searchInput, setSearchInput] = React.useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300).trim().toLowerCase();
  const [category, setCategory] = React.useState<ItemCategory | 'ALL'>('ALL');
  const [lowStockOnly, setLowStockOnly] = React.useState(false);
  const [sortKey, setSortKey] = React.useState<SortKey>('actualizado_en');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');

  const [returnFocusTo, setReturnFocusTo] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    void load();
  }, [load]);

  const categories = React.useMemo(() => uniqCategories(items), [items]);

  const filtered = React.useMemo(() => {
    let next = items;
    if (debouncedSearch) {
      next = next.filter((it) => it.nombre.toLowerCase().includes(debouncedSearch));
    }
    if (category !== 'ALL') {
      next = next.filter((it) => it.categoría === category);
    }
    if (lowStockOnly) {
      next = next.filter((it) => it.stock < LOW_STOCK_THRESHOLD);
    }
    return sortItems(next, sortKey, sortDir);
  }, [items, debouncedSearch, category, lowStockOnly, sortKey, sortDir]);

  const selectedItem = React.useMemo(
    () => (selectedId ? items.find((it) => it.id === selectedId) ?? null : null),
    [items, selectedId]
  );

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="title">Inventario (frontend + mock) Hecho por Cursor y Mau</h1>
          <div className="subtitle">
            Tabla con búsqueda, filtros, orden, detalle/edición, persistencia local.
          </div>
        </div>
      </header>

      <main className="main">
        <InventoryToolbar
          searchInput={searchInput}
          onChangeSearchInput={setSearchInput}
          category={category}
          categories={categories}
          onChangeCategory={setCategory}
          lowStockOnly={lowStockOnly}
          onChangeLowStockOnly={setLowStockOnly}
          lowStockThreshold={LOW_STOCK_THRESHOLD}
          forceErrorNextLoad={forceErrorNextLoad}
          onChangeForceErrorNextLoad={setForceErrorNextLoad}
          onReload={load}
          onReset={() => {
            reset();
            setSearchInput('');
            setCategory('ALL');
            setLowStockOnly(false);
          }}
          onUndo={undo}
          canUndo={Boolean(undoSnapshot)}
          loading={loading}
        />

        {loading ? (
          <StatePanel title="Cargando…" message="Simulando latencia (300–800ms)." />
        ) : error ? (
          <StatePanel title="Error" message={error} actionLabel="Reintentar" onAction={load} />
        ) : items.length === 0 ? (
          <StatePanel title="Sin datos" message="No hay ítems para mostrar." actionLabel="Cargar" onAction={load} />
        ) : filtered.length === 0 ? (
          <StatePanel
            title="Sin resultados"
            message="El filtro/búsqueda no encontró coincidencias."
          />
        ) : (
          <InventoryTable
            items={filtered}
            selectedId={selectedId}
            sortKey={sortKey}
            sortDir={sortDir}
            onChangeSort={(next) => {
              setSortKey(next.key);
              setSortDir(next.dir);
            }}
            onSelect={(id, opener) => {
              setReturnFocusTo(opener);
              setSelectedId(id);
            }}
            lowStockThreshold={LOW_STOCK_THRESHOLD}
          />
        )}
      </main>

      <Toast message={lastSaveMessage} onDismiss={clearSaveMessage} />

      {selectedItem ? (
        <ItemDetailModal
          item={selectedItem}
          returnFocusTo={returnFocusTo}
          onRequestClose={() => setSelectedId(null)}
          onSave={(next) => {
            saveItem({ id: selectedItem.id, ...next });
          }}
        />
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <InventoryPage />
    </InventoryProvider>
  );
}

