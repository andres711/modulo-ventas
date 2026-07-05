import Drawer from "../../../components/Drawer";
import { formatMoney, formatStock } from "../../../lib/format";

export default function ClearCartConfirmDrawer({
  open,
  onClose,
  onConfirm,
  cartItemsCount,
  cartSummary,
  total,
}) {
  return (
    <Drawer
      open={open}
      title="Vaciar carrito"
      onClose={onClose}
      cardClassName="border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50"
      headerClassName="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      bodyClassName="bg-transparent"
      footerClassName="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn border-slate-300 bg-slate-100 text-slate-950 hover:bg-slate-200 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
            onClick={onConfirm}
          >
            Vaciar
          </button>
        </div>
      }
    >
      <div className="grid gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:shadow-slate-950/40">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Se van a quitar {cartItemsCount} {cartItemsCount === 1 ? "producto" : "productos"}.
          </div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            El carrito volverá a quedar vacío.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:shadow-slate-950/40">
          <div className="flex items-center justify-between gap-2">
            <span>Unidades</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{cartSummary.unitCount}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span>Kilos</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{formatStock(cartSummary.kgCount, "KG")} kg</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Total</span>
            <span className="font-black text-slate-900 dark:text-slate-100">{formatMoney(total)}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
