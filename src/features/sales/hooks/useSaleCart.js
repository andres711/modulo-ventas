import { useCallback, useMemo, useRef, useState } from "react";
import { isKgUnit } from "../../../entities/product/model";
import { formatStock } from "../../../lib/format";

export function useSaleCart({ setMsg, showToast, vibrate }) {
  const lastRemovedItemRef = useRef(null);
  const [cart, setCart] = useState(() => new Map());

  const cartItems = useMemo(() => {
    return Array.from(cart.values()).sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }, [cart]);

  const total = useMemo(() => {
    let nextTotal = 0;

    for (const item of cartItems) {
      nextTotal += isKgUnit(item.producto?.unidad)
        ? Number(item.total || 0)
        : Number(item.producto?.precio || 0) * Number(item.cantidad || 0);
    }

    return nextTotal;
  }, [cartItems]);

  const cartSummary = useMemo(() => {
    return cartItems.reduce(
      (summary, item) => {
        if (isKgUnit(item.producto?.unidad)) {
          summary.kgCount += Number(item.cantidad || 0);
        } else {
          summary.unitCount += Number(item.cantidad || 0);
        }

        return summary;
      },
      { unitCount: 0, kgCount: 0 }
    );
  }, [cartItems]);

  const addUnitProduct = useCallback(
    (product, { onAdded } = {}) => {
      let added = false;

      setCart((prev) => {
        const next = new Map(prev);
        const current = next.get(product.id);
        const nextQty = (current ? Number(current.cantidad || 0) : 0) + 1;

        if (nextQty > Number(product.stock || 0)) {
          const text = `Stock insuficiente (${formatStock(product.stock, product.unidad)})`;
          setMsg({ text, ok: false });
          showToast({ ok: false, text });
          vibrate(80);
          return prev;
        }

        next.set(product.id, {
          producto: product,
          cantidad: nextQty,
          addedAt: Date.now(),
          total: undefined,
        });

        added = true;
        setMsg({ text: "", ok: true });
        showToast({ ok: true, text: "Agregado" });
        vibrate(30);
        return next;
      });

      if (added) {
        onAdded?.();
      }
    },
    [setMsg, showToast, vibrate]
  );

  const setQty = useCallback(
    (productId, qty) => {
      setCart((prev) => {
        const next = new Map(prev);
        const item = next.get(productId);
        if (!item) return prev;

        let value = Number(qty);
        if (!Number.isFinite(value) || value < 1) value = 1;

        const stock = Number(item.producto?.stock || 0);
        if (value > stock) {
          value = stock;
          setMsg({ text: `Ajusté cantidad al stock (${value}).`, ok: false });
          showToast({ ok: false, text: `Ajustado a stock (${value})` });
          vibrate(50);
        } else {
          setMsg({ text: "", ok: true });
        }

        next.set(productId, { ...item, cantidad: value, addedAt: Date.now() });
        showToast({ ok: true, text: "Actualizado" });
        vibrate(20);
        return next;
      });
    },
    [setMsg, showToast, vibrate]
  );

  const restoreRemovedItem = useCallback(() => {
    const removedItem = lastRemovedItemRef.current;
    if (!removedItem) return;

    setCart((prev) => {
      const next = new Map(prev);
      const current = next.get(removedItem.producto.id);

      if (!current) {
        next.set(removedItem.producto.id, {
          ...removedItem,
          addedAt: Date.now(),
        });
        return next;
      }

      const isKg = isKgUnit(removedItem.producto.unidad);

      next.set(removedItem.producto.id, {
        ...current,
        cantidad: Number(current.cantidad || 0) + Number(removedItem.cantidad || 0),
        total: isKg
          ? Number((Number(current.total || 0) + Number(removedItem.total || 0)).toFixed(2))
          : undefined,
        addedAt: Date.now(),
      });

      return next;
    });

    lastRemovedItemRef.current = null;
    setMsg({ text: "", ok: true });
    showToast({ ok: true, text: "Producto restaurado", ms: 1800 });
  }, [setMsg, showToast]);

  const remove = useCallback(
    (productId) => {
      setCart((prev) => {
        const removedItem = prev.get(productId);
        if (!removedItem) return prev;

        const next = new Map(prev);
        next.delete(productId);

        lastRemovedItemRef.current = removedItem;
        showToast({
          ok: true,
          text: `${removedItem.producto.nombre} quitado`,
          ms: 5000,
          actionLabel: "Deshacer",
          onAction: restoreRemovedItem,
        });

        return next;
      });
    },
    [restoreRemovedItem, showToast]
  );

  const resetCart = useCallback(() => {
    setCart(new Map());
    lastRemovedItemRef.current = null;
  }, []);

  const clearCart = useCallback(() => {
    if (cart.size === 0) return;

    resetCart();
    setMsg({ text: "", ok: true });
    showToast({ ok: true, text: "Carrito vaciado", ms: 1800 });
  }, [cart.size, resetCart, setMsg, showToast]);

  return {
    cart,
    setCart,
    cartItems,
    total,
    cartSummary,
    addUnitProduct,
    setQty,
    remove,
    clearCart,
    resetCart,
  };
}
