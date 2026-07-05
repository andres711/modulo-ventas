import Drawer from "../../../components/Drawer";
import { formatMoney, formatStock } from "../../../lib/format";

export default function KgSaleDrawer({
  open,
  kgProduct,
  closeKgModal,
  confirmKgSale,
  kgMode,
  kgTotal,
  setKgTotal,
  estimatedKg,
}) {
  return (
    <Drawer
      open={open}
      title={kgProduct ? `Venta por kg: ${kgProduct.nombre}` : "Venta por kg"}
      onClose={closeKgModal}
      cardClassName="border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50"
      headerClassName="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      bodyClassName="bg-transparent"
      footerClassName="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      footer={
        <button
          className="btn w-full border-slate-300 bg-slate-100 py-3 text-slate-950 hover:bg-slate-200 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          onClick={confirmKgSale}
        >
          {kgMode === "EDIT" ? "Guardar cambios" : "Agregar"}
        </button>
      }
    >
      {kgProduct ? (
        <div className="grid gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Carga manual
            </div>
            <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Precio por kg: <b>{formatMoney(kgProduct.precio)}</b> • Stock: <b>{formatStock(kgProduct.stock, "KG")} kg</b>
            </div>
          </div>

          <label className="text-sm text-slate-600 dark:text-slate-400">Importe cobrado</label>
          <input
            className="input border-slate-200 bg-white/90 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-slate-700"
            autoFocus
            inputMode="numeric"
            placeholder="Ej: 3580"
            value={kgTotal}
            onChange={(e) => setKgTotal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              confirmKgSale();
            }}
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:shadow-slate-950/40">
            Kg estimados: <b className="text-base">{estimatedKg}</b>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}
