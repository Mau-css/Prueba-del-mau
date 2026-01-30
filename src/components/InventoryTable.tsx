import React from 'react';
import { InventoryItem, SortDir, SortKey } from '../types';
import { formatCurrencyEUR, formatDateTime } from '../utils/format';

function sortLabel(key: SortKey) {
  switch (key) {
    case 'id':
      return 'ID';
    case 'nombre':
      return 'Nombre';
    case 'categoría':
      return 'Categoría';
    case 'precio':
      return 'Precio';
    case 'stock':
      return 'Stock';
    case 'actualizado_en':
      return 'Actualizado';
    default:
      return 'Ordenar';
  }
}

function nextSortDir(currentKey: SortKey, currentDir: SortDir, clicked: SortKey): SortDir {
  if (currentKey !== clicked) return 'asc';
  return currentDir === 'asc' ? 'desc' : 'asc';
}

export function InventoryTable({
  items,
  selectedId,
  sortKey,
  sortDir,
  onChangeSort,
  onSelect,
  lowStockThreshold,
}: {
  items: InventoryItem[];
  selectedId: string | null;
  sortKey: SortKey;
  sortDir: SortDir;
  onChangeSort: (next: { key: SortKey; dir: SortDir }) => void;
  onSelect: (id: string, returnFocusTo: HTMLElement | null) => void;
  lowStockThreshold: number;
}) {
  const renderSortButton = (key: SortKey) => {
    const isActive = sortKey === key;
    const ariaSort: React.AriaAttributes['aria-sort'] = isActive
      ? sortDir === 'asc'
        ? 'ascending'
        : 'descending'
      : 'none';

    const indicator = !isActive ? '' : sortDir === 'asc' ? ' ▲' : ' ▼';
    const label = `${sortLabel(key)}${indicator}`;

    return (
      <th scope="col" aria-sort={ariaSort}>
        <button
          className="sortButton"
          onClick={() => onChangeSort({ key, dir: nextSortDir(sortKey, sortDir, key) })}
        >
          {label}
        </button>
      </th>
    );
  };

  return (
    <div className="tableWrap">
      <table className="table" aria-label="Tabla de inventario">
        <thead>
          <tr>
            {renderSortButton('id')}
            {renderSortButton('nombre')}
            {renderSortButton('categoría')}
            {renderSortButton('precio')}
            {renderSortButton('stock')}
            {renderSortButton('actualizado_en')}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const isSelected = selectedId === it.id;
            const low = it.stock < lowStockThreshold;
            return (
              <tr
                key={it.id}
                tabIndex={0}
                className={isSelected ? 'row selected' : 'row'}
                aria-selected={isSelected}
                onClick={(e) => onSelect(it.id, e.currentTarget as HTMLElement)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(it.id, e.currentTarget as HTMLElement);
                  }
                }}
              >
                <td className="mono">{it.id}</td>
                <td>{it.nombre}</td>
                <td>{it.categoría}</td>
                <td>{formatCurrencyEUR(it.precio)}</td>
                <td>
                  <span className={low ? 'pill low' : 'pill'} aria-label={low ? 'Stock bajo' : 'Stock'}>
                    {it.stock}
                  </span>
                </td>
                <td className="mono">{formatDateTime(it.actualizado_en)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

