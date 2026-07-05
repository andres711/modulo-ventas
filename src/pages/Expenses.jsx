import { useEffect, useRef, useState } from "react";
import Toast from "../components/Toast";
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "../entities/payment/constants";
import { createExpense } from "../features/expenses/api";
import { EXPENSE_CATEGORIES } from "../features/expenses/constants";
import { uploadExpenseReceipt } from "../features/expenses/uploadExpenseReceipt";
import { useToast } from "../hooks/useToast";

const PANEL_CLASS = "card border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40";
const CARD_CLASS = "card border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-slate-950/40";

export default function Expenses() {
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const receiptPreviewRef = useRef("");
  const { toast, showToast, hideToast } = useToast();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    categoria: "Mercadería",
    descripcion: "",
    monto: "",
    medioPago: DEFAULT_PAYMENT_METHOD,
    observacion: "",
  });

  useEffect(() => {
    return () => {
      if (receiptPreviewRef.current) {
        URL.revokeObjectURL(receiptPreviewRef.current);
      }
    };
  }, []);

  function updateReceiptPreview(file) {
    if (receiptPreviewRef.current) {
      URL.revokeObjectURL(receiptPreviewRef.current);
      receiptPreviewRef.current = "";
    }

    setReceiptFile(file);

    if (!file) {
      setReceiptPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    receiptPreviewRef.current = previewUrl;
    setReceiptPreview(previewUrl);
  }

async function submit(e) {
  e.preventDefault();

  if (!form.descripcion.trim()) {
    showToast({ ok: false, text: "Ingresá una descripción" });
    return;
  }

  if (!form.monto || Number(String(form.monto).replace(",", ".")) <= 0) {
    showToast({ ok: false, text: "Ingresá un monto válido" });
    return;
  }

  setSaving(true);

  try {
    let comprobanteUrl = "";
    let comprobantePublicId = "";

    if (receiptFile) {
        const uploaded = await uploadExpenseReceipt(receiptFile);
      comprobanteUrl = uploaded.url;
      comprobantePublicId = uploaded.publicId;
    }

    await createExpense({
      ...form,
      comprobanteUrl,
      comprobantePublicId,
    });

    showToast({ ok: true, text: "Gasto registrado" });

    setForm({
        categoria: "Mercadería",
        descripcion: "",
        monto: "",
        medioPago: DEFAULT_PAYMENT_METHOD,
        observacion: "",
      });

    updateReceiptPreview(null);
  } catch (e) {
    showToast({ ok: false, text: e.message });
  } finally {
    setSaving(false);
  }
}

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-3 pb-20 md:pb-6">
        <div className="sticky top-20 z-30 -mx-3 border-b border-slate-200 bg-slate-50/90 px-3 pb-2 pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:top-6">
          <section className={`${PANEL_CLASS} p-4`}>
            <div>
              <div className="text-lg font-bold">Gastos</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Registrá egresos del negocio con comprobante opcional.
              </div>
            </div>
          </section>
        </div>

        <section className={`mt-4 ${CARD_CLASS} p-4 md:p-5`}>
          <div className="mb-4">
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Nuevo gasto</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Completá el formulario y registrá el gasto al instante.
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/30 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">Categoría</label>
                <select
                  className="input"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, categoria: e.target.value }))
                  }
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">Medio de pago</label>
                <select
                  className="input"
                  value={form.medioPago}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, medioPago: e.target.value }))
                  }
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">Descripción</label>
                <input
                  className="input"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, descripcion: e.target.value }))
                  }
                  placeholder="Ej: compra de bolsas, luz, internet..."
                />
              </div>

              <div>
                <label className="text-sm text-slate-600 dark:text-slate-400">Monto</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monto}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, monto: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm text-slate-600 dark:text-slate-400">Observación</label>
                <input
                  className="input"
                  value={form.observacion}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, observacion: e.target.value }))
                  }
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/30">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Comprobante
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Podés adjuntar una imagen para dejar respaldo del gasto.
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className={`btn ${saving ? "pointer-events-none opacity-70" : ""}`}>
                  Subir comprobante
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      updateReceiptPreview(file);
                    }}
                  />
                </label>

                {receiptPreview ? (
                  <button type="button" className="btn" onClick={() => updateReceiptPreview(null)}>
                    Quitar
                  </button>
                ) : null}
              </div>

              {receiptPreview ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60">
                  <img
                    src={receiptPreview}
                    alt="Vista previa comprobante"
                    className="h-48 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="grid h-36 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
                  Sin comprobante cargado
                </div>
              )}
            </div>

            <div>
              <button
                className="btn btn-primary w-full sm:w-auto"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Registrar gasto"}
              </button>
            </div>
          </form>
        </section>

        <Toast show={toast.show} ok={toast.ok} text={toast.text} onClose={hideToast} />
      </div>
    </div>
  );
}
