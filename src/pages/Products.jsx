import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductFormDrawer from "../components/products/ProductFormDrawer";
import ProductGrid from "../components/products/ProductGrid";
import {
  DEFAULT_PRODUCT_CATEGORY,
  DEFAULT_PRODUCT_UNIT,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
} from "../entities/product/constants";
import Toast from "../components/Toast";
import { deleteProduct, getProducts, upsertProduct } from "../features/products/api";
import { uploadProductImage } from "../features/products/uploadProductImage";
import { useToast } from "../hooks/useToast";
import { sleep, vibrate } from "../lib/ui";

export default function Products() {
  const { toast, showToast, hideToast } = useToast();
  const searchInputRef = useRef(null);
  const productButtonRefs = useRef(new Map());
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState(DEFAULT_PRODUCT_CATEGORY);
  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [form, setForm] = useState({
    id: "",
    categoria: DEFAULT_PRODUCT_CATEGORY,
    nombre: "",
    precio: "",
    costo: "",
    unidad: DEFAULT_PRODUCT_UNIT,
    stock: "",
    imagenUrl: "",
    descripcion: "",
    activo: true,
  });

  const fileInputRef = useRef(null);

  const refresh = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const p = await getProducts({ includeInactive: true });
      setProducts(p);
    } catch (e) {
      showToast({ ok: false, text: e.message });
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products
      .filter((p) => (q ? true : p.categoria === activeCat))
      .filter((p) => {
        if (!q) return true;
        const name = (p.nombre || "").toLowerCase();
        const desc = (p.descripcion || "").toLowerCase();
        const id = String(p.id || "").toLowerCase();
        return name.includes(q) || desc.includes(q) || id.includes(q);
      });
  }, [products, activeCat, search]);

  const isGlobalSearch = search.trim().length > 0;

  const focusSearch = useCallback(() => {
    requestAnimationFrame(() => {
      const input = searchInputRef.current;
      if (!input) return;

      input.scrollIntoView({ block: "center", behavior: "smooth" });
      input.focus({ preventScroll: true });
      input.select();
    });
  }, []);

  const clearAndFocusSearch = useCallback(() => {
    setSearch("");
    focusSearch();
  }, [focusSearch]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
  }, []);

  const handleEscapeAction = useCallback(() => {
    if (formOpen) {
      closeForm();
      return;
    }

    clearAndFocusSearch();
  }, [clearAndFocusSearch, closeForm, formOpen]);

  useEffect(() => {
    function handleWindowKeyDown(e) {
      if (e.key !== "Escape") return;

      e.preventDefault();
      handleEscapeAction();
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [handleEscapeAction]);

  function getFocusableProductButtons() {
    return filtered
      .map((product) => ({
        id: product.id,
        element: productButtonRefs.current.get(product.id),
      }))
      .filter((item) => item.element);
  }

  function getGridRows() {
    const buttons = getFocusableProductButtons();
    const rows = [];
    const tolerance = 8;

    for (const button of buttons) {
      const top = button.element.offsetTop;
      const lastRow = rows[rows.length - 1];

      if (!lastRow || Math.abs(lastRow.top - top) > tolerance) {
        rows.push({ top, items: [button] });
        continue;
      }

      lastRow.items.push(button);
    }

    return rows;
  }

  function focusProductButton(productId) {
    const button = productButtonRefs.current.get(productId);
    if (!button) return;

    requestAnimationFrame(() => {
      button.focus();
      button.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  function moveCatalogFocus(currentProductId, direction) {
    const rows = getGridRows();
    if (rows.length === 0) return;

    const rowIndex = rows.findIndex((row) =>
      row.items.some((item) => item.id === currentProductId)
    );
    if (rowIndex < 0) return;

    const colIndex = rows[rowIndex].items.findIndex((item) => item.id === currentProductId);
    if (colIndex < 0) return;

    let nextId = null;

    if (direction === "left" && colIndex > 0) {
      nextId = rows[rowIndex].items[colIndex - 1].id;
    }

    if (direction === "right" && colIndex < rows[rowIndex].items.length - 1) {
      nextId = rows[rowIndex].items[colIndex + 1].id;
    }

    if (direction === "up" && rowIndex > 0) {
      const nextRow = rows[rowIndex - 1].items;
      nextId = nextRow[Math.min(colIndex, nextRow.length - 1)].id;
    }

    if (direction === "down" && rowIndex < rows.length - 1) {
      const nextRow = rows[rowIndex + 1].items;
      nextId = nextRow[Math.min(colIndex, nextRow.length - 1)].id;
    }

    if (nextId) {
      focusProductButton(nextId);
    }
  }

  function focusFirstVisibleProduct() {
    const firstProduct = filtered[0];
    if (!firstProduct) return;
    focusProductButton(firstProduct.id);
  }

  function handleSearchKeyDown(e) {
    if (e.key !== "ArrowDown") return;
    if (filtered.length === 0) return;

    e.preventDefault();
    focusFirstVisibleProduct();
  }

  function handleCatalogKeyDownCapture(e) {
    if (e.key !== "Escape") return;

    const productButton = e.target.closest?.('[data-catalog-product="true"]');
    if (!productButton) return;

    e.preventDefault();
    e.stopPropagation();
    handleEscapeAction();
  }

  function handleProductKeyDown(e, productId) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleEscapeAction();
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveCatalogFocus(productId, "left");
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveCatalogFocus(productId, "right");
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveCatalogFocus(productId, "up");
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveCatalogFocus(productId, "down");
    }
  }

  function openNew() {
    setMsg({ text: "", ok: true });
    setForm({
      id: "",
      categoria: activeCat,
      nombre: "",
      precio: "",
      costo: "",
      unidad: DEFAULT_PRODUCT_UNIT,
      stock: "",
      imagenUrl: "",
      descripcion: "",
      activo: true,
    });
    setFormOpen(true);
  }

  function openEdit(p) {
    const rawPrice = Number(p.precio);
    const rawCost = Number(p.costo);

    setMsg({ text: "", ok: true });
    setForm({
      id: p.id,
      categoria: p.categoria,
      nombre: p.nombre,
      precio: Number.isFinite(rawPrice) ? String(Math.round(rawPrice)) : "",
      costo:
        p.costo === "" ? "" : Number.isFinite(rawCost) ? String(Math.round(rawCost)) : String(p.costo ?? ""),
      unidad: String(p.unidad || "UN").toUpperCase(),
      stock: String(p.stock ?? ""),
      imagenUrl: p.imagenUrl || "",
      descripcion: p.descripcion || "",
      activo: !!p.activo,
    });
    setFormOpen(true);
  }

  function updateFormField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
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

    const precioRaw = Number(String(form.precio).replace(",", "."));
    const precio = Math.round(precioRaw);
    const stock = Number(String(form.stock).replace(",", "."));
    const costoRaw = String(form.costo ?? "").trim();
    const costoParsed = costoRaw === "" ? undefined : Number(costoRaw.replace(",", "."));
    const costo = costoParsed === undefined ? undefined : Math.round(costoParsed);
    const unidad = String(form.unidad || "UN").toUpperCase().trim();

    if (!PRODUCT_UNITS.includes(unidad)) {
      setMsg({ text: "Unidad inválida", ok: false });
      showToast({ ok: false, text: "Unidad inválida" });
      vibrate(60);
      return false;
    }
    if (!Number.isFinite(precioRaw) || precioRaw < 0) {
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
    if (costoParsed !== undefined && (!Number.isFinite(costoParsed) || costoParsed < 0)) {
      setMsg({ text: "Costo inválido", ok: false });
      showToast({ ok: false, text: "Costo inválido" });
      vibrate(60);
      return false;
    }

    setSaving(true);

    try {
      await upsertProduct({
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
      const up = await uploadProductImage(file);
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

  async function saveAndClose() {
    const ok = await save();
    if (!ok) return;

    await sleep(200);
    setFormOpen(false);
    setMsg({ text: "", ok: true });
  }

  async function deleteAndClose() {
    const sure = window.confirm(`¿Eliminar "${form.nombre}"?`);
    if (!sure) return;

    setSaving(true);
    try {
      await deleteProduct(form.id);
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
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-[110rem] px-3 pb-20 md:pb-6">
        {/* En mobile compensa el header fijo; en desktop queda alineado al shell */}
        <div className="sticky top-20 z-30 -mx-3 border-b border-slate-200 bg-slate-50/90 px-3 pb-2 pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:top-6">
          <section className="card p-4" onKeyDownCapture={handleCatalogKeyDownCapture}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-lg font-bold">Productos</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Buscá por nombre o ID. Tocá para editar. Flechas para recorrer. “+” para crear.
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
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />

              {isGlobalSearch ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  Búsqueda global activa. Se están mostrando resultados de todas las categorías.
                </div>
              ) : null}

              {/* Categorías: 3 por fila como Sales */}
              <div className={`grid grid-cols-3 gap-2 transition sm:grid-cols-4 ${isGlobalSearch ? "opacity-60" : "opacity-100"}`}>
                {PRODUCT_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveCat(c);
                        setForm((f) => ({ ...f, categoria: c }));
                      }}
                    className={`btn px-2 py-2 leading-tight min-h-[44px] whitespace-normal break-words ${
                      c === activeCat ? "btn-primary" : ""
                    }`}
                    title={isGlobalSearch ? "La búsqueda actual recorre todas las categorías" : undefined}
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
          <ProductGrid
            loading={loadingProducts}
            products={filtered}
            onEdit={openEdit}
            productButtonRefs={productButtonRefs}
            onProductKeyDown={handleProductKeyDown}
            showCategory={isGlobalSearch}
          />
        </section>

        <ProductFormDrawer
          open={formOpen}
          form={form}
          categories={PRODUCT_CATEGORIES}
          units={PRODUCT_UNITS}
          saving={saving}
          uploadingImg={uploadingImg}
          msg={msg}
          fileInputRef={fileInputRef}
          onClose={closeForm}
          onSave={saveAndClose}
          onDelete={deleteAndClose}
          onPickImage={onPickImage}
          onFormChange={updateFormField}
        />

        <Toast show={toast.show} ok={toast.ok} text={toast.text} onClose={hideToast} />
      </div>
    </div>
  );
}
