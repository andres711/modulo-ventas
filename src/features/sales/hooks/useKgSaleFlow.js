import { useCallback, useMemo, useState } from "react";
import { formatStock } from "../../../lib/format";

export function useKgSaleFlow({
  setCart,
  setMsg,
  showToast,
  vibrate,
  focusSearch,
  clearSearch,
}) {
  const [kgOpen, setKgOpen] = useState(false);
  const [kgProduct, setKgProduct] = useState(null);
  const [kgTotal, setKgTotal] = useState("");
  const [kgMode, setKgMode] = useState("ADD");
  const [kgPrev, setKgPrev] = useState({ kg: 0, total: 0 });

  const closeKgModal = useCallback(() => {
    setKgOpen(false);
    setKgMode("ADD");
    setKgPrev({ kg: 0, total: 0 });
    setKgProduct(null);
    setKgTotal("");
  }, []);

  const openAddKg = useCallback((product) => {
    setKgMode("ADD");
    setKgPrev({ kg: 0, total: 0 });
    setKgProduct(product);
    setKgTotal("");
    setKgOpen(true);
  }, []);

  const openEditKg = useCallback((item) => {
    setKgMode("EDIT");
    setKgProduct(item.producto);
    setKgPrev({ kg: Number(item.cantidad || 0), total: Number(item.total || 0) });
    setKgTotal(String(Number(item.total || 0)));
    setKgOpen(true);
  }, []);

  const confirmKgSale = useCallback(() => {
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
      const current = next.get(kgProduct.id);
      const stock = Number(kgProduct.stock || 0);

      if (kgMode === "EDIT") {
        const available = stock + Number(kgPrev.kg || 0);
        if (kg > available + 1e-9) {
          const text = `Stock insuficiente. Disponible: ${formatStock(available)} kg`;
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

        showToast({ ok: true, text: `Editado: ${kgProduct.nombre}` });
        vibrate(25);
        return next;
      }

      const currentKg = current ? Number(current.cantidad || 0) : 0;
      const currentTotal = current ? Number(current.total || 0) : 0;

      const nextKg = Number((currentKg + kg).toFixed(3));
      const nextTotal = Number((currentTotal + totalValue).toFixed(2));

      if (nextKg > stock + 1e-9) {
        const text = `Stock insuficiente. Stock: ${formatStock(stock)} kg`;
        setMsg({ text, ok: false });
        showToast({ ok: false, text });
        vibrate(80);
        return prev;
      }

      next.set(kgProduct.id, {
        producto: kgProduct,
        cantidad: nextKg,
        total: nextTotal,
        addedAt: Date.now(),
      });

      if (kgMode === "ADD") {
        clearSearch?.();
      }

      showToast({ ok: true, text: `Agregado: ${kgProduct.nombre}` });
      vibrate(25);
      return next;
    });

    closeKgModal();
    setMsg({ text: "", ok: true });
    focusSearch?.();
  }, [
    clearSearch,
    closeKgModal,
    focusSearch,
    kgMode,
    kgPrev.kg,
    kgProduct,
    kgTotal,
    setCart,
    setMsg,
    showToast,
    vibrate,
  ]);

  const estimatedKg = useMemo(() => {
    const totalValue = Number(String(kgTotal).replace(",", "."));
    const pricePerKg = Number(kgProduct?.precio || 0);

    if (!Number.isFinite(totalValue) || !Number.isFinite(pricePerKg) || pricePerKg <= 0) {
      return "-";
    }

    return (totalValue / pricePerKg).toFixed(3);
  }, [kgProduct?.precio, kgTotal]);

  return {
    kgOpen,
    kgProduct,
    kgTotal,
    setKgTotal,
    kgMode,
    closeKgModal,
    openAddKg,
    openEditKg,
    confirmKgSale,
    estimatedKg,
  };
}
