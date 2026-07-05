import CartItemsList from "../../../components/sales/CartItemsList";
import {
  SaleCheckoutActionBar,
  SaleCheckoutContent,
} from "../../../components/sales/SaleCheckoutForm";
import CartProductsSummary from "./CartProductsSummary";

export default function SalesDesktopCartPanel({
  cartItems,
  cartSummary,
  total,
  cartDetailsOpen,
  toggleCartDetails,
  saveSale,
  requestClearCart,
  savingSale,
  openEditKg,
  remove,
  setQty,
  paymentDrafts,
  paymentOrder,
  obs,
  paymentDifference,
  togglePaymentMethod,
  setPaymentAmount,
  setObs,
  msg,
}) {
  return (
    <aside className="sticky top-6 hidden self-start card border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50 md:block">
      <div className="mb-3 flex-shrink-0">
        <div>
          <div className="text-lg font-bold">Carrito</div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Resumen de cobro
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {cartItems.length ? "Ajustá cantidades y guardá." : "Agregá productos desde el catálogo."}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
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

        <div className="border-t border-slate-200 pt-4 flex-shrink-0 dark:border-slate-800">
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

      <div className="mt-4 border-t border-slate-200 pt-4 flex-shrink-0 dark:border-slate-800">
        <SaleCheckoutActionBar
          total={total}
          itemCount={cartItems.length}
          paymentDrafts={paymentDrafts}
          paymentMethodOrder={paymentOrder}
          saving={savingSale}
          msg={msg}
          paymentDifference={paymentDifference}
          onSave={saveSale}
        />
      </div>
    </aside>
  );
}
