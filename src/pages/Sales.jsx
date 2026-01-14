import { useEffect, useMemo, useState } from "react";
import { createSale, getProducts } from "../api";
import Drawer from "../components/Drawer";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";
import { useToast } from "../hooks/useToast";

const CATEGORIES = ["Polleria", "Congelados", "Almacen", "Bebidas"];

const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function vibrate(ms = 40) {
  try {
    if (navigator?.vibrate) navigator.vibrate(ms);
  } catch (e) {
    e;
  }
}

export default function Sales() {
  const { toast, showToast, hideToast } = useToast();

  // Data
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // UI filters
  const [activeCat, setActiveCat] = useState("Polleria");
  const [search, setSearch] = useState("");

  // Cart
  const [cart, setCart] = useState(() => new Map());
  const [cartOpen, setCartOpen] = useState(false);

  // Sale meta
  const [medioPago, setMedioPago] = useState("Efectivo");
  const [obs, setObs] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });

  // Saving sale
  const [savingSale, setSavingSale] = useState(false);

  // KG modal
  const [kgOpen, setKgOpen] = useState(false);
  const [kgProduct, setKgProduct] = useState(null);
  const [kgTotal, setKgTotal] = useState("");
  const [kgMode, setKgMode] = useState("ADD"); // "ADD" | "EDIT"
  const [kgPrev, setKgPrev] = useState({ kg: 0, total: 0 });

  // -------------------------
  // Helpers
  // -------------------------
  function normalizeProducts(list) {
    return (list || [])
      .map((x) => ({
        ...x,
        id: String(x?.id ?? "").trim(),
        categoria: String(x?.categoria ?? "").trim(),
        nombre: String(x?.nombre ?? "").trim(),
        descripcion: String(x?.descripcion ?? "").trim(),
        imagenUrl: String(x?.imagenUrl ?? "").trim(),
        precio: Number(x?.precio ?? 0),
        stock: Number(x?.stock ?? 0),
        unidad: String(x?.unidad ?? "UN").trim(),
      }))
      .filter((p) => p.id);
  }

  // -------------------------
  // Refresh products
  // -------------------------
  async function refresh() {
    const start = Date.now();
    setLoadingProducts(true);

    try {
      const p = await getProducts();
      setProducts(normalizeProducts(p));
      setMsg({ text: "", ok: true });
    } catch (e) {
      const text = e?.message || String(e);
      setMsg({ text, ok: false });
      showToast({ ok: false, text });
    } finally {
      const elapsed = Date.now() - start;
      const min = 250; // mínimo para ver spinner
      if (elapsed < min) await sleep(min - elapsed);
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------
  // Derived
  // -------------------------
    const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => p.categoria === activeCat)
      .filter((p) => {
        if (!q) return true;
        const name = (p.nombre || "").toLowerCase();
        const id = String(p.id || "").toLowerCase();
        const desc = (p.descripcion || "").toLowerCase();
        return name.includes(q) || id.includes(q) || desc.includes(q);
      });
    }, [products, activeCat, search]);

  const cartItems = useMemo(() => {
    return Array.from(cart.values()).sort(
      (a, b) => (b.addedAt || 0) - (a.addedAt || 0)
    );
  }, [cart]);

  const total = useMemo(() => {
    let t = 0;
    for (const it of cartItems) {
      const isKg = (it.producto?.unidad || "UN") === "KG";
      t += isKg ? Number(it.total || 0) : Number(it.producto?.precio || 0) * Number(it.cantidad || 0);
    }
    return t;
  }, [cartItems]);

  // -------------------------
  // Cart actions
  // -------------------------
  function openEditKg(item) {
    setKgMode("EDIT");
    setKgProduct(item.producto);
    setKgPrev({ kg: Number(item.cantidad || 0), total: Number(item.total || 0) });
    setKgTotal(String(Number(item.total || 0)));
    setKgOpen(true);
  }

  function addToCart(p) {
    if (Number(p.stock || 0) <= 0) {
      setMsg({ text: "Sin stock.", ok: false });
      showToast({ ok: false, text: "Sin stock." });
      vibrate(60);
      return;
    }

    if ((p.unidad || "UN") === "KG") {
      setKgMode("ADD");
      setKgPrev({ kg: 0, total: 0 });
      setKgProduct(p);
      setKgTotal("");
      setKgOpen(true);
      return;
    }

    // UN
    setCart((prev) => {
      const next = new Map(prev);
      const curr = next.get(p.id);
      const nextQty = (curr ? Number(curr.cantidad || 0) : 0) + 1;

      if (nextQty > Number(p.stock || 0)) {
        const text = `Stock insuficiente (${p.stock})`;
        setMsg({ text, ok: false });
        showToast({ ok: false, text });
        vibrate(80);
        return prev;
      }

      next.set(p.id, {
        producto: p,
        cantidad: nextQty,
        addedAt: Date.now(),
        total: undefined,
      });

      showToast({ ok: true, text: "Agregado" });
      vibrate(30);
      setMsg({ text: "", ok: true });
      return next;
    });
  }

  function setQty(pid, qty) {
    setCart((prev) => {
      const next = new Map(prev);
      const it = next.get(pid);
      if (!it) return prev;

      let v = Number(qty);
      if (!Number.isFinite(v) || v < 1) v = 1;

      const stock = Number(it.producto?.stock || 0);
      if (v > stock) {
        v = stock;
        setMsg({ text: `Ajusté cantidad al stock (${v}).`, ok: false });
        showToast({ ok: false, text: `Ajustado a stock (${v})` });
        vibrate(50);
      } else {
        setMsg({ text: "", ok: true });
      }

      next.set(pid, { ...it, cantidad: v, addedAt: Date.now() });
      showToast({ ok: true, text: "Actualizado" });
      vibrate(20);
      return next;
    });
  }

  function remove(pid) {
    setCart((prev) => {
      const next = new Map(prev);
      next.delete(pid);
      return next;
    });
  }

  // -------------------------
  // Save sale
  // -------------------------
  async function saveSale() {
    if (cart.size === 0) {
      setMsg({ text: "No hay productos seleccionados.", ok: false });
      showToast({ ok: false, text: "No hay productos seleccionados" });
      vibrate(60);
      return false;
    }

    setSavingSale(true);
    try {
      setMsg({ text: "Guardando venta...", ok: true });

      const items = Array.from(cart.values()).map((it) => ({
        productoId: it.producto.id,
        cantidad: it.cantidad,
        total: it.total, // solo KG
      }));

      await createSale({ items, medioPago, observacion: obs.trim() });

      setCart(new Map());
      setObs("");
      setMsg({ text: "Venta guardada ✅", ok: true });
      showToast({ ok: true, text: "Venta guardada ✅" });
      vibrate(35);

      await refresh();
      return true;
    } catch (e) {
      const text = e?.message || String(e);
      setMsg({ text, ok: false });
      showToast({ ok: false, text });
      vibrate(80);
      return false;
    } finally {
      setSavingSale(false);
    }
  }

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_380px]">
      {/* CATALOGO */}
      <section className="card p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="text-lg font-bold">Nueva venta</div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Carrito icono (mobile) */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative btn btn-primary md:hidden px-3"
              aria-label="Abrir carrito"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-9v9"
                />
              </svg>

              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            <button className="btn" onClick={refresh} disabled={loadingProducts}>
              {loadingProducts ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            className="input"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 py-3">
          {CATEGORIES.map((c) => (
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
          {loadingProducts ? (
            <div className="col-span-full">
              <Spinner label="Cargando..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full card p-4 bg-slate-50 border-slate-200">
              <div className="font-semibold">No hay productos</div>
              <div className="text-sm text-slate-600">
                Cargalos en la pestaña “Productos”.
              </div>
            </div>
          ) : (
            filtered.map((p) => (
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
                  <div className="font-semibold leading-tight line-clamp-2">
                    {p.nombre}
                  </div>
                  <div className="text-sm text-slate-700">{money(p.precio)}</div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span
                      className={`badge ${
                        p.stock > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {p.stock > 0 ? `Stock ${p.stock}` : "Sin stock"}
                      {p.unidad === "KG" ? " kg" : ""}
                    </span>
                    <span className="text-xs text-slate-500">Tocar</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* CARRITO (desktop) */}
      <aside className="hidden md:block card p-4 h-fit self-start sticky top-24">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-lg font-bold">Carrito</div>
            <div className="text-xs text-slate-500">
              {cartItems.length
                ? "Ajustá cantidades y guardá."
                : "Agregá productos desde el catálogo."}
            </div>
          </div>
          <button className="btn" onClick={() => setCart(new Map())}>
            Vaciar
          </button>
        </div>

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
                ? Number(item.total || 0)
                : Number(producto.precio || 0) * Number(cantidad || 0);

              const qtyLabel = isKg
                ? `${Number(cantidad || 0).toFixed(3)} kg`
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

                    <div className="flex items-center gap-2">
                      {isKg && (
                        <button className="btn" onClick={() => openEditKg(item)}>
                          Editar
                        </button>
                      )}
                      <button className="btn" onClick={() => remove(producto.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {!isKg ? (
                        <>
                          <button
                            className="btn"
                            onClick={() => setQty(producto.id, Number(cantidad) - 1)}
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
                            onClick={() => setQty(producto.id, Number(cantidad) + 1)}
                          >
                            +
                          </button>
                        </>
                      ) : (
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
          )}
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4 grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total</span>
            <span className="text-2xl font-black">{money(total)}</span>
          </div>

          <label className="text-sm text-slate-600">Medio de pago</label>
          <select
            className="input"
            value={medioPago}
            onChange={(e) => setMedioPago(e.target.value)}
          >
            <option>Efectivo</option>
            <option>Tarjeta</option>
            <option>Transferencia</option>
          </select>

          <label className="text-sm text-slate-600">Observación (opcional)</label>
          <input
            className="input"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ej: promo, descuento..."
          />

          <button
            disabled={savingSale}
            onClick={saveSale}
            className={`btn btn-primary w-full py-3 ${
              savingSale ? "opacity-70" : ""
            }`}
          >
            {savingSale ? "Guardando..." : "Guardar venta"}
          </button>

          {msg.text && (
            <div
              className={`text-sm ${msg.ok ? "text-emerald-700" : "text-rose-700"}`}
            >
              {msg.text}
            </div>
          )}
        </div>
      </aside>

      {/* CARRITO (mobile modal) */}
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
            <select
              className="input"
              value={medioPago}
              onChange={(e) => setMedioPago(e.target.value)}
            >
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>

            <label className="text-sm text-slate-600">Observación (opcional)</label>
            <input
              className="input"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ej: promo, descuento..."
            />

            <button
              disabled={savingSale}
              onClick={async () => {
                const ok = await saveSale();
                if (ok) {
                  await sleep(200);
                  setCartOpen(false);
                  setMsg({ text: "", ok: true });
                }
              }}
              className={`btn btn-primary w-full py-3 ${
                savingSale ? "opacity-70" : ""
              }`}
            >
              {savingSale ? "Guardando..." : "Guardar venta"}
            </button>

            {msg.text && (
              <div
                className={`text-sm ${msg.ok ? "text-emerald-700" : "text-rose-700"}`}
              >
                {msg.text}
              </div>
            )}
          </div>
        }
      >
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
                ? Number(item.total || 0)
                : Number(producto.precio || 0) * Number(cantidad || 0);

              const qtyLabel = isKg
                ? `${Number(cantidad || 0).toFixed(3)} kg`
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

                    <div className="flex items-center gap-2">
                      {isKg && (
                        <button className="btn" onClick={() => openEditKg(item)}>
                          Editar
                        </button>
                      )}
                      <button className="btn" onClick={() => remove(producto.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      {!isKg ? (
                        <>
                          <button
                            className="btn"
                            onClick={() => setQty(producto.id, Number(cantidad) - 1)}
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
                            onClick={() => setQty(producto.id, Number(cantidad) + 1)}
                          >
                            +
                          </button>
                        </>
                      ) : (
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
          )}
        </div>
      </Drawer>

      {/* KG modal */}
      <Drawer
        open={kgOpen}
        title={kgProduct ? `Venta por kg: ${kgProduct.nombre}` : "Venta por kg"}
        onClose={() => setKgOpen(false)}
        footer={
          <button
            className="btn btn-primary w-full py-3"
            onClick={() => {
              const totalValue = Number(String(kgTotal).replace(",", "."));
              if (!Number.isFinite(totalValue) || totalValue <= 0) {
                setMsg({ text: "Importe inválido", ok: false });
                showToast({ ok: false, text: "Importe inválido" });
                vibrate(60);
                return;
              }

              const precioKg = Number(kgProduct?.precio || 0);
              if (!Number.isFinite(precioKg) || precioKg <= 0) {
                setMsg({ text: "Precio/kg inválido en producto", ok: false });
                showToast({ ok: false, text: "Precio/kg inválido" });
                vibrate(60);
                return;
              }

              const kg = Number((totalValue / precioKg).toFixed(3));
              if (!Number.isFinite(kg) || kg <= 0) {
                setMsg({ text: "Kg calculados inválidos", ok: false });
                showToast({ ok: false, text: "Kg calculados inválidos" });
                vibrate(60);
                return;
              }

              setCart((prev) => {
                const next = new Map(prev);
                const curr = next.get(kgProduct.id);
                const stock = Number(kgProduct.stock || 0);

                if (kgMode === "EDIT") {
                  const available = stock + Number(kgPrev.kg || 0);
                  if (kg > available + 1e-9) {
                    const text = `Stock insuficiente. Disponible: ${available.toFixed(3)} kg`;
                    setMsg({ text, ok: false });
                    showToast({ ok: false, text });
                    vibrate(80);
                    return prev;
                  }

                  next.set(kgProduct.id, {
                    producto: kgProduct,
                    cantidad: kg,
                    total: Number(totalValue.toFixed(2)),
                    addedAt: Date.now(),
                  });

                  showToast({
                    ok: true,
                    text: `Editado: ${kgProduct.nombre}`,
                  });
                  vibrate(25);
                  return next;
                }

                const currKg = curr ? Number(curr.cantidad || 0) : 0;
                const currTotal = curr ? Number(curr.total || 0) : 0;

                const newKg = Number((currKg + kg).toFixed(3));
                const newTotal = Number((currTotal + totalValue).toFixed(2));

                if (newKg > stock + 1e-9) {
                  const text = `Stock insuficiente. Stock: ${stock} kg`;
                  setMsg({ text, ok: false });
                  showToast({ ok: false, text });
                  vibrate(80);
                  return prev;
                }

                next.set(kgProduct.id, {
                  producto: kgProduct,
                  cantidad: newKg,
                  total: newTotal,
                  addedAt: Date.now(),
                });

                showToast({
                  ok: true,
                  text: `Agregado: ${kgProduct.nombre}`,
                });
                vibrate(25);
                return next;
              });

              setKgOpen(false);
              setKgMode("ADD");
              setKgPrev({ kg: 0, total: 0 });
              setKgProduct(null);
              setKgTotal("");
              setMsg({ text: "", ok: true });
            }}
          >
            {kgMode === "EDIT" ? "Guardar cambios" : "Agregar"}
          </button>
        }
      >
        {kgProduct && (
          <div className="grid gap-2">
            <div className="text-sm text-slate-600">
              Precio por kg: <b>{money(kgProduct.precio)}</b> • Stock:{" "}
              <b>{kgProduct.stock} kg</b>
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
                  const t = Number(String(kgTotal).replace(",", "."));
                  const pk = Number(kgProduct.precio || 0);
                  if (!Number.isFinite(t) || !Number.isFinite(pk) || pk <= 0)
                    return "-";
                  return (t / pk).toFixed(3);
                })()}
              </b>
            </div>
          </div>
        )}
      </Drawer>

      <Toast show={toast.show} ok={toast.ok} text={toast.text} onClose={hideToast} />
    </div>
  );
}
