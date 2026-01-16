import { useEffect, useMemo, useState } from "react";
import Spinner from "../components/Spinner";
import { getSales } from "../api";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";

const CATEGORIES = ["Todas", "Polleria", "Congelados", "Almacen", "Bebidas"];

const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

function ymd(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Dashboard() {
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState("HOY"); // HOY | AYER | 7D | MES | RANGO
  const [from, setFrom] = useState(ymd(new Date()));
  const [to, setTo] = useState(ymd(new Date()));

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


  function applyPreset(nextRange) {
    const now = new Date();
    if (nextRange === "HOY") {
      const d = ymd(now);
      setFrom(d); setTo(d);
    }
    if (nextRange === "AYER") {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      const s = ymd(d);
      setFrom(s); setTo(s);
    }
    if (nextRange === "7D") {
      const a = new Date(now);
      a.setDate(a.getDate() - 6);
      setFrom(ymd(a)); setTo(ymd(now));
    }
    if (nextRange === "MES") {
      const a = new Date(now.getFullYear(), now.getMonth(), 1);
      setFrom(ymd(a)); setTo(ymd(now));
    }
  }

  async function refresh(pFrom, pTo) {
    setLoading(true);
    try {
      const { sales, summary } = await getSales({
        from: pFrom,
        to: pTo,
        categoria: cat
        });
      setSales(sales);
      setSummary(summary);
    } catch (e) {
      showToast({ ok: false, text: e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // al entrar: hoy
    refresh(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function fmtFechaHoraAR(s) {
    // Espera "yyyy-MM-dd HH:mm:ss"
    if (!s) return "";
    const [d, t] = String(s).split(" ");
    if (!d || !t) return String(s);
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y} ${t}`;
 }


  return (
    <div className="grid gap-4">
      <section className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-bold">Dashboard</div>
            <div className="text-xs text-slate-500">Resumen de ventas por período</div>
          </div>

          <button
            className="btn"
            onClick={() => refresh(from, to)}
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
              <label className="text-sm text-slate-600">Desde</label>
              <input
                type="date"
                className="input"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setRange("RANGO"); }}
              />
            </div>
            <div>
              <label className="text-sm text-slate-600">Hasta</label>
              <input
                type="date"
                className="input"
                value={to}
                onChange={(e) => { setTo(e.target.value); setRange("RANGO"); }}
              />
            </div>

            <div>
                <label className="text-sm text-slate-600">Categoría</label>
                <select
                    className="input"
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>
            <button
              className="btn btn-primary h-[44px]"
              onClick={() => refresh(from, to)}
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
            <div className="card p-4">
              <div className="text-xs text-slate-500">Total vendido</div>
              <div className="text-2xl font-black">{money(summary.total)}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-slate-500">Registros</div>
              <div className="text-2xl font-black">{summary.count || 0}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-slate-500">Ticket promedio</div>
              <div className="text-2xl font-black">{money(summary.avgTicket)}</div>
            </div>
          </section>

          <section className="grid lg:grid-cols-3 gap-3">
            <div className="card p-4">
              <div className="font-bold mb-2">Por medio de pago</div>
              <div className="grid gap-2">
                {paymentRows.length === 0 ? (
                  <div className="text-sm text-slate-500">Sin datos</div>
                ) : paymentRows.map(r => (
                  <div key={r.k} className="flex items-center justify-between">
                    <span className="text-sm">{r.k}</span>
                    <span className="font-semibold">{money(r.v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <div className="font-bold mb-2">Por categoría</div>
              <div className="grid gap-2">
                {catRows.length === 0 ? (
                  <div className="text-sm text-slate-500">Sin datos</div>
                ) : catRows.map(r => (
                  <div key={r.k} className="flex items-center justify-between">
                    <span className="text-sm">{r.k}</span>
                    <span className="font-semibold">{money(r.v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <div className="font-bold mb-2">Top productos</div>
              <div className="grid gap-2">
                {(summary.topProducts || []).length === 0 ? (
                  <div className="text-sm text-slate-500">Sin datos</div>
                ) : (summary.topProducts || []).map((p) => (
                  <div key={p.name} className="flex items-center justify-between gap-2">
                    <span className="text-sm truncate">{p.name}</span>
                    <span className="font-semibold shrink-0">{money(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="card p-4">
            <div className="font-bold mb-2">Últimos registros</div>

            {sales.length === 0 ? (
              <div className="text-sm text-slate-500">No hay ventas en el período.</div>
            ) : (
              <div className="grid gap-2">
                {sales.slice(0, 30).map((s) => (
                  <div key={s.id} className="border border-slate-200 rounded-2xl p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {s.productoNombre || s.productoId}
                        </div>
                        <div className="text-xs text-slate-500">
                          {String(fmtFechaHoraAR(s.fechaHora) || "")} • {s.medioPago || "-"} • {s.categoria || "-"}
                        </div>
                      </div>
                      <div className="font-bold shrink-0">{money(s.total)}</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Cantidad: <b>{s.cantidad}</b> {s.unidad ? String(s.unidad).toLowerCase() : ""}
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
