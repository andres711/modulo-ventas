import { formatMoney } from "../../lib/format";
import { PAYMENT_METHODS } from "../../entities/payment/constants";

const QUICK_MODE_DEFAULT_PAYMENT_METHOD = PAYMENT_METHODS[2];

function QuickModeIconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      title={title}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-300 bg-slate-100 text-slate-950 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

function getCheckoutPaymentState(paymentDrafts, paymentMethodOrder) {
  const activePaymentMethods = paymentMethodOrder.filter(
    (method) => paymentDrafts[method] !== null
  );
  const inactivePaymentMethods = PAYMENT_METHODS.filter(
    (method) => !activePaymentMethods.includes(method)
  );
  const autoMethod = activePaymentMethods.length > 1
    ? activePaymentMethods[activePaymentMethods.length - 1]
    : activePaymentMethods[0] || null;

  return {
    activePaymentMethods,
    inactivePaymentMethods,
    autoMethod,
  };
}

function getPaymentDifferenceCopy(paymentDifference) {
  if (Math.abs(paymentDifference) < 0.009) {
    return "La suma de medios coincide con el total.";
  }

  return paymentDifference > 0
    ? `Faltan asignar ${formatMoney(paymentDifference)}`
    : `Los medios superan el total por ${formatMoney(Math.abs(paymentDifference))}`;
}

export function SaleCheckoutContent({
  itemCount,
  paymentDrafts,
  paymentMethodOrder,
  obs,
  onTogglePaymentMethod,
  onPaymentAmountChange,
  onObsChange,
  quickMode = false,
  quickModeExpanded = false,
  onToggleQuickModeExpanded,
  showSummary = false,
}) {
  const { activePaymentMethods, inactivePaymentMethods, autoMethod } = getCheckoutPaymentState(
    paymentDrafts,
    paymentMethodOrder
  );
  const hasObservation = obs.trim().length > 0;
  const canCollapseQuickMode = quickMode && activePaymentMethods.length <= 1;

  if (canCollapseQuickMode && !quickModeExpanded) {
    const selectedMethod = activePaymentMethods[0] || (itemCount > 0 ? QUICK_MODE_DEFAULT_PAYMENT_METHOD : "Sin pago");

    return (
      <div className="grid gap-2">
        {showSummary ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
              <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-950">
                {selectedMethod}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {itemCount > 0 ? "Caja rapida lista para cobrar." : "Agrega productos para usar el cobro rapido."}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white/85 px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 grid gap-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Cobro rapido
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-950">
                  {selectedMethod}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {hasObservation ? "Observacion cargada" : "Sin observacion"}
                </span>
              </div>
            </div>

            <QuickModeIconButton title="Configurar cobro" onClick={onToggleQuickModeExpanded}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 21v-7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 10V3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 8h4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12h4" />
              </svg>
            </QuickModeIconButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {quickMode ? (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:shadow-slate-950/40">
          <span>Caja rapida en detalle.</span>
          {canCollapseQuickMode ? (
            <QuickModeIconButton title="Ocultar cobro" onClick={onToggleQuickModeExpanded}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m18 15-6-6-6 6" />
              </svg>
            </QuickModeIconButton>
          ) : null}
        </div>
      ) : null}

      {showSummary ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
            <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-950">
              {activePaymentMethods.length > 1
                ? `${activePaymentMethods.length} medios`
                : activePaymentMethods[0] || "Sin pago"}
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Configurá el cobro antes de guardar.
          </div>
        </div>
      ) : null}

      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        Medios de pago
      </label>
      {activePaymentMethods.length === 0 ? (
        <div className="grid grid-cols-3 gap-1.5">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => onTogglePaymentMethod(method)}
               className="rounded-xl border border-slate-200 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {method}
            </button>
          ))}
        </div>
      ) : null}

      {activePaymentMethods.length > 0 ? (
        <div className="grid gap-1.5 rounded-2xl border border-slate-200 bg-white/80 p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40">
          {activePaymentMethods.map((method) => (
            <div key={method} className="grid grid-cols-[auto_1fr] items-center gap-2">
              <button
                type="button"
                onClick={() => onTogglePaymentMethod(method)}
                className="rounded-xl border border-slate-300 bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-200 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {method}
              </button>

              <div className="grid gap-1">
                <div className="flex items-center justify-between gap-2 px-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Monto
                  </span>
                  {method === autoMethod ? (
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      {activePaymentMethods.length > 1 ? "Restante" : "Total"}
                    </span>
                  ) : null}
                </div>

                <input
                  className="input h-9 border-slate-200 bg-white/90 px-2.5 text-sm focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-slate-700"
                  inputMode="decimal"
                  value={paymentDrafts[method] ?? ""}
                  onChange={(e) => onPaymentAmountChange(method, e.target.value)}
                  placeholder="Monto"
                  readOnly={method === autoMethod}
                />
              </div>
            </div>
          ))}

          {inactivePaymentMethods.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Agregar
              </span>
              {inactivePaymentMethods.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => onTogglePaymentMethod(method)}
                  className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {method}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400">
          Elegí al menos un medio de pago.
        </div>
      )}

      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        Observación
      </label>
      <input
        className="input h-9 border-slate-200 bg-white/90 px-2.5 text-sm focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-slate-700"
        value={obs}
        onChange={(e) => onObsChange(e.target.value)}
        placeholder="Ej: promo, descuento..."
      />
    </div>
  );
}

export function SaleCheckoutActionBar({
  total,
  itemCount,
  paymentDrafts,
  paymentMethodOrder,
  saving,
  msg,
  paymentDifference,
  onSave,
}) {
  const { activePaymentMethods } = getCheckoutPaymentState(paymentDrafts, paymentMethodOrder);
  let statusText = getPaymentDifferenceCopy(paymentDifference);
  let statusClassName = Math.abs(paymentDifference) < 0.009
    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  if (itemCount === 0) {
    statusText = "";
    statusClassName = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  } else if (activePaymentMethods.length === 0) {
    statusText = "Elegí un medio de pago.";
    statusClassName = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }

  if (msg.text && !msg.ok) {
    statusText = msg.text;
    statusClassName = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }

  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/40">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-950 dark:border-slate-600 dark:bg-slate-100 dark:text-slate-950">
            {activePaymentMethods.length > 1
              ? `${activePaymentMethods.length} medios`
              : activePaymentMethods[0] || "Sin pago"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Total a cobrar
            </div>
            <div className="text-2xl font-black text-slate-950 dark:text-slate-100">{formatMoney(total)}</div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className={`btn w-full border-slate-300 bg-slate-100 py-3 text-slate-950 hover:bg-slate-200 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 sm:min-w-[12rem] ${saving ? "opacity-70" : ""}`}
          >
            {saving ? "Guardando..." : "Confirmar venta"}
          </button>
        </div>
      </div>

      {statusText ? (
        <div className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold ${statusClassName}`}>
          {statusText}
        </div>
      ) : null}
    </div>
  );
}

export default function SaleCheckoutForm(props) {
  return (
    <div className="grid gap-3">
      <SaleCheckoutContent {...props} showSummary />
      <SaleCheckoutActionBar {...props} />
    </div>
  );
}
