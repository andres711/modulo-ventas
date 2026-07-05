import Drawer from "../Drawer";
import { isKgUnit } from "../../entities/product/model";
import { formatMoney, getNameInitials } from "../../lib/format";

function formatPreviewPrice(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? formatMoney(parsed) : "Sin precio";
}

export default function ProductFormDrawer({
  open,
  form,
  categories,
  units,
  saving,
  uploadingImg,
  msg,
  fileInputRef,
  onClose,
  onSave,
  onDelete,
  onPickImage,
  onFormChange,
}) {
  const productName = String(form.nombre || "").trim() || "Nuevo producto";
  const previewImageUrl = String(form.imagenUrl || "").trim();
  const isKg = isKgUnit(form.unidad);

  return (
    <Drawer
      open={open}
      title={form.id ? "Editar producto" : "Nuevo producto"}
      onClose={onClose}
      cardClassName="border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50"
      headerClassName="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      bodyClassName="bg-transparent"
      footerClassName="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      footer={
        <div className="grid gap-2">
          <button
            disabled={saving}
            onClick={onSave}
            className={`btn btn-primary w-full py-3 ${saving ? "opacity-70" : ""}`}
          >
            {saving ? "Guardando..." : form.id ? "Guardar cambios" : "Crear producto"}
          </button>

          {form.id && (
            <button
              disabled={saving}
              onClick={onDelete}
              className="btn btn-danger w-full py-3"
            >
              Eliminar
            </button>
          )}

          {msg.text && (
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {msg.text}
            </p>
          )}
        </div>
      }
    >
      <div className="grid gap-4">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 dark:shadow-slate-950/30">
          <div className="flex items-start gap-3">
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt={productName}
                className="h-20 w-20 rounded-2xl border border-slate-200 bg-slate-100 object-cover dark:border-slate-700 dark:bg-slate-800"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-2xl border border-slate-200 bg-slate-100 text-2xl font-black tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                {getNameInitials(productName)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-900 dark:bg-slate-700 dark:text-slate-100">
                  {isKg ? "KG" : "UN"}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${form.activo ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"}`}>
                  {form.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="mt-2 truncate text-lg font-bold text-slate-900 dark:text-slate-100">{productName}</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {form.categoria || "Sin categoría"}
                {form.id ? ` • ID ${form.id}` : " • ID pendiente"}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
                  {formatPreviewPrice(form.precio)}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  Stock {String(form.stock || "").trim() || "-"}{isKg ? " kg" : ""}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/30">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Identidad
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm text-slate-600 dark:text-slate-400">ID (opcional)</label>
              <input
                className="input"
                value={form.id}
                onChange={(e) => onFormChange("id", e.target.value)}
                placeholder="Ej: 111 o P-AB12CD34"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-slate-600 dark:text-slate-400">Categoría</label>
              <select
                className="input"
                value={form.categoria}
                onChange={(e) => onFormChange("categoria", e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-slate-600 dark:text-slate-400">Nombre</label>
            <input
              className="input"
              value={form.nombre}
              onChange={(e) => onFormChange("nombre", e.target.value)}
              placeholder="Ej: Milanesa pechuga"
            />
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/30">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Venta y stock
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm text-slate-600 dark:text-slate-400">Unidad</label>
              <select
                className="input"
                value={form.unidad}
                onChange={(e) => onFormChange("unidad", e.target.value)}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-slate-600 dark:text-slate-400">Precio de venta</label>
              <input
                className="input"
                inputMode="numeric"
                value={form.precio}
                onChange={(e) => onFormChange("precio", e.target.value)}
                placeholder="7999"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-slate-600 dark:text-slate-400">
                Stock {isKg ? "(kg)" : ""}
              </label>
              <input
                className="input"
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => onFormChange("stock", e.target.value)}
                placeholder="12"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-slate-600 dark:text-slate-400">Costo (opcional)</label>
              <input
                className="input"
                inputMode="numeric"
                value={form.costo}
                onChange={(e) => onFormChange("costo", e.target.value)}
                placeholder="Ej: 5200"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/30">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Imagen
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className={`btn ${uploadingImg ? "pointer-events-none opacity-70" : ""}`}>
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
            <span className="text-xs text-slate-500 dark:text-slate-400">Cámara o archivo</span>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-slate-600 dark:text-slate-400">Imagen URL</label>
            <input
              className="input"
              value={form.imagenUrl}
              onChange={(e) => onFormChange("imagenUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>

          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt="Vista previa del producto"
              className="h-44 w-full rounded-2xl border border-slate-200 bg-slate-100 object-cover dark:border-slate-700 dark:bg-slate-800"
            />
          ) : (
            <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
              Sin imagen cargada
            </div>
          )}
        </section>

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/30">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Detalle
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-slate-600 dark:text-slate-400">Descripción</label>
            <textarea
              className="input"
              rows={4}
              value={form.descripcion}
              onChange={(e) => onFormChange("descripcion", e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
            <input
              type="checkbox"
              checked={!!form.activo}
              onChange={(e) => onFormChange("activo", e.target.checked)}
            />
            Producto activo
          </label>
        </section>
      </div>
    </Drawer>
  );
}
