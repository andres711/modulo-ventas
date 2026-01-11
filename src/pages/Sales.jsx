import { useEffect, useMemo, useState } from "react";
import { createSale, getProducts } from "../api";

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
    for (const it of cartItems) t += it.producto.precio * it.cantidad;
    return t;
  }, [cartItems]);

  function addToCart(p) {
    if (p.stock <= 0) return setMsg({ text: "Ese producto no tiene stock.", ok: false });

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

  async function save() {
    if (cart.size === 0) return setMsg({ text: "No hay productos seleccionados.", ok: false });

    setLoading(true);
    try {
      setMsg({ text: "Guardando venta...", ok: true });
      const items = Array.from(cart.values()).map(it => ({ productoId: it.producto.id, cantidad: it.cantidad }));
      await createSale({ items, medioPago, observacion: obs.trim() });
      setMsg({ text: "Venta guardada ✅", ok: true });
      setCart(new Map());
      setObs("");
      await refresh();
    } catch (e) {
      setMsg({ text: e.message, ok: false });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_380px]">
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
      <aside className="card p-4 h-fit md:sticky md:top-20">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold">Carrito</div>
            <div className="text-xs text-slate-500">{cartItems.length ? "Ajustá cantidades y guardá." : "Agregá productos desde el catálogo."}</div>
          </div>
          <button className="btn" onClick={() => setCart(new Map())}>Vaciar</button>
        </div>

        <div className="grid gap-2">
          {cartItems.length === 0 ? (
            <div className="card p-4 bg-slate-50 border-slate-200">
              <div className="font-semibold">Sin productos</div>
              <div className="text-sm text-slate-600">Tocá un producto para agregarlo.</div>
            </div>
          ) : cartItems.map(({ producto, cantidad }) => (
            <div key={producto.id} className="border border-slate-200 rounded-2xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold leading-tight truncate">{producto.nombre}</div>
                  <div className="text-xs text-slate-500">{money(producto.precio)} • Stock {producto.stock}</div>
                </div>
                <button className="btn" onClick={() => remove(producto.id)}>Quitar</button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button className="btn" onClick={() => setQty(producto.id, cantidad - 1)}>-</button>
                  <input
                    className="input w-16 text-center"
                    value={cantidad}
                    inputMode="numeric"
                    onChange={(e) => setQty(producto.id, e.target.value)}
                  />
                  <button className="btn" onClick={() => setQty(producto.id, cantidad + 1)}>+</button>
                </div>
                <div className="font-bold">{money(producto.precio * cantidad)}</div>
              </div>
            </div>
          ))}
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
    </div>
  );
}
