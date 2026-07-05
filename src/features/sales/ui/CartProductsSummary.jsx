import { formatMoney, formatStock } from "../../../lib/format";

function CartIconButton({ disabled, onClick, label, tone = "default", children }) {
  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={[
          "grid h-9 w-9 place-items-center rounded-full border transition",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600"
            : tone === "danger"
              ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
        ].join(" ")}
      >
        {children}
      </button>

      {!disabled ? (
        <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-900 opacity-0 shadow-md transition group-hover:opacity-100 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-950">
          {label}
        </div>
      ) : null}
    </div>
  );
}

function CartClearButton({ disabled, onClick }) {
  return (
    <CartIconButton disabled={disabled} onClick={onClick} label="Vaciar" tone="danger">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
      </svg>
    </CartIconButton>
  );
}

export default function CartProductsSummary({
  itemCount,
  unitCount,
  kgCount,
  total,
  detailsOpen,
  onToggle,
  onClear,
  children,
}) {
  const hasItems = itemCount > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/85 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40">
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={!hasItems}
          className={[
            "flex min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition",
            hasItems
              ? "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900"
              : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-500",
          ].join(" ")}
        >
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Productos agregados
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="rounded-full bg-white px-2 py-1 dark:bg-slate-950/80">{itemCount} prod.</span>
              <span className="rounded-full bg-white px-2 py-1 dark:bg-slate-950/80">{unitCount} un.</span>
              <span className="rounded-full bg-white px-2 py-1 dark:bg-slate-950/80">{formatStock(kgCount, "KG")} kg</span>
              <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-slate-950 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-950">
                {formatMoney(total)}
              </span>
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {hasItems
                ? detailsOpen
                  ? "Ocultar detalle"
                  : "Ver detalle"
                : "Todavía no agregaste productos"}
            </div>
          </div>

          <span
            aria-hidden="true"
            className={[
              "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-200",
              detailsOpen ? "rotate-180" : "",
            ].join(" ")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>

        <div className="flex flex-col items-center gap-2 shrink-0">
          <CartClearButton disabled={!hasItems} onClick={onClear} />
        </div>
      </div>

      {hasItems && detailsOpen ? (
        <div className="border-t border-slate-100 px-3 pb-3 dark:border-slate-800">
          <div className="max-h-80 overflow-y-auto overscroll-contain pt-3 pr-1 md:max-h-[calc(100vh-27rem)]">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
