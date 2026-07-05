import { useState } from "react";
import { isKgUnit } from "../../entities/product/model";
import { formatMoney } from "../../lib/format";

export default function CartItemsList({ items, onEditKg, onRemove, onSetQty }) {
  const [qtyDrafts, setQtyDrafts] = useState({});

  function handleQtyDraftChange(productId, value) {
    if (!/^\d*$/.test(value)) return;

    setQtyDrafts((prev) => ({
      ...prev,
      [productId]: value,
    }));
  }

  function commitQty(productId, fallbackQty) {
    const raw = String(qtyDrafts[productId] ?? fallbackQty ?? "").trim();

    if (!raw) {
      setQtyDrafts((prev) => ({
        ...prev,
        [productId]: undefined,
      }));
      return;
    }

    onSetQty(productId, raw);
    setQtyDrafts((prev) => ({
      ...prev,
      [productId]: undefined,
    }));
  }

  if (items.length === 0) {
    return (
      <div className="card border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40">
        <div className="font-semibold">Sin productos</div>
        <div className="text-sm text-slate-600 dark:text-slate-400">Tocá un producto para agregarlo.</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/95 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
        <span>Producto</span>
        <span>Total</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => {
          const { producto, cantidad } = item;
          const isKg = isKgUnit(producto.unidad);
          const subtotal = isKg
            ? Number(item.total || 0)
            : Number(producto.precio || 0) * Number(cantidad || 0);
          const qtyLabel = isKg
            ? `${Number(cantidad || 0).toFixed(3)} kg`
            : `${cantidad}`;

          return (
            <div key={producto.id} className="px-3 py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="break-words text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
                    {producto.nombre}
                  </div>

                  <div className="mt-1 break-words text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                    {formatMoney(producto.precio)}
                    {isKg ? " / kg" : ""}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {!isKg ? (
                      <input
                        className="input h-9 w-16 border-slate-200 bg-white/90 px-2 text-center text-sm font-semibold focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-slate-700"
                        value={qtyDrafts[producto.id] ?? String(cantidad ?? "")}
                        inputMode="numeric"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleQtyDraftChange(producto.id, e.target.value)}
                        onBlur={() => commitQty(producto.id, cantidad)}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          e.preventDefault();
                          commitQty(producto.id, cantidad);
                          e.currentTarget.blur();
                        }}
                        aria-label={`Cantidad de ${producto.nombre}`}
                      />
                    ) : (
                      <div className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-100/80 px-2.5 py-1 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                        {qtyLabel}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-[5.5rem] shrink-0 flex-col items-end gap-2 text-right">
                  <div className="flex items-center gap-1">
                    {isKg ? (
                      <button
                        type="button"
                        className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        onClick={() => onEditKg(item)}
                        aria-label={`Editar ${producto.nombre}`}
                        title="Editar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-3.5 w-3.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </button>
                    ) : null}

                    <button
                      className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      onClick={() => onRemove(producto.id)}
                      aria-label={`Quitar ${producto.nombre}`}
                      title="Quitar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-3.5 w-3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="whitespace-nowrap rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-sm font-black text-slate-950 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-950">
                    {formatMoney(subtotal)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
