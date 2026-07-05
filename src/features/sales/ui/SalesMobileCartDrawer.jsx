import Drawer from "../../../components/Drawer";
import CartItemsList from "../../../components/sales/CartItemsList";
import {
  SaleCheckoutActionBar,
  SaleCheckoutContent,
} from "../../../components/sales/SaleCheckoutForm";
import { formatMoney } from "../../../lib/format";
import CartProductsSummary from "./CartProductsSummary";

export default function SalesMobileCartDrawer({
  cartOpen,
  closeCart,
  total,
  cartItems,
  paymentDrafts,
  paymentOrder,
  savingSale,
  msg,
  paymentDifference,
  saveSaleAndCloseCart,
  paymentBreakdown,
  cartSummary,
  cartDetailsOpen,
  toggleCartDetails,
  requestClearCart,
  openEditKg,
  remove,
  setQty,
  obs,
  togglePaymentMethod,
  setPaymentAmount,
  setObs,
}) {
  return (
    <Drawer
      open={cartOpen}
      title="Carrito"
      onClose={closeCart}
      footer={
        <SaleCheckoutActionBar
          total={total}
          itemCount={cartItems.length}
          paymentDrafts={paymentDrafts}
          paymentMethodOrder={paymentOrder}
          saving={savingSale}
          msg={msg}
          paymentDifference={paymentDifference}
          onSave={saveSaleAndCloseCart}
        />
      }
    >
      <div className="grid gap-3 md:hidden">
        <div className="rounded-2xl border border-slate-200 bg-white/85 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Resumen rápido
          </div>
          <div className="grid gap-1 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-between gap-2">
              <span>Items</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{cartItems.length}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Medio de pago</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {paymentBreakdown.length > 1
                  ? paymentBreakdown.map((payment) => payment.method).join(" + ")
                  : paymentBreakdown[0]?.method || "Sin pago"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Total</span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">{formatMoney(total)}</span>
            </div>
          </div>
        </div>

        <CartProductsSummary
          itemCount={cartItems.length}
          unitCount={cartSummary.unitCount}
          kgCount={cartSummary.kgCount}
          total={total}
          detailsOpen={cartDetailsOpen}
          onToggle={toggleCartDetails}
          onClear={requestClearCart}
        >
          <CartItemsList
            items={cartItems}
            onEditKg={openEditKg}
            onRemove={remove}
            onSetQty={setQty}
          />
        </CartProductsSummary>

        <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
          <SaleCheckoutContent
            itemCount={cartItems.length}
            paymentDrafts={paymentDrafts}
            paymentMethodOrder={paymentOrder}
            obs={obs}
            paymentDifference={paymentDifference}
            onTogglePaymentMethod={togglePaymentMethod}
            onPaymentAmountChange={setPaymentAmount}
            onObsChange={setObs}
          />
        </div>
      </div>
    </Drawer>
  );
}
