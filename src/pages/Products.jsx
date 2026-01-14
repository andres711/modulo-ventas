import { useEffect, useMemo, useState } from "react";
import Drawer from "../components/Drawer";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import Spinner from "../components/Spinner";

const CATEGORIES = ["Polleria", "Congelados", "Almacen", "Bebidas"];

const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const API_URL = import.meta.env.VITE_API_URL;

async function apiGetProducts() {
  const res = await fetch(`${API_URL}?action=products`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Error cargando productos");

  return (json.products || [])
    .map((p) => ({
      ...p,
      id: String(p.id || "").trim(),
      categoria: String(p.categoria || "").trim(),
      nombre: String(p.nombre || "").trim(),
      descripcion: String(p.descripcion || "").trim(),
      imagenUrl: String(p.imagenUrl || "").trim(),
      precio: Number(p.precio || 0),
      costo: Number(p.costo || 0),
      stock: Number(p.stock || 0),
      unidad: String(p.unidad || "UN").trim(), // por si lo usás
      activo: String(p.activo || "TRUE").toUpperCase() !== "FALSE",
    }))
    .filter((p) => p.id);
}

async function apiUpsertProduct(row) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "product_upsert", row }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Error guardando producto");
  return json;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function vibrate(ms = 40) {
  try {
    if (navigator?.vibrate) navigator.vibrate(ms);
  } catch (e) {
    e;
  }
}

