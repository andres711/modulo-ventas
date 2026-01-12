import { useEffect, useMemo, useState } from "react";
import { createSale, getProducts } from "../api";
import Drawer from "../components/Drawer";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";


const CATEGORIES = ["Polleria", "Congelados", "Almacen", "Bebidas"];

const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState("Polleria");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState(() => new Map());
  const [medioPago, setMedioPago] = useState("Efectivo");
  const [obs, setObs] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [kgOpen, setKgOpen] = useState(false);
  const [kgProduct, setKgProduct] = useState(null);
  const [kgTotal, setKgTotal] = useState("");


  async function refresh() {
    setMsg({ text: "Cargando productos...", ok: true });
    try {
      const p = await getProducts();
      setProducts(p);
      setMsg({ text: "", ok: true });
    } catch (e) {
      setMsg({ text: e.message, ok: false });
    }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter(p => p.categoria === activeCat)
      .filter(p => !q || p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q));
  }, [products, activeCat, search]);

  const cartItems = useMemo(() => Array.from(cart.values()), [cart]);

  const total = useMemo(() => {
    let t = 0;
    for (const it of cartItems) {
    if ((it.producto.unidad || "UN") === "KG") t += Number(it.total || 0);
    else t += it.producto.precio * it.cantidad;
    }
    return t;
  }, [cartItems]);

  function addToCart(p) {
    if (p.stock <= 0) return setMsg({ text: "Ese producto no tiene stock.", ok: false });

    if ((p.unidad || "UN") === "KG") {
      setKgProduct(p);
      setKgTotal("");
      setKgOpen(true);
      return;
    }

    // comportamiento normal UN
    setCart(prev => {
      const next = new Map(prev);
      const curr = next.get(p.id);
      const nextQty = (curr ? curr.cantidad : 0) + 1;

      if (nextQty > p.stock) {
        setMsg({ text: `Stock insuficiente. Stock: ${p.stock}`, ok: false });
        return prev;
      }

      next.set(p.id, { producto: p, cantidad: nextQty });
      setMsg({ text: "", ok: true });
      return next;
    });
  }


  function setQty(pid, qty) {
    setCart(prev => {
      const next = new Map(prev);
      const it = next.get(pid);
      if (!it) return prev;

      let v = Number(qty);
      if (!Number.isFinite(v) || v < 1) v = 1;
      if (v > it.producto.stock) {
        v = it.producto.stock;
        setMsg({ text: `Ajusté cantidad al stock (${v}).`, ok: false });
      } else {
        setMsg({ text: "", ok: true });
      }

      next.set(pid, { ...it, cantidad: v });
      return next;
    });
  }

  function remove(pid) {
    setCart(prev => {
      const next = new Map(prev);
      next.delete(pid);
      return next;
    });
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function vibrate(ms = 40) {
  try {
    if (navigator?.vibrate) navigator.vibrate(ms);
  } catch(e) {e}
  }

  async function save() {
    if (cart.size === 0) {
      setMsg({ text: "No hay productos seleccionados.", ok: false });
      showToast({ ok: false, text: "No hay productos seleccionados" });
      vibrate(60);
      return false;
    }
    setLoading(true);
    try {
      setMsg({ text: "Guardando venta...", ok: true });
      const items = Array.from(cart.values()).map(it => ({
        productoId: it.producto.id,
        cantidad: it.cantidad,
        total: it.total, // solo viene en KG
      }));

      await createSale({ items, medioPago, observacion: obs.trim() });

      setMsg({ text: "Venta guardada ✅", ok: true });
      setCart(new Map());
      setObs("");
      await refresh();

      showToast({ ok: true, text: "Venta guardada ✅" });
      vibrate(35);
      return true;
    } catch (e) {
      setMsg({ text: e.message, ok: false });
      showToast({ ok: false, text: e.message });
      vibrate(80);
      return false;
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="grid gap-4 pb-20 md:pb-0 md:grid-cols-[1fr_380px]">
      {/* CATALOGO */}
      <section className="card p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-lg font-bold">Nueva venta</div>
            <div className="text-xs text-slate-500">Elegí productos por categoría y guardá la venta.</div>
          </div>
          <button className="btn" onClick={refresh}>Actualizar</button>
        </div>

        <div className="flex items-center gap-2">
          <input
            className="input"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-auto py-3">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setActiveCat(c)}
              className={`btn ${c === activeCat ? "btn-primary" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.length === 0 ? (
            <div className="col-span-full card p-4 bg-slate-50 border-slate-200">
              <div className="font-semibold">No hay productos</div>
              <div className="text-sm text-slate-600">Cargalos en la pestaña “Productos”.</div>
            </div>
          ) : filtered.map(p => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="card overflow-hidden text-left hover:shadow-md transition active:scale-[0.99]"
            >
              {p.imagenUrl ? (
                <img
                  src={p.imagenUrl}
                  alt={p.nombre}
                  className="w-full h-28 object-cover bg-slate-100"
                />
              ) : (
                <div className="w-full h-28 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                  Sin imagen
                </div>
              )}

              <div className="p-3 grid gap-1">
                <div className="font-semibold leading-tight line-clamp-2">{p.nombre}</div>
                <div className="text-sm text-slate-700">{money(p.precio)}</div>

                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className={`badge ${p.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {p.stock > 0 ? `Stock ${p.stock}` : "Sin stock"}
                  </span>
                  <span className="text-xs text-slate-500">Tocar</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
      {/* CARRITO */}
      <aside className="hidden md:block card p-4 h-fit self-start sticky top-24">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold">Carrito</div>
            <div className="text-xs text-slate-500">{cartItems.length ? "Ajustá cantidades y guardá." : "Agregá productos desde el catálogo."}</div>
          </div>
          <button className="btn" onClick={() => setCart(new Map())}>Vaciar</button>
        </div>

        <div className="grid gap-2">
          {
            cartItems.length === 0 ? (
              <div className="card p-4 bg-slate-50 border-slate-200">
                <div className="font-semibold">Sin productos</div>
                <div className="text-sm text-slate-600">Tocá un producto para agregarlo.</div>
              </div>
            ) : 
            (
            cartItems.map((item) => {
              const { producto, cantidad } = item;
              const isKg = (producto.unidad || "UN") === "KG";

              const subtotal = isKg
                ? Number(item.total || 0)               // 👈 importe real cobrado
                : producto.precio * cantidad;

              const qtyLabel = isKg
                ? `${cantidad.toFixed(3)} kg`
                : `${cantidad}`;

              return (
                <div
                  key={producto.id}
                  className="border border-slate-200 rounded-2xl p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight truncate">
                        {producto.nombre}
                      </div>
                      <div className="text-xs text-slate-500">
                        {money(producto.precio)}
                        {isKg ? " / kg" : ""} • Stock {producto.stock}
                        {isKg ? " kg" : ""}
                      </div>
                    </div>
                    <button
                      className="btn"
                      onClick={() => remove(producto.id)}
                    >
                      Quitar
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {!isKg && (
                        <>
                          <button
                            className="btn"
                            onClick={() => setQty(producto.id, cantidad - 1)}
                          >
                            -
                          </button>

                          <input
                            className="input w-16 text-center"
                            value={cantidad}
                            inputMode="numeric"
                            onChange={(e) => setQty(producto.id, e.target.value)}
                          />

                          <button
                            className="btn"
                            onClick={() => setQty(producto.id, cantidad + 1)}
                          >
                            +
                          </button>
                        </>
                      )}

                      {isKg && (
                        <div className="text-sm text-slate-600">
                          Cantidad: <b>{qtyLabel}</b>
                        </div>
                      )}
                    </div>

                    <div className="font-bold">{money(subtotal)}</div>
                  </div>
                </div>
              );
            })
            )
          }
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4 grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total</span>
            <span className="text-2xl font-black">{money(total)}</span>
          </div>

          <label className="text-sm text-slate-600">Medio de pago</label>
          <select className="input" value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Transferencia</option>
          </select>

          <label className="text-sm text-slate-600">Observación (opcional)</label>
          <input className="input" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ej: promo, descuento..." />

          <button
            disabled={loading}
            onClick={save}
            className={`btn btn-primary w-full py-3 ${loading ? "opacity-70" : ""}`}
          >
            {loading ? "Guardando..." : "Guardar venta"}
          </button>

          {msg.text && (
            <div className={`text-sm ${msg.ok ? "text-emerald-700" : "text-rose-700"}`}>
              {msg.text}
            </div>
          )}
        </div>
      </aside>
      {/* Mobile cart button */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto max-w-6xl px-3 pb-3">
        <button
          onClick={() => setCartOpen(true)}
          className="btn btn-primary w-full py-3 flex items-center justify-between"
        >
          <span>Ver carrito</span>
          <span className="font-bold">
            {cartItems.length} • {money(total)}
          </span>
        </button>
      </div>
      </div>
      <Drawer
        open={cartOpen}
        title="Carrito"
        onClose={() => setCartOpen(false)}
        footer={
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total</span>
              <span className="text-2xl font-black">{money(total)}</span>
            </div>

            <label className="text-sm text-slate-600">Medio de pago</label>
            <select className="input" value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>

            <label className="text-sm text-slate-600">Observación (opcional)</label>
            <input className="input" value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ej: promo, descuento..." />

            <button
              disabled={loading}
              onClick={async () => {
                const ok = await save();
                if (ok)
                {
                  await sleep(200);
                  setCartOpen(false);
                  setMsg({ text: "", ok: true });
                } 
              }}
              className={`btn btn-primary w-full py-3 ${loading ? "opacity-70" : ""}`}
            >
              {loading ? "Guardando..." : "Guardar venta"}
            </button>

            {msg.text && (
              <div className={`text-sm ${msg.ok ? "text-emerald-700" : "text-rose-700"}`}>
                {msg.text}
              </div>
            )}
          </div>
        }
      >
        {/* Body del drawer: lista de items */}
        <div className="grid gap-2">
          {cartItems.length === 0 ? (
            <div className="card p-4 bg-slate-50 border-slate-200">
              <div className="font-semibold">Sin productos</div>
              <div className="text-sm text-slate-600">
                Tocá un producto para agregarlo.
              </div>
            </div>
          ) : (
            cartItems.map((item) => {
              const { producto, cantidad } = item;
              const isKg = (producto.unidad || "UN") === "KG";

              const subtotal = isKg
                ? Number(item.total || 0)           // ✅ importe real cobrado
                : producto.precio * cantidad;

              const qtyLabel = isKg
                ? `${cantidad.toFixed(3)} kg`
                : `${cantidad}`;

              return (
                <div
                  key={producto.id}
                  className="border border-slate-200 rounded-2xl p-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold leading-tight truncate">
                        {producto.nombre}
                      </div>
                      <div className="text-xs text-slate-500">
                        {money(producto.precio)}
                        {isKg ? " / kg" : ""} • Stock {producto.stock}
                        {isKg ? " kg" : ""}
                      </div>
                    </div>

                    <button
                      className="btn"
                      onClick={() => remove(producto.id)}
                    >
                      Quitar
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {!isKg && (
                        <>
                          <button
                            className="btn"
                            onClick={() => setQty(producto.id, cantidad - 1)}
                          >
                            -
                          </button>

                          <input
                            className="input w-16 text-center"
                            value={cantidad}
                            inputMode="numeric"
                            onChange={(e) => setQty(producto.id, e.target.value)}
                          />

                          <button
                            className="btn"
                            onClick={() => setQty(producto.id, cantidad + 1)}
                          >
                            +
                          </button>
                        </>
                      )}

                      {isKg && (
                        <div className="text-sm text-slate-600">
                          Cantidad: <b>{qtyLabel}</b>
                        </div>
                      )}
                    </div>

                    <div className="font-bold">
                      {money(subtotal)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </Drawer>
      <Toast show={toast.show} ok={toast.ok} text={toast.text} onClose={hideToast} />
      <Drawer
          open={kgOpen}
          title={kgProduct ? `Venta por kg: ${kgProduct.nombre}` : "Venta por kg"}
          onClose={() => setKgOpen(false)}
          footer={
            <button
              className="btn btn-primary w-full py-3"
              onClick={() => {
                const total = Number(String(kgTotal).replace(",", "."));
                if (!Number.isFinite(total) || total <= 0) {
                  setMsg({ text: "Importe inválido", ok: false });
                  return;
                }
                const kg = total / Number(kgProduct.precio || 0);
                if (!Number.isFinite(kg) || kg <= 0) {
                  setMsg({ text: "Precio/kg inválido en producto", ok: false });
                  return;
                }
                if (kg > kgProduct.stock + 1e-9) {
                  setMsg({ text: `Stock insuficiente. Stock: ${kgProduct.stock} kg`, ok: false });
                  return;
                }

                // Agregar al carrito (KG): guardamos cantidad decimal + total explícito
                setCart(prev => {
                  const next = new Map(prev);
                  const curr = next.get(kgProduct.id);

                  const newKg = (curr ? curr.cantidad : 0) + kg;
                  const newTotal = (curr ? (curr.total || 0) : 0) + total;

                  if (newKg > kgProduct.stock + 1e-9) {
                    setMsg({ text: `Stock insuficiente. Stock: ${kgProduct.stock} kg`, ok: false });
                    return prev;
                  }

                  next.set(kgProduct.id, {
                    producto: kgProduct,
                    cantidad: Number(newKg.toFixed(3)), // 3 decimales
                    total: Number(newTotal.toFixed(2)), // total real cobrado
                  });

                  return next;
                });

                setKgOpen(false);
                setMsg({ text: "", ok: true });
              }}
            >
              Agregar
            </button>
          }
        >
          {kgProduct && (
            <div className="grid gap-2">
              <div className="text-sm text-slate-600">
                Precio por kg: <b>{money(kgProduct.precio)}</b> • Stock: <b>{kgProduct.stock} kg</b>
              </div>

              <label className="text-sm text-slate-600">Importe cobrado</label>
              <input
                className="input"
                inputMode="numeric"
                placeholder="Ej: 3580"
                value={kgTotal}
                onChange={(e) => setKgTotal(e.target.value)}
              />

              <div className="text-sm">
                Kg estimados:{" "}
                <b>
                  {(() => {
                    const t = Number(kgTotal);
                    const pk = Number(kgProduct.precio || 0);
                    if (!Number.isFinite(t) || !Number.isFinite(pk) || pk <= 0) return "-";
                    return (t / pk).toFixed(3);
                  })()}
                </b>
              </div>
            </div>
          )}
      </Drawer>

    </div>    
  );
}
