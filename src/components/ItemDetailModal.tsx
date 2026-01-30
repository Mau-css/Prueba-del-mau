import React from 'react';
import { InventoryItem } from '../types';
import { formatCurrencyEUR, formatDateTime } from '../utils/format';

function getFocusable(container: HTMLElement) {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
    (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
  );
}

export function ItemDetailModal({
  item,
  onRequestClose,
  onSave,
  returnFocusTo,
}: {
  item: InventoryItem;
  onRequestClose: () => void;
  onSave: (next: { precio: number; stock: number }) => void;
  returnFocusTo: HTMLElement | null;
}) {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const firstInputRef = React.useRef<HTMLInputElement | null>(null);

  const [precio, setPrecio] = React.useState<string>(String(item.precio));
  const [stock, setStock] = React.useState<string>(String(item.stock));
  const [touched, setTouched] = React.useState<{ precio: boolean; stock: boolean }>({
    precio: false,
    stock: false,
  });

  const precioNum = Number(precio);
  const stockNum = Number(stock);

  const precioError =
    Number.isNaN(precioNum) || precio.trim() === '' ? 'Precio requerido.' : precioNum < 0 ? 'Precio debe ser ≥ 0.' : null;

  const stockError =
    stock.trim() === ''
      ? 'Stock requerido.'
      : Number.isNaN(stockNum)
        ? 'Stock inválido.'
        : !Number.isInteger(stockNum)
          ? 'Stock debe ser un entero.'
          : stockNum < 0
            ? 'Stock debe ser ≥ 0.'
            : null;

  const canSave = !precioError && !stockError;

  // Focus management (open -> first input, close -> return focus)
  React.useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      firstInputRef.current?.focus();
      firstInputRef.current?.select();
    });
    return () => {
      window.cancelAnimationFrame(id);
      returnFocusTo?.focus?.();
    };
  }, [returnFocusTo]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onRequestClose();
      return;
    }

    if (e.key === 'Tab') {
      const container = dialogRef.current;
      if (!container) return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    }
  };

  return (
    <div
      className="modalOverlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onRequestClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="itemDetailTitle"
        ref={dialogRef}
        onKeyDown={onKeyDown}
      >
        <div className="modalHeader">
          <h2 id="itemDetailTitle">Detalle y edición</h2>
          <button onClick={onRequestClose} aria-label="Cerrar detalle">
            ✕
          </button>
        </div>

        <div className="modalBody">
          <dl className="detailGrid">
            <div>
              <dt>ID</dt>
              <dd>{item.id}</dd>
            </div>
            <div>
              <dt>Nombre</dt>
              <dd>{item.nombre}</dd>
            </div>
            <div>
              <dt>Categoría</dt>
              <dd>{item.categoría}</dd>
            </div>
            <div>
              <dt>Actualizado</dt>
              <dd>{formatDateTime(item.actualizado_en)}</dd>
            </div>
            <div>
              <dt>Precio actual</dt>
              <dd>{formatCurrencyEUR(item.precio)}</dd>
            </div>
            <div>
              <dt>Stock actual</dt>
              <dd>{item.stock}</dd>
            </div>
          </dl>

          <form
            className="editForm"
            onSubmit={(e) => {
              e.preventDefault();
              setTouched({ precio: true, stock: true });
              if (!canSave) return;
              onSave({ precio: precioNum, stock: stockNum });
            }}
          >
            <div className="field">
              <label htmlFor="precioInput">Precio (≥ 0)</label>
              <input
                ref={firstInputRef}
                id="precioInput"
                inputMode="decimal"
                type="number"
                min={0}
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, precio: true }))}
                aria-invalid={Boolean(touched.precio && precioError)}
                aria-describedby={touched.precio && precioError ? 'precioError' : undefined}
              />
              {touched.precio && precioError ? (
                <div className="fieldError" id="precioError">
                  {precioError}
                </div>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="stockInput">Stock (entero ≥ 0)</label>
              <input
                id="stockInput"
                inputMode="numeric"
                type="number"
                min={0}
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, stock: true }))}
                aria-invalid={Boolean(touched.stock && stockError)}
                aria-describedby={touched.stock && stockError ? 'stockError' : undefined}
              />
              {touched.stock && stockError ? (
                <div className="fieldError" id="stockError">
                  {stockError}
                </div>
              ) : null}
            </div>

            <div className="modalFooter">
              <button type="button" className="secondary" onClick={onRequestClose}>
                Cancelar
              </button>
              <button type="submit" disabled={!canSave}>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

