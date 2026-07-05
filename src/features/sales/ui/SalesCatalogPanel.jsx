import Spinner from "../../../components/Spinner";
import { PRODUCT_CATEGORIES } from "../../../entities/product/constants";
import { isKgUnit } from "../../../entities/product/model";
import { formatMoney, formatStock, getNameInitials } from "../../../lib/format";

const CATEGORY_BUTTON_THEME = Object.fromEntries(
  PRODUCT_CATEGORIES.map((category) => [
    category,
    {
      active:
        "border-slate-300 bg-slate-100 text-slate-950 hover:bg-slate-200 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200",
      subtle: "text-slate-500 dark:text-slate-400",
    },
  ])
);

export default function SalesCatalogPanel({
  onKeyDownCapture,
  activeCat,
  cartItemsCount,
  onOpenCart,
  refresh,
  loadingProducts,
  search,
  searchInputRef,
  onSearchChange,
  onSearchKeyDown,
  isGlobalSearch,
  onSelectCategory,
  filtered,
  productButtonRefs,
  addToCart,
  onProductKeyDown,
}) {
  const activeCategoryTheme = CATEGORY_BUTTON_THEME[activeCat] || CATEGORY_BUTTON_THEME.Polleria;

  return (
    <section
      className="card border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50"
      onKeyDownCapture={onKeyDownCapture}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-lg font-bold">Nueva venta</div>
          <div className={`text-xs font-medium uppercase tracking-[0.18em] ${activeCategoryTheme.subtle}`}>
            Catálogo rápido
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onOpenCart}
            className="relative btn btn-primary px-3 md:hidden"
            aria-label="Abrir carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-9v9"
              />
            </svg>

            {cartItemsCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-1 text-xs font-bold text-slate-950 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-950">
                {cartItemsCount}
              </span>
            ) : null}
          </button>

          <button className="btn" onClick={refresh} disabled={loadingProducts}>
            {loadingProducts ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="input border-slate-200 bg-white/90 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-slate-700"
          autoFocus
          ref={searchInputRef}
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={onSearchKeyDown}
        />
      </div>

      {isGlobalSearch ? (
        <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          Búsqueda global activa. Se están mostrando resultados de todas las categorías.
        </div>
      ) : null}

      <div className={`flex flex-wrap gap-2 py-3 transition ${isGlobalSearch ? "opacity-60" : "opacity-100"}`}>
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={[
              "btn",
              category === activeCat
                ? CATEGORY_BUTTON_THEME[category]?.active || CATEGORY_BUTTON_THEME.Polleria.active
                : "border-slate-200 bg-white/85 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800",
            ].join(" ")}
            aria-pressed={category === activeCat}
            title={isGlobalSearch ? "La búsqueda actual recorre todas las categorías" : undefined}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-3 xl:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
        {loadingProducts ? (
          <div className="col-span-full">
            <Spinner label="Cargando..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card col-span-full border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="font-semibold">No hay productos</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Cargalos en la pestaña “Productos”.
            </div>
          </div>
        ) : (
          filtered.map((product) => {
            const isKg = isKgUnit(product.unidad);
            const hasStock = product.stock > 0;

            return (
              <button
                key={product.id}
                data-catalog-product="true"
                ref={(node) => {
                  if (node) {
                    productButtonRefs.current.set(product.id, node);
                    return;
                  }

                  productButtonRefs.current.delete(product.id);
                }}
                onClick={() => addToCart(product)}
                onKeyDown={(e) => onProductKeyDown(e, product.id)}
                className={[
                  "group card overflow-hidden border-2 bg-white text-left shadow-sm transition duration-150 active:scale-[0.99] focus:outline-none focus-visible:-translate-y-1 focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 dark:focus-visible:border-slate-100 dark:focus-visible:ring-slate-800 dark:hover:shadow-slate-950/50",
                  hasStock
                    ? "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                    : "border-slate-200 opacity-70 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700",
                ].join(" ")}
              >
                <div className="relative overflow-hidden">
                  {product.imagenUrl ? (
                    <img
                      src={product.imagenUrl}
                      alt={product.nombre}
                      className={[
                        "h-28 w-full object-cover bg-slate-100 transition duration-200 group-hover:scale-[1.03] dark:bg-slate-800",
                        hasStock ? "" : "grayscale-[0.45]",
                      ].join(" ")}
                    />
                  ) : (
                    <div className="flex h-28 w-full items-center justify-center bg-slate-100 text-2xl font-black tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {getNameInitials(product.nombre)}
                    </div>
                  )}

                  <span className="absolute right-2 top-2 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100">
                    {isKg ? "KG" : "UN"}
                  </span>
                </div>

                <div className="grid gap-2 p-3">
                  <div className="min-h-[2.5rem] line-clamp-2 font-semibold leading-tight text-slate-900 dark:text-slate-100">
                    {product.nombre}
                  </div>
                  {search.trim() ? (
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {product.categoria}
                    </div>
                  ) : null}
                  <div className="text-base font-black text-slate-900 dark:text-slate-100">
                    {formatMoney(product.precio)}
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span
                      className={`badge min-w-0 font-semibold ${
                        hasStock
                          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
                      }`}
                    >
                      {hasStock ? `Stock ${formatStock(product.stock, product.unidad)}` : "Sin stock"}
                      {isKg ? " kg" : ""}
                    </span>
                    <span
                      aria-hidden="true"
                      className={[
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full transition",
                        hasStock
                          ? "bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-100 dark:group-hover:text-slate-950"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                      ].join(" ")}
                    >
                      {hasStock ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          className="h-4 w-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          className="h-4 w-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
