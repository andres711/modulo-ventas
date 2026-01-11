import { useEffect, useMemo, useState } from "react";

const CATEGORIES = ["Polleria", "Congelados", "Almacen", "Bebidas"];
const money = (n) =>
  Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

const API_URL = import.meta.env.VITE_API_URL;

async function apiGetProducts() {
  const res = await fetch(`${API_URL}?action=products`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Error cargando productos");
  return (json.products || [])
    .map(p => ({
      ...p,
      id: String(p.id || "").trim(),
      categoria: String(p.categoria || "").trim(),
      nombre: String(p.nombre || "").trim(),
      descripcion: String(p.descripcion || "").trim(),
      imagenUrl: String(p.imagenUrl || "").trim(),
      precio: Number(p.precio || 0),
      stock: Number(p.stock || 0),
      activo: String(p.activo || "TRUE").toUpperCase() !== "FALSE",
    }))
    .filter(p => p.id);
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

export default function Products() {
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState("Polleria");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: "",
    categoria: "Polleria",
    nombre: "",
    precio: "",
    stock: "",
    imagenUrl: "",
    descripcion: "",
    activo: true,
  });

  async function refresh() {
    setMsg({ text: "Cargando...", ok: true });
    try {
      const p = await apiGetProducts();
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

  function edit(p) {
    setForm({
      id: p.id,
      categoria: p.categoria,
      nombre: p.nombre,
      precio: String(p.precio ?? ""),
      stock: String(p.stock ?? ""),
      imagenUrl: p.imagenUrl,
      descripcion: p.descripcion,
      activo: !!p.activo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setForm({
      id: "",
      categoria: activeCat,
      nombre: "",
      precio: "",
      stock: "",
      imagenUrl: "",
      descripcion: "",
      activo: true,
    });
  }

  async function save() {
    // Validaciones mínimas
    if (!form.categoria) return setMsg({ text: "Categoria requerida", ok: false });
    if (!form.nombre.trim()) return setMsg({ text: "Nombre requerido", ok: false });

    const precio = Number(form.precio);
    const stock = Number(form.stock);

    if (!Number.isFinite(precio) || precio < 0) return setMsg({ text: "Precio inválido", ok: false });
    if (!Number.isFinite(stock) || stock < 0) return setMsg({ text: "Stock inválido", ok: false });

    setSaving(true);
    try {
      setMsg({ text: "Guardando...", ok: true });
      await apiUpsertProduct({
        id: form.id || undefined,
        categoria: form.categoria,
        nombre: form.nombre.trim(),
        precio,
        stock,
        imagenUrl: form.imagenUrl.trim(),
        descripcion: form.descripcion.trim(),
        activo: form.activo,
      });
      setMsg({ text: "Guardado ✅", ok: true });
      reset();
      await refresh();
    } catch (e) {
      setMsg({ text: e.message, ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="text-3xl font-black text-pink-600">TEST TAILWIND</div>
      <header className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-6xl mx-auto p-3 flex items-center justify-between">
          <div className="font-bold">IlSupremo • Productos</div>
          <div className="flex gap-2">
            <button onClick={refresh} className="px-3 py-2 rounded-xl bg-gray-900 text-white text-sm">Actualizar</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-3 grid gap-3 md:grid-cols-[420px_1fr]">
        {/* Form */}
        <section className="bg-white rounded-2xl shadow-sm border p-3 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{form.id ? "Editar producto" : "Nuevo producto"}</h2>
            <button onClick={reset} className="text-sm underline">Nuevo</button>
          </div>

          <div className="grid gap-2 mt-3">
            <label className="text-sm text-gray-600">Categoría</label>
            <select
              className="px-3 py-2 rounded-xl border"
              value={form.categoria}
              onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            <label className="text-sm text-gray-600">Nombre</label>
            <input
              className="px-3 py-2 rounded-xl border"
              value={form.nombre}
              onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Mila pollo casera 1kg"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-gray-600">Precio</label>
                <input
                  className="w-full px-3 py-2 rounded-xl border"
                  inputMode="numeric"
                  value={form.precio}
                  onChange={(e) => setForm(f => ({ ...f, precio: e.target.value }))}
                  placeholder="7999"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Stock</label>
                <input
                  className="w-full px-3 py-2 rounded-xl border"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="12"
                />
              </div>
            </div>

            <label className="text-sm text-gray-600">Imagen URL</label>
            <input
              className="px-3 py-2 rounded-xl border"
              value={form.imagenUrl}
              onChange={(e) => setForm(f => ({ ...f, imagenUrl: e.target.value }))}
              placeholder="https://..."
            />

            {form.imagenUrl?.trim() && (
              <img src={form.imagenUrl.trim()} alt="preview" className="w-full h-40 object-cover rounded-2xl border bg-gray-100" />
            )}

            <label className="text-sm text-gray-600">Descripción</label>
            <textarea
              className="px-3 py-2 rounded-xl border"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Opcional"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm(f => ({ ...f, activo: e.target.checked }))}
              />
              Producto activo
            </label>

            <button
              disabled={saving}
              onClick={save}
              className={`mt-1 px-4 py-3 rounded-2xl text-white font-semibold ${saving ? "bg-green-600/60" : "bg-green-600"}`}
            >
              Guardar
            </button>

            {msg.text && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</p>}
          </div>
        </section>

        {/* List */}
        <section className="bg-white rounded-2xl shadow-sm border p-3">
          <div className="flex items-center gap-2">
            <input
              className="w-full px-3 py-2 rounded-xl border"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-auto py-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => { setActiveCat(c); setForm(f => ({ ...f, categoria: c })); }}
                className={`px-3 py-2 rounded-xl text-sm border ${c === activeCat ? "bg-gray-900 text-white" : "bg-white"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-2">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => edit(p)}
                className="text-left border rounded-2xl overflow-hidden hover:shadow-md transition bg-white"
              >
                {p.imagenUrl ? (
                  <img src={p.imagenUrl} alt={p.nombre} className="w-full h-28 object-cover bg-gray-100" />
                ) : (
                  <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Sin imagen</div>
                )}
                <div className="p-3 grid gap-1">
                  <div className="font-semibold leading-tight">{p.nombre}</div>
                  <div className="text-sm text-gray-700">{money(p.precio)} • Stock {p.stock}</div>
                  <div className="text-xs text-gray-500">{p.id}</div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-gray-600 p-3">No hay productos en esta categoría.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
