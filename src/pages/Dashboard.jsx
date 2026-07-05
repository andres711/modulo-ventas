import { useCallback, useEffect, useMemo, useState } from "react";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { PRODUCT_CATEGORIES } from "../entities/product/constants";
import { getSalesPage } from "../features/dashboard/api";
import { useToast } from "../hooks/useToast";
import { formatDateTimeAr, toYmd } from "../lib/date";
import { formatMoney } from "../lib/format";

const CATEGORIES = ["Todas", ...PRODUCT_CATEGORIES];
const PANEL_CLASS = "card border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40";
const CARD_CLASS = "card border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40";
const RECORD_ROW_CLASS = "rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-slate-950/30";

export default function Dashboard() {
  const initialDate = toYmd(new Date());
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState("HOY"); // HOY | AYER | 7D | MES | RANGO
  const [from, setFrom] = useState(initialDate);
  const [to, setTo] = useState(initialDate);

  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    count: 0,
    avgTicket: 0,
    byPayment: {},
    byCategory: {},
    topProducts: [],
  });
  const [cat, setCat] = useState("Todas");
  const PAGE_SIZE = 50;
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  function applyPreset(nextRange) {
    const now = new Date();
    if (nextRange === "HOY") {
      const d = toYmd(now);
      setFrom(d); setTo(d);
    }
    if (nextRange === "AYER") {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      const s = toYmd(d);
      setFrom(s); setTo(s);
    }
    if (nextRange === "7D") {
      const a = new Date(now);
      a.setDate(a.getDate() - 6);
      setFrom(toYmd(a)); setTo(toYmd(now));
    }
    if (nextRange === "MES") {
      const a = new Date(now.getFullYear(), now.getMonth(), 1);
      setFrom(toYmd(a)); setTo(toYmd(now));
    }
  }

  const refresh = useCallback(async ({ from, to, categoria } = {}) => {
    setLoading(true);
    try {
      const resp = await getSalesPage({
        from,
        to,
        categoria,
        size: PAGE_SIZE,
        cursor: 0,
      });

      setSales(resp.sales);
      setSummary(resp.summary);

      setCursor(resp.nextCursor ?? 0);
      setHasMore(resp.hasMore);
    } catch (e) {
      showToast({ ok: false, text: e.message });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    try {
      const resp = await getSalesPage({
        from,
        to,
        categoria: cat,
        size: PAGE_SIZE,
        cursor,
      });

      setSales((prev) => prev.concat(resp.sales));

      // summary viene calculado sobre TODO el filtrado: podés mantener el de la 1ra página.
      // Igual lo actualizo por si cambia:
      if (resp.summary) setSummary(resp.summary);

      setCursor(resp.nextCursor ?? cursor);
      setHasMore(resp.hasMore);
    } catch (e) {
      showToast({ ok: false, text: e.message });
    } finally {
      setLoadingMore(false);
    }
  }, [cat, cursor, from, hasMore, loading, loadingMore, showToast, to]);

  useEffect(() => {
    refresh({ from: initialDate, to: initialDate, categoria: "Todas" });
  }, [initialDate, refresh]);

  // Cuando cambias preset, actualiza fechas pero no refresca hasta que apretás "Aplicar" (más control).
  // Si querés auto-refresh, decime y lo dejo automático.

  const paymentRows = useMemo(() => {
    const obj = summary.byPayment || {};
    return Object.entries(obj).map(([k, v]) => ({ k, v }));
  }, [summary]);

  const catRows = useMemo(() => {
    const obj = summary.byCategory || {};
    return Object.entries(obj).map(([k, v]) => ({ k, v }));
  }, [summary]);

  return (
    <div className="grid gap-4">
      <section className={`${PANEL_CLASS} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-bold">Dashboard</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Resumen de ventas por período</div>
          </div>

          <button
            className="btn"
            onClick={() => refresh({ from, to, categoria: cat })}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <div className="mt-3 grid gap-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              ["HOY", "Hoy"],
              ["AYER", "Ayer"],
              ["7D", "7 días"],
              ["MES", "Mes"],
              ["RANGO", "Rango"],
            ].map(([k, label]) => (
              <button
                key={k}
                className={`btn ${range === k ? "btn-primary" : ""}`}
                onClick={() => {
                  setRange(k);
                  if (k !== "RANGO") applyPreset(k);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-4 gap-2 items-end">
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">Desde</label>
              <input
                type="date"
                className="input"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setRange("RANGO"); }}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600 dark:text-slate-400">Hasta</label>
              <input
                type="date"
                className="input"
                value={to}
                onChange={(e) => { setTo(e.target.value); setRange("RANGO"); }}
              />
            </div>

            <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">Categoría</label>
                <select
                    className="input"
                    value={cat}
                    onChange={(e) => {
                      const nextCat = e.target.value;
                      setCat(nextCat);
                      refresh({ from, to, categoria: nextCat });
                    }}
                >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
            <button
              className="btn btn-primary h-[44px]"
              onClick={() => refresh({ from, to, categoria: cat })}
              disabled={loading}
            >
              Aplicar
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="card p-6">
          <Spinner label="Cargando dashboard..." />
        </div>
      ) : (
        <>
          <section className="grid sm:grid-cols-3 gap-3">
            <div className={`${CARD_CLASS} p-4`}>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total vendido</div>
              <div className="text-2xl font-black">{formatMoney(summary.total)}</div>
            </div>
            <div className={`${CARD_CLASS} p-4`}>
              <div className="text-xs text-slate-500 dark:text-slate-400">Registros</div>
              <div className="text-2xl font-black">{summary.count || 0}</div>
            </div>
            <div className={`${CARD_CLASS} p-4`}>
              <div className="text-xs text-slate-500 dark:text-slate-400">Ticket promedio</div>
              <div className="text-2xl font-black">{formatMoney(summary.avgTicket)}</div>
            </div>
          </section>

          <section className="grid lg:grid-cols-3 gap-3">
            <div className={`${CARD_CLASS} p-4`}>
              <div className="font-bold mb-2">Por medio de pago</div>
              <div className="grid gap-2">
                {paymentRows.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">Sin datos</div>
                ) : paymentRows.map(r => (
                  <div key={r.k} className="flex items-center justify-between">
                    <span className="text-sm">{r.k}</span>
                    <span className="font-semibold">{formatMoney(r.v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${CARD_CLASS} p-4`}>
              <div className="font-bold mb-2">Por categoría</div>
              <div className="grid gap-2">
                {catRows.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">Sin datos</div>
                ) : catRows.map(r => (
                  <div key={r.k} className="flex items-center justify-between">
                    <span className="text-sm">{r.k}</span>
                    <span className="font-semibold">{formatMoney(r.v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${CARD_CLASS} p-4`}>
              <div className="font-bold mb-2">Top productos</div>
              <div className="grid gap-2">
                {(summary.topProducts || []).length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400">Sin datos</div>
                ) : (summary.topProducts || []).map((p) => (
                  <div key={p.name} className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate">{p.name}</span>
                    <span className="font-semibold shrink-0">{formatMoney(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={`${CARD_CLASS} p-4`}>
            <div className="font-bold mb-2">Últimos registros</div>

            {sales.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400">No hay ventas en el período.</div>
            ) : (
              <div className="grid gap-2">
                {sales.map((s) => (
                  <div key={s.id} className={RECORD_ROW_CLASS}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {s.productoNombre || s.productoId}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {String(formatDateTimeAr(s.fechaHora) || "")} • {s.medioPago || "-"} • {s.categoria || "-"}
                        </div>
                      </div>
                      <div className="font-bold shrink-0">{formatMoney(s.total)}</div>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Cantidad: <b>{s.cantidad}</b> {s.unidad ? String(s.unidad).toLowerCase() : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs text-slate-500 dark:text-slate-400">
                Mostrando {sales.length} de {summary.count || sales.length} registros
            </div>
            {hasMore && (
                <button
                className="btn w-full sm:w-auto"
                onClick={loadMore}
                disabled={loadingMore}
                >
                {loadingMore ? "Cargando..." : "Cargar más"}
                </button>
            )}
            </div>
        </>        
      )}

      <Toast show={toast.show} ok={toast.ok} text={toast.text} onClose={hideToast} />
    </div>
  );
}
