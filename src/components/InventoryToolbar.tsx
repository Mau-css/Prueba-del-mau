import React from 'react';
import { ItemCategory } from '../types';

export function InventoryToolbar({
  searchInput,
  onChangeSearchInput,
  category,
  categories,
  onChangeCategory,
  lowStockOnly,
  onChangeLowStockOnly,
  lowStockThreshold,
  forceErrorNextLoad,
  onChangeForceErrorNextLoad,
  onReload,
  onReset,
  onUndo,
  canUndo,
  loading,
}: {
  searchInput: string;
  onChangeSearchInput: (v: string) => void;
  category: ItemCategory | 'ALL';
  categories: ItemCategory[];
  onChangeCategory: (v: ItemCategory | 'ALL') => void;
  lowStockOnly: boolean;
  onChangeLowStockOnly: (v: boolean) => void;
  lowStockThreshold: number;
  forceErrorNextLoad: boolean;
  onChangeForceErrorNextLoad: (v: boolean) => void;
  onReload: () => void;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
  loading: boolean;
}) {
  return (
    <div className="toolbar" aria-label="Controles de búsqueda y filtros">
      <div className="toolbarRow">
        <div className="fieldInline">
          <label htmlFor="searchInput">Búsqueda</label>
          <input
            id="searchInput"
            type="search"
            placeholder="Buscar por nombre…"
            value={searchInput}
            onChange={(e) => onChangeSearchInput(e.target.value)}
          />
        </div>

        <div className="fieldInline">
          <label htmlFor="categorySelect">Categoría</label>
          <select
            id="categorySelect"
            value={category}
            onChange={(e) => onChangeCategory(e.target.value as ItemCategory | 'ALL')}
          >
            <option value="ALL">Todas</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="fieldInline">
          <input
            id="lowStockOnly"
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => onChangeLowStockOnly(e.target.checked)}
          />
          <label htmlFor="lowStockOnly">Stock bajo (&lt; {lowStockThreshold})</label>
        </div>
      </div>

      <div className="toolbarRow toolbarRowRight">
        <div className="fieldInline">
          <input
            id="forceError"
            type="checkbox"
            checked={forceErrorNextLoad}
            onChange={(e) => onChangeForceErrorNextLoad(e.target.checked)}
          />
          <label htmlFor="forceError">Forzar error próxima carga</label>
        </div>

        <button onClick={onReload} disabled={loading}>
          {loading ? 'Cargando…' : 'Recargar'}
        </button>
        <button className="secondary" onClick={onUndo} disabled={!canUndo}>
          Deshacer
        </button>
        <button className="danger" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}

