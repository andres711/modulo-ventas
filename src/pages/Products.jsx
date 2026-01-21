import { useEffect, useMemo, useRef, useState } from "react";
import Drawer from "../components/Drawer";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";
import { useToast } from "../hooks/useToast";
import { uploadToCloudinary } from "../uploadCloudinary";

const CATEGORIES = ["Polleria", "Congelados", "Almacen", "Bebidas"];
const UNITS = ["UN", "KG"];

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
      unidad: String(p.unidad || "UN").toUpperCase().trim(),
      precio: Number(p.precio || 0),
      costo: p.costo === "" || p.costo === null || p.costo === undefined ? "" : Number(p.costo || 0),
      stock: Number(p.stock || 0),
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

async function apiDeleteProduct(id) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "product_delete", id }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Error eliminando producto");
  return json;
}


export default function Products() {
  const { toast, showToast, hideToast } = useToast();
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState("Polleria");
  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({
    id: "",
    categoria: "Polleria",
    nombre: "",
    precio: "",
    costo: "",
    unidad: "UN",
    stock: "",
    imagenUrl: "",
    descripcion: "",
    activo: true,
  });

  const fileInputRef = useRef(null);

  function vibrate(ms = 40) {
    try {
      if (navigator?.vibrate) navigator.vibrate(ms);
    } catch (e) {
      e;
    }
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function refresh() {
    setLoadingProducts(true);
    try {
      const p = await apiGetProducts();
      setProducts(p);
    } catch (e) {
      showToast({ ok: false, text: e.message });
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => p.categoria === activeCat)
      .filter((p) => {
        if (!q) return true;
        const name = (p.nombre || "").toLowerCase();
        const desc = (p.descripcion || "").toLowerCase();
        const id = String(p.id || "").toLowerCase();
        return name.includes(q) || desc.includes(q) || id.includes(q);
      });
  }, [products, activeCat, search]);

  function openNew() {
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

  function openEdit(p) {
    setMsg({ text: "", ok: true });
    setForm({
      id: p.id,
      categoria: p.categoria,
      nombre: p.nombre,
      precio: String(p.precio ?? ""),
      costo: p.costo === "" ? "" : String(p.costo ?? ""),
      unidad: String(p.unidad || "UN").toUpperCase(),
      stock: String(p.stock ?? ""),
      imagenUrl: p.imagenUrl || "",
      descripcion: p.descripcion || "",
      activo: !!p.activo,
    });
    setFormOpen(true);
  }

  async function save() {
    if (!form.categoria) {
      setMsg({ text: "Categoría requerida", ok: false });
      showToast({ ok: false, text: "Categoría requerida" });
      vibrate(60);
      return false;
    }
    if (!form.nombre.trim()) {
      setMsg({ text: "Nombre requerido", ok: false });
      showToast({ ok: false, text: "Nombre requerido" });
      vibrate(60);
      return false;
    }

    const precio = Number(String(form.precio).replace(",", "."));
    const stock = Number(String(form.stock).replace(",", "."));
    const costoRaw = String(form.costo ?? "").trim();
    const costo = costoRaw === "" ? undefined : Number(costoRaw.replace(",", "."));
    const unidad = String(form.unidad || "UN").toUpperCase().trim();

    if (!UNITS.includes(unidad)) {
      setMsg({ text: "Unidad inválida", ok: false });
      showToast({ ok: false, text: "Unidad inválida" });
      vibrate(60);
      return false;
    }
    if (!Number.isFinite(precio) || precio < 0) {
      setMsg({ text: "Precio inválido", ok: false });
      showToast({ ok: false, text: "Precio inválido" });
      vibrate(60);
      return false;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setMsg({ text: "Stock inválido", ok: false });
      showToast({ ok: false, text: "Stock inválido" });
      vibrate(60);
      return false;
    }
    if (costo !== undefined && (!Number.isFinite(costo) || costo < 0)) {
      setMsg({ text: "Costo inválido", ok: false });
      showToast({ ok: false, text: "Costo inválido" });
      vibrate(60);
      return false;
    }

    setSaving(true);

    try {
      await apiUpsertProduct({
        id: form.id || undefined,
        categoria: form.categoria,
        nombre: form.nombre.trim(),
        precio,
        costo: costo === undefined ? "" : costo,
        unidad,
        stock,
        imagenUrl: String(form.imagenUrl || "").trim(),
        descripcion: String(form.descripcion || "").trim(),
        activo: form.activo,
      });



      showToast({ ok: true, text: "Producto guardado ✅" });
      vibrate(25);

      await refresh();
      return true;
    } catch (e) {
      showToast({ ok: false, text: e.message });
      vibrate(80);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function onPickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImg(true);
      const up = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, imagenUrl: up.url }));
      showToast({ ok: true, text: "Imagen subida ✅" });
      vibrate(20);
    } catch (err) {
      showToast({ ok: false, text: String(err?.message || err) });
      vibrate(60);
    } finally {
      setUploadingImg(false);
      e.target.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-3 pb-20 md:pb-6">
        {/* 🔒 Sticky toolbar debajo del header fijo (AppLayout usa pt-20) */}
        <div className="sticky top-20 z-30 -mx-3 px-3 pt-3 pb-2 bg-slate-50/90 backdrop-blur border-b border-slate-200">
          <section className="card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-lg font-bold">Productos</div>
                <div className="text-xs text-slate-500">
                  Buscá por nombre o ID. Tocá para editar. “+” para crear.
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button className="btn" onClick={refresh} disabled={loadingProducts}>
                  {loadingProducts ? "Actualizando..." : "Actualizar"}
                </button>

                <button
                  onClick={openNew}
                  className="btn btn-primary px-3"
                  aria-label="Nuevo producto"
                  title="Nuevo producto"
                >
                  <span className="text-xl leading-none">+</span>
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              <input
                className="input"
                placeholder="Buscar por nombre o ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Categorías: 3 por fila como Sales */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveCat(c);
                      setForm((f) => ({ ...f, categoria: c }));
                    }}
                    className={`btn px-2 py-2 leading-tight min-h-[44px] whitespace-normal break-words ${
                      c === activeCat ? "btn-primary" : ""
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Lista */}
        <section className="mt-4 card p-4">
          {loadingProducts ? (
            <Spinner label="Cargando productos..." />
          ) : filtered.length === 0 ? (
            <div className="card p-4 bg-slate-50 border-slate-200">
              <div className="font-semibold">No hay productos</div>
              <div className="text-sm text-slate-600">
                Probá otra categoría o creá uno con “+”.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((p) => {
                const isKg = String(p.unidad || "UN").toUpperCase() === "KG";
                return (
                  <button
                    key={p.id}
                    onClick={() => openEdit(p)}
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
                      <div className="text-sm text-slate-700">
                        {money(p.precio)} {isKg ? "/ kg" : ""} • Stock {p.stock}
                        {isKg ? " kg" : ""}
                      </div>
                      <div className="text-xs text-slate-500">ID: {p.id}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Drawer: alta/edición */}
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

            {/* ✅ Eliminar SOLO si es edición */}
            {form.id && (
              <button
                disabled={saving}
                onClick={async () => {
                  const sure = window.confirm(`¿Eliminar "${form.nombre}"?`);
                  if (!sure) return;

                  setSaving(true);
                  try {
                    await apiDeleteProduct(form.id);
                    showToast({ ok: true, text: "Producto eliminado ✅" });
                    vibrate(25);
                    await refresh();
                    await sleep(150);
                    setFormOpen(false);
                  } catch (e) {
                    showToast({ ok: false, text: e.message });
                    vibrate(80);
                  } finally {
                    setSaving(false);
                  }
                }}
                className="btn btn-danger w-full py-3"
              >
                Eliminar
              </button>
            )}

            {msg.text && (
              <p className={`text-sm ${msg.ok ? "text-emerald-700" : "text-rose-700"}`}>
                {msg.text}
              </p>
            )}
          </div>
        }

        >
          <div className="grid gap-2">
            {/* ID */}
            <label className="text-sm text-slate-600">ID (opcional)</label>
            <input
              className="input"
              value={form.id}
              onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
              placeholder="Ej: 111 o P-AB12CD34"
            />

            {/* Categoría */}
            <label className="text-sm text-slate-600">Categoría</label>
            <select
              className="input"
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* Nombre */}
            <label className="text-sm text-slate-600">Nombre</label>
            <input
              className="input"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Milanesa pechuga"
            />

            {/* Unidad */}
            <label className="text-sm text-slate-600">Unidad</label>
            <select
              className="input"
              value={form.unidad}
              onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            {/* Precio / Stock */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-slate-600">Precio</label>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.precio}
                  onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                  placeholder="7999"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">
                  Stock {String(form.unidad || "UN").toUpperCase() === "KG" ? "(kg)" : ""}
                </label>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  placeholder="12"
                />
              </div>
            </div>

            {/* Costo (opcional) */}
            <label className="text-sm text-slate-600">Costo (opcional)</label>
            <input
              className="input"
              inputMode="numeric"
              value={form.costo}
              onChange={(e) => setForm((f) => ({ ...f, costo: e.target.value }))}
              placeholder="Ej: 5200"
            />

            {/* Subir foto */}
            <label className="text-sm text-slate-600">Foto del producto</label>
            <div className="flex items-center gap-2">
              <label className={`btn ${uploadingImg ? "opacity-70 pointer-events-none" : ""}`}>
                {uploadingImg ? "Subiendo..." : "Subir foto"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={onPickImage}
                />
              </label>
              <span className="text-xs text-slate-500">Cámara o archivo</span>
            </div>

            {/* URL */}
            <label className="text-sm text-slate-600">Imagen URL</label>
            <input
              className="input"
              value={form.imagenUrl}
              onChange={(e) => setForm((f) => ({ ...f, imagenUrl: e.target.value }))}
              placeholder="https://..."
            />

            {String(form.imagenUrl || "").trim() && (
              <img
                src={String(form.imagenUrl).trim()}
                alt="preview"
                className="w-full h-40 object-cover rounded-2xl border bg-slate-100"
              />
            )}

            {/* Descripción */}
            <label className="text-sm text-slate-600">Descripción</label>
            <textarea
              className="input"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Opcional"
            />

            {/* Activo */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.activo}
                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              />
              Producto activo
            </label>

            {msg.text && (
              <p className={`text-sm ${msg.ok ? "text-emerald-700" : "text-rose-700"}`}>
                {msg.text}
              </p>
            )}
          </div>
        </Drawer>

        <Toast show={toast.show} ok={toast.ok} text={toast.text} onClose={hideToast} />
      </div>
    </div>
  );
}
