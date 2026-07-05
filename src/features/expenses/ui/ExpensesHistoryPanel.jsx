import { useCallback, useEffect, useMemo, useState } from "react";
import Spinner from "../../../components/Spinner";
import Toast from "../../../components/Toast";
import { getExpenses } from "../api";
import { EXPENSE_FILTER_CATEGORIES } from "../constants";
import { useToast } from "../../../hooks/useToast";
import { formatDateTimeAr, toYmd } from "../../../lib/date";
import { formatMoney } from "../../../lib/format";

const CARD_CLASS = "card border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40";
const RECORD_ROW_CLASS = "rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-slate-950/30";

export default function ExpensesHistoryPanel() {
  const initialDate = toYmd(new Date());
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(initialDate);
  const [to, setTo] = useState(initialDate);
  const [filterCat, setFilterCat] = useState("Todas");
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    count: 0,
    byCategory: {},
    byPayment: {},
  });

  const refresh = useCallback(async ({ from, to, categoria } = {}) => {
    setLoading(true);
    try {
      const resp = await getExpenses({ from, to, categoria });
      setExpenses(resp.expenses);
      setSummary(resp.summary);
    } catch (e) {
      showToast({ ok: false, text: e.message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refresh({ from: initialDate, to: initialDate, categoria: "Todas" });
  }, [initialDate, refresh]);

  const categoryRows = useMemo(() => {
    return Object.entries(summary.byCategory || {}).map(([k, v]) => ({ k, v }));
  }, [summary]);

  const paymentRows = useMemo(() => {
    return Object.entries(summary.byPayment || {}).map(([k, v]) => ({ k, v }));
  }, [summary]);

  return (
    <div className="grid gap-4">
      <section className={`${CARD_CLASS} p-4`}>
        <div className="font-bold mb-3">Filtros</div>

        <div className="grid sm:grid-cols-4 gap-2 items-end">
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Desde</label>
            <input
              type="date"
              className="input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Hasta</label>
            <input
              type="date"
              className="input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Categoría</label>
            <select
              className="input"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              {EXPENSE_FILTER_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary h-[44px]"
            onClick={() => refresh({ from, to, categoria: filterCat })}
            disabled={loading}
          >
            Aplicar
          </button>
        </div>
      </section>

      {loading ? (
        <div className="card p-6">
          <Spinner label="Cargando gastos..." />
        </div>
      ) : (
        <>
          <section className="grid sm:grid-cols-2 gap-3">
            <div className={`${CARD_CLASS} p-4`}>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total gastado</div>
              <div className="text-2xl font-black">{formatMoney(summary.total)}</div>
            </div>

            <div className={`${CARD_CLASS} p-4`}>
              <div className="text-xs text-slate-500 dark:text-slate-400">Registros</div>
              <div className="text-2xl font-black">{summary.count || 0}</div>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-3">
            <div className={`${CARD_CLASS} p-4`}>
              <div className="font-bold mb-2">Por categoría</div>
              <div className="grid gap-2">
                {categoryRows.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">Sin datos</div>
                ) : (
                  categoryRows.map((r) => (
                    <div key={r.k} className="flex items-center justify-between">
                      <span className="text-sm">{r.k}</span>
                      <span className="font-semibold">{formatMoney(r.v)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={`${CARD_CLASS} p-4`}>
              <div className="font-bold mb-2">Por medio de pago</div>
              <div className="grid gap-2">
                {paymentRows.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">Sin datos</div>
                ) : (
                  paymentRows.map((r) => (
                    <div key={r.k} className="flex items-center justify-between">
                      <span className="text-sm">{r.k}</span>
                      <span className="font-semibold">{formatMoney(r.v)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className={`${CARD_CLASS} p-4`}>
            <div className="font-bold mb-2">Últimos gastos</div>

            {expenses.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                No hay gastos en el período.
              </div>
            ) : (
              <div className="grid gap-2">
                {expenses.map((g) => (
                  <div key={g.id} className={RECORD_ROW_CLASS}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{g.descripcion}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDateTimeAr(g.fechaHora)} • {g.medioPago || "-"} • {g.categoria || "-"}
                        </div>
                        {g.observacion ? (
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {g.observacion}
                          </div>
                        ) : null}
                        {g.comprobanteUrl ? (
                          <a
                            href={g.comprobanteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-xs font-semibold text-slate-700 underline dark:text-slate-300"
                          >
                            Ver comprobante
                          </a>
                        ) : null}
                      </div>

                      <div className="font-bold shrink-0">{formatMoney(g.monto)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Toast show={toast.show} ok={toast.ok} text={toast.text} onClose={hideToast} />
    </div>
  );
}
