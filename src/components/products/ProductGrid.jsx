import Spinner from "../Spinner";
import { isKgUnit } from "../../entities/product/model";
import { formatMoney, formatStock, getNameInitials } from "../../lib/format";

export default function ProductGrid({
  loading,
  products,
  onEdit,
  productButtonRefs,
  onProductKeyDown,
  showCategory = false,
}) {
  if (loading) {
    return <Spinner label="Cargando productos..." />;
  }

  if (products.length === 0) {
    return (
      <div className="card border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="font-semibold">No hay productos</div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Probá otra categoría o creá uno con "+".
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-3 xl:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
      {products.map((product) => {
        const isKg = isKgUnit(product.unidad);
        const hasStock = Number(product.stock || 0) > 0;
        const isActive = product.activo !== false;

        return (
          <button
            key={product.id}
            data-catalog-product="true"
            ref={(node) => {
              if (!productButtonRefs) return;

              if (node) {
                productButtonRefs.current.set(product.id, node);
                return;
              }

              productButtonRefs.current.delete(product.id);
            }}
            onClick={() => onEdit(product)}
            onKeyDown={onProductKeyDown ? (e) => onProductKeyDown(e, product.id) : undefined}
            className={[
              "group card overflow-hidden border-2 bg-white text-left shadow-sm transition duration-150 active:scale-[0.99] focus:outline-none focus-visible:-translate-y-1 focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 dark:hover:shadow-slate-950/50 dark:focus-visible:border-slate-100 dark:focus-visible:ring-slate-800",
              hasStock && isActive
                ? "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                : "border-slate-200 opacity-80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
            ].join(" ")}
          >
            <div className="relative overflow-hidden">
              {product.imagenUrl ? (
                <img
                  src={product.imagenUrl}
                  alt={product.nombre}
                  className={[
                    "h-28 w-full object-cover bg-slate-100 transition duration-200 group-hover:scale-[1.03] dark:bg-slate-800",
                    hasStock && isActive ? "" : "grayscale-[0.35]",
                  ].join(" ")}
                />
              ) : (
                <div className="flex h-28 w-full items-center justify-center bg-slate-100 text-2xl font-black tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {getNameInitials(product.nombre)}
                </div>
              )}

              {!isActive ? (
                <span className="absolute left-2 top-2 rounded-full bg-slate-900/85 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm dark:bg-slate-100 dark:text-slate-950">
                  Inactivo
                </span>
              ) : null}

              <span className="absolute right-2 top-2 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100">
                {isKg ? "KG" : "UN"}
              </span>
            </div>

            <div className="grid gap-2 p-3">
              <div className="min-h-[2.5rem] line-clamp-2 font-semibold leading-tight text-slate-900 dark:text-slate-100">
                {product.nombre}
              </div>
              {showCategory ? (
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {product.categoria}
                </div>
              ) : null}
              <div className="text-base font-black text-slate-900 dark:text-slate-100">
                {formatMoney(product.precio)} {isKg ? "/ kg" : ""}
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span
                  className={[
                    "badge min-w-0 font-semibold",
                    !isActive
                      ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      : hasStock
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        : "bg-slate-200 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300",
                  ].join(" ")}
                >
                  {!isActive
                    ? "Inactivo"
                    : hasStock
                      ? `Stock ${formatStock(product.stock, product.unidad)}${isKg ? " kg" : ""}`
                      : "Sin stock"}
                </span>
                <span
                  aria-hidden="true"
                  className={[
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full transition",
                    hasStock || !isActive
                      ? "bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-100 dark:group-hover:text-slate-950"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                  </svg>
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">ID: {product.id}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
