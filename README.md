# Inventario (React + TypeScript, solo frontend)

App de inventario en **React + TypeScript** con:

- **Tabla** (mock 60 ítems): `id`, `nombre`, `categoría`, `precio`, `stock`, `actualizado_en`
- **Estados**: loading simulado (300–800ms), empty (si filtros no encuentran), error simulado (≈7% aleatorio + toggle “forzar error”)
- **Búsqueda y filtros**: búsqueda por nombre con **debounce 300ms**, filtro por categoría, checkbox “stock bajo” (\(stock < 10\))
- **Orden**: por `precio` y `actualizado_en` (asc/desc) desde headers
- **Detalle y edición**: modal accesible (teclado + focus management) para editar `precio` y `stock`
- **Validaciones**: `precio ≥ 0`, `stock` entero `≥ 0`
- **Persistencia**: guarda cambios en estado local y persiste en `localStorage`
- **Reset**: restaura el mock original y **limpia `localStorage`**
- **Undo**: deshace el último cambio (snapshot simple)
- **UX mínima**: confirmación visual al guardar (toast)

## Cómo correr

```bash
npm install
npm start
```

Luego abre `http://localhost:3000`.

## Estructura de carpetas

- `src/data/mockItems.ts`: genera/contiene el mock de ítems
- `src/data/mockApi.ts`: “API” mock (Promise + `setTimeout`) con latencia y error simulado
- `src/state/InventoryProvider.tsx`: estado global (context + reducer), load/save/reset/undo
- `src/state/inventoryStorage.ts`: persistencia en `localStorage`
- `src/components/InventoryTable.tsx`: tabla + orden + selección
- `src/components/ItemDetailModal.tsx`: modal accesible + edición/validación
- `src/components/InventoryToolbar.tsx`: búsqueda/filtros/toggles/acciones
- `src/components/Toast.tsx`: confirmación visual
- `src/utils/useDebouncedValue.ts`: debounce (300ms)

## Decisiones técnicas y tradeoffs

- **CRA vs Vite**: se mantuvo Create React App para minimizar cambios de tooling en este repo, pero la app está en **TypeScript**.
- **Persistencia**: se persiste el array de ítems completo tras una **edición/undo**. Tradeoff: más simple que guardar “diffs”, pero ocupa más espacio.
- **Accesibilidad**:
  - Modal con `role="dialog"` + `aria-modal="true"`
  - **Escape** para cerrar, **Tab trap** básico, foco al primer input al abrir y retorno al elemento que abrió al cerrar
- **Loading/Error**: la carga siempre pasa por `mockApi.fetchInventoryItems()` para garantizar latencia y error simulados, aunque exista `localStorage`.