export default function Products() {
  const { toast, showToast, hideToast } = useToast();

  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState("Polleria");
  const [search, setSearch] = useState("");

  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [msg, setMsg] = useState({ text: "", ok: true });
  const [formOpen, setFormOpen] = useState(false);

  const [form, setForm] = useState({
    id: "",
    categoria: "Polleria",
    nombre: "",
    precio: "",
    stock: "",
    imagenUrl: "",
    descripcion: "",
    activo: true,
    costo: "",
    unidad: "UN"
  });

  async function refresh() {
    const start = Date.now();
    setLoadingProducts(true);
    try {
      const p = await apiGetProducts();
      setProducts(p);
    } catch (e) {
      showToast({ ok: false, text: e.message });
    } finally {
      const elapsed = Date.now() - start;
      const min = 250;
      if (elapsed < min) await sleep(min - elapsed);
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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


  function openNewProduct() {
    setMsg({ text: "", ok: true });
    setForm({
      id: "",
      categoria: activeCat,
      nombre: "",
      precio: "",
      costo: "",
      unidad: "UN",
      stock: "",
      imagenUrl: "",
      descripcion: "",
      activo: true,
    });
    setFormOpen(true);
  }

  function edit(p) {
    setMsg({ text: "", ok: true });
    setForm({
      id: p.id,
      categoria: p.categoria,
      nombre: p.nombre,
      precio: String(p.precio ?? ""),
      stock: String(p.stock ?? ""),
      imagenUrl: p.imagenUrl,
      descripcion: p.descripcion,
      activo: !!p.activo,
      costo: String(p.costo ?? ""),
      unidad: String(p.unidad || "UN")
    });
    setFormOpen(true);
  }

  async function save() {
    if (!form.categoria) {
      setMsg({ text: "Categoría requerida", ok: false });
      return false;
    }
    if (!String(form.nombre || "").trim()) {
      setMsg({ text: "Nombre requerido", ok: false });
      return false;
    }

    const costo = Number(form.costo);
    const precio = Number(form.precio);
    const stock = Number(form.stock);

    if (!Number.isFinite(precio) || precio < 0) {
      setMsg({ text: "Precio inválido", ok: false });
      return false;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setMsg({ text: "Stock inválido", ok: false });
      return false;
    }
    if (!["UN", "KG"].includes(form.unidad)) {
    setMsg({ text: "Unidad inválida", ok: false });
    return false;
    }

    if (!Number.isFinite(costo) || costo < 0) {
      setMsg({ text: "Costo inválido", ok: false });
      return false;
    }

    setSaving(true);
    try {
      await apiUpsertProduct({
        id: form.id || undefined,
        categoria: form.categoria,
        nombre: String(form.nombre).trim(),
        costo, 
        precio,
        unidad: form.unidad,
        stock,
        imagenUrl: String(form.imagenUrl || "").trim(),
        descripcion: String(form.descripcion || "").trim(),
        activo: !!form.activo,
      });

        showToast({ ok: true, text: "Producto guardado ✅" });
        vibrate(35);
        await refresh();

        return true;
      } catch (e) {
        showToast({ ok: false, text: e.message });
        vibrate(60);
        return false;
      } finally {
        setSaving(false);
      }
  }

  return (
    <div className="pb-20 md:pb-0 min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto p-3 grid gap-4 md:grid-cols-[420px_1fr]">
        {/* Form (desktop) */}
        <section className="hidden md:block card p-4 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {form.id ? "Editar producto" : "Nuevo producto"}
            </h2>
            <button onClick={openNewProduct} className="text-sm underline">
              Nuevo
            </button>
          </div>

          <div className="grid gap-2 mt-3">
            <label className="text-sm text-gray-600">Categoría</label>
            <select
              className="px-3 py-2 rounded-xl border"
              value={form.categoria}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoria: e.target.value }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <label className="text-sm text-gray-600">ID (opcional)</label>
            <input
              className="input w-full"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              placeholder="Ej: 121 (si lo dejás vacío se genera solo)"
            />            
            <label className="text-sm text-gray-600">Nombre</label>
            <input
              className="input w-full"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Milanesa de pollo"
            />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-gray-600">Unidad</label>
              <select
                className="input w-full"
                value={form.unidad}
                onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))}
              >
                <option value="UN">UN</option>
                <option value="KG">KG</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Stock</label>
              <input
                className="input w-full"
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder={form.unidad === "KG" ? "Ej: 5.5" : "Ej: 12"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-gray-600">Costo</label>
              <input
                className="input w-full"
                inputMode="numeric"
                value={form.costo}
                onChange={(e) => setForm((f) => ({ ...f, costo: e.target.value }))}
                placeholder="Ej: 4500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Precio {form.unidad === "KG" ? "(por KG)" : "(unitario)"}
              </label>
              <input
                className="input w-full"
                inputMode="numeric"
                value={form.precio}
                onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                placeholder={form.unidad === "KG" ? "Ej: 8000" : "Ej: 1200"}
              />
            </div>
          </div>
          <label className="text-sm text-gray-600">Imagen URL</label>
          <input
            className="input w-full"
            value={form.imagenUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, imagenUrl: e.target.value }))
            }
            placeholder="https://..."
          />

            {String(form.imagenUrl || "").trim() && (
              <img
                src={String(form.imagenUrl).trim()}
                alt="preview"
                className="w-full h-40 object-cover rounded-2xl border bg-gray-100"
              />
            )}

            <label className="text-sm text-gray-600">Descripción</label>
            <textarea
              className="px-3 py-2 rounded-xl border"
              rows={3}
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({ ...f, descripcion: e.target.value }))
              }
              placeholder="Opcional"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, activo: e.target.checked }))
                }
              />
              Producto activo
            </label>

            <button
              disabled={saving}
              onClick={save}
              className={`mt-1 px-4 py-3 rounded-2xl text-white font-semibold ${
                saving ? "bg-green-600/60" : "bg-green-600"
              }`}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>

            {msg.text && (
              <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>
                {msg.text}
              </p>
            )}
          </div>
        </section>

        {/* List */}
        <section className="bg-white rounded-2xl shadow-sm border p-3">
          <div className="flex items-center justify-between gap-2">
            <input
              className="input w-full"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Botón flotante tipo "+" (solo mobile) - ocupa poco */}
            <button
              onClick={openNewProduct}
              className="md:hidden relative btn btn-primary px-3"
              aria-label="Nuevo producto"
              title="Nuevo producto"
            >
              <span className="text-lg leading-none font-black">+</span>
            </button>
          </div>

         <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setActiveCat(c);
                  setForm((f) => ({ ...f, categoria: c }));
                }}
                className={`px-2 py-2 rounded-xl text-sm border font-medium text-center leading-tight whitespace-normal break-words min-h-[44px] ${
                  c === activeCat ? "bg-gray-900 text-white" : "bg-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-2">
            {loadingProducts ? (
              <div className="col-span-full">
                <Spinner label="Cargando..." />
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-sm text-gray-600 p-3">
                No hay productos en esta categoría.
              </div>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => edit(p)}
                  className="text-left border rounded-2xl overflow-hidden hover:shadow-md transition bg-white"
                >
                  {p.imagenUrl ? (
                    <img
                      src={p.imagenUrl}
                      alt={p.nombre}
                      className="w-full h-28 object-cover max-w-full bg-gray-100"
                    />
                  ) : (
                    <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}

                  <div className="p-3 grid gap-1">
                    <div className="font-semibold leading-tight">{p.nombre}</div>
                    <div className="text-sm text-gray-700">
                      {money(p.precio)} • Stock {p.stock}
                    </div>
                    <div className="text-xs text-gray-500">{p.id}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </main>

      {/* FAB "+" (global, fijo abajo a la derecha en mobile) */}
      <button
        onClick={openNewProduct}
        className="md:hidden fixed right-4 bottom-4 z-40 h-14 w-14 rounded-full bg-slate-900 text-white shadow-lg grid place-items-center text-3xl leading-none"
        aria-label="Nuevo producto"
        title="Nuevo producto"
      >
        +
      </button>

      {/* Drawer Form (mobile) */}
      <Drawer
        open={formOpen}
        title={form.id ? "Editar producto" : "Nuevo producto"}
        onClose={() => setFormOpen(false)}
        footer={
          <div className="grid gap-2">
            <button
              disabled={saving}
              onClick={async () => {
                const ok = await save();
                if (ok) {
                  await sleep(200);
                  setFormOpen(false);
                  setMsg({ text: "", ok: true });
                }
              }}
              className={`btn btn-primary w-full py-3 ${saving ? "opacity-70" : ""}`}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            {msg.text && (
              <p className={`text-sm ${msg.ok ? "text-emerald-700" : "text-rose-700"}`}>
                {msg.text}
              </p>
            )}
          </div>
        }
      >
        <div className="grid gap-2">
          <label className="text-sm text-gray-600">Categoría</label>
          <select
            className="px-3 py-2 rounded-xl border"
            value={form.categoria}
            onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <label className="text-sm text-gray-600">ID (opcional)</label>
          <input
            className="input w-full"
            value={form.id}
            onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
            placeholder="Ej: 1 (si lo dejás vacío se genera solo)"
          />
          <label className="text-sm text-gray-600">Nombre</label>
          <input
            className="input w-full"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Ej: Mila pollo casera 1kg"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-gray-600">Unidad</label>
              <select
                className="input w-full"
                value={form.unidad}
                onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))}
              >
                <option value="UN">UN</option>
                <option value="KG">KG</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">Stock</label>
              <input
                className="input w-full"
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder={form.unidad === "KG" ? "Ej: 5.5" : "Ej: 12"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-gray-600">Costo</label>
              <input
                className="input w-full"
                inputMode="numeric"
                value={form.costo}
                onChange={(e) => setForm((f) => ({ ...f, costo: e.target.value }))}
                placeholder="Ej: 4500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Precio {form.unidad === "KG" ? "(por KG)" : "(unitario)"}
              </label>
              <input
                className="input w-full"
                inputMode="numeric"
                value={form.precio}
                onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                placeholder={form.unidad === "KG" ? "Ej: 8000" : "Ej: 1200"}
              />
            </div>
          </div>
          <label className="text-sm text-gray-600">Imagen URL</label>
          <input
            className="input w-full"
            value={form.imagenUrl}
            onChange={(e) => setForm((f) => ({ ...f, imagenUrl: e.target.value }))}
            placeholder="https://..."
          />

          {String(form.imagenUrl || "").trim() && (
            <img
              src={String(form.imagenUrl).trim()}
              alt="preview"
              className="w-full h-40 object-cover rounded-2xl border bg-gray-100"
            />
          )}

          <label className="text-sm text-gray-600">Descripción</label>
          <textarea
            className="px-3 py-2 rounded-xl border"
            rows={3}
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            placeholder="Opcional"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
            />
            Producto activo
          </label>

          {msg.text && (
            <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>
              {msg.text}
            </p>
          )}
        </div>
      </Drawer>

      <Toast show={toast.show} ok={toast.ok} text={toast.text} onClose={hideToast} />
    </div>
  );
}
