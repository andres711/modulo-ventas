import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Toast from "../components/Toast";
import { PAYMENT_METHODS } from "../entities/payment/constants";
import { DEFAULT_PRODUCT_CATEGORY } from "../entities/product/constants";
import { isKgUnit, roundStockForUnit } from "../entities/product/model";
import { createSale } from "../features/sales/api";
import { useKgSaleFlow } from "../features/sales/hooks/useKgSaleFlow";
import { useSaleCart } from "../features/sales/hooks/useSaleCart";
import { useSalePayments } from "../features/sales/hooks/useSalePayments";
import { useSalesProducts } from "../features/sales/hooks/useSalesProducts";
import ClearCartConfirmDrawer from "../features/sales/ui/ClearCartConfirmDrawer";
import KgSaleDrawer from "../features/sales/ui/KgSaleDrawer";
import SalesCatalogPanel from "../features/sales/ui/SalesCatalogPanel";
import SalesDesktopCartPanel from "../features/sales/ui/SalesDesktopCartPanel";
import SalesMobileCartDrawer from "../features/sales/ui/SalesMobileCartDrawer";
import { useToast } from "../hooks/useToast";
import { formatMoney } from "../lib/format";
import { sleep, vibrate } from "../lib/ui";

const QUICK_MODE_STORAGE_KEY = "sales.quickMode";
const QUICK_MODE_HELP_SEEN_STORAGE_KEY = "sales.quickModeHelpSeen";
const QUICK_MODE_HELP_OPEN_STORAGE_KEY = "sales.quickModeHelpOpen";
const QUICK_MODE_DEFAULT_PAYMENT_METHOD = PAYMENT_METHODS[2];

function getInitialQuickMode() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(QUICK_MODE_STORAGE_KEY) === "true";
}

function hasSeenQuickModeHelp() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(QUICK_MODE_HELP_SEEN_STORAGE_KEY) === "true";
}

function getInitialQuickModeHelpOpen() {
  if (typeof window === "undefined") return false;

  const savedValue = window.localStorage.getItem(QUICK_MODE_HELP_OPEN_STORAGE_KEY);
  if (savedValue === null) {
    return getInitialQuickMode();
  }

  return savedValue === "true";
}

function markQuickModeHelpAsSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUICK_MODE_HELP_SEEN_STORAGE_KEY, "true");
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true']")
  );
}

export default function Sales() {
  const { toast, showToast, hideToast } = useToast();
  const searchInputRef = useRef(null);
  const productButtonRefs = useRef(new Map());

  // UI filters
  const [activeCat, setActiveCat] = useState(DEFAULT_PRODUCT_CATEGORY);
  const [search, setSearch] = useState("");

  // Cart
  const [cartOpen, setCartOpen] = useState(false);
  const [cartDetailsOpen, setCartDetailsOpen] = useState(false);
  const [clearCartConfirmOpen, setClearCartConfirmOpen] = useState(false);

  // Sale meta
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [quickMode, setQuickMode] = useState(getInitialQuickMode);
  const [quickModeHelpOpen, setQuickModeHelpOpen] = useState(getInitialQuickModeHelpOpen);
  const [quickModeCheckoutExpanded, setQuickModeCheckoutExpanded] = useState(false);

  // Saving sale
  const [savingSale, setSavingSale] = useState(false);

  const focusSearch = useCallback(() => {
    requestAnimationFrame(() => {
      const input = searchInputRef.current;
      if (!input) return;

      input.scrollIntoView({ block: "center", behavior: "smooth" });
      input.focus({ preventScroll: true });
      input.select();
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  const clearAndFocusSearch = useCallback(() => {
    clearSearch();
    focusSearch();
  }, [clearSearch, focusSearch]);

  const closeCart = useCallback(() => {
    setCartOpen(false);
  }, []);

  const closeClearCartConfirm = useCallback(() => {
    setClearCartConfirmOpen(false);
  }, []);

  const openQuickModeHelp = useCallback(() => {
    setQuickModeHelpOpen(true);
  }, []);

  const toggleQuickModeHelp = useCallback(() => {
    setQuickModeHelpOpen((prev) => !prev);
  }, []);

  const setQuickModeEnabled = useCallback(
    (nextQuickMode) => {
      setQuickMode(nextQuickMode);
      setQuickModeCheckoutExpanded(false);

      if (!nextQuickMode) {
        showToast({ ok: true, text: "Caja rapida desactivada" });
        return;
      }

      if (!hasSeenQuickModeHelp()) {
        markQuickModeHelpAsSeen();
        setQuickModeHelpOpen(true);
        showToast({
          ok: true,
          text: "Caja rapida activada. Alt+Enter confirma y Alt+1/2/3 cambia el cobro.",
          ms: 5200,
          actionLabel: "Ver atajos",
          onAction: openQuickModeHelp,
        });
        return;
      }

      showToast({ ok: true, text: "Caja rapida activada" });
    },
    [openQuickModeHelp, showToast]
  );

  const toggleQuickMode = useCallback(() => {
    setQuickModeEnabled(!quickMode);
  }, [quickMode, setQuickModeEnabled]);

  const { products, setProducts, loadingProducts, refresh } = useSalesProducts({
    showToast,
    onStatusChange: setMsg,
  });

  const {
    cart,
    setCart,
    cartItems,
    total,
    cartSummary,
    addUnitProduct,
    setQty,
    remove,
    clearCart: clearCartState,
    resetCart,
  } = useSaleCart({ setMsg, showToast, vibrate });

  const {
    paymentDrafts,
    paymentOrder,
    obs,
    setObs,
    paymentBreakdown,
    paymentDifference,
    togglePaymentMethod,
    setPaymentAmount,
    selectSinglePaymentMethod,
    resetPayments,
  } = useSalePayments(total);

  const handleSelectPaymentShortcut = useCallback(
    (method) => {
      setQuickModeCheckoutExpanded(false);
      selectSinglePaymentMethod(method);
    },
    [selectSinglePaymentMethod]
  );

  const {
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
  } = useKgSaleFlow({
    setCart,
    setMsg,
    showToast,
    vibrate,
    focusSearch,
    clearSearch,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((product) => (q ? true : product.categoria === activeCat))
      .filter((product) => {
        if (!q) return true;
        const name = (product.nombre || "").toLowerCase();
        const id = String(product.id || "").toLowerCase();
        const desc = (product.descripcion || "").toLowerCase();
        return name.includes(q) || id.includes(q) || desc.includes(q);
      });
  }, [activeCat, products, search]);

  const isGlobalSearch = search.trim().length > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(QUICK_MODE_STORAGE_KEY, String(quickMode));
  }, [quickMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(QUICK_MODE_HELP_OPEN_STORAGE_KEY, String(quickModeHelpOpen));
  }, [quickModeHelpOpen]);

  useEffect(() => {
    if (!quickMode) return;
    if (cartItems.length === 0) return;
    if (paymentBreakdown.length > 0) return;

    selectSinglePaymentMethod(QUICK_MODE_DEFAULT_PAYMENT_METHOD);
  }, [cartItems.length, paymentBreakdown.length, quickMode, selectSinglePaymentMethod]);

  useEffect(() => {
    if (paymentBreakdown.length > 1) {
      setQuickModeCheckoutExpanded(true);
    }
  }, [paymentBreakdown.length]);

  const handleEscapeAction = useCallback(() => {
    if (clearCartConfirmOpen) {
      closeClearCartConfirm();
      return;
    }

    if (kgOpen) {
      closeKgModal();
      return;
    }

    if (cartOpen) {
      closeCart();
      return;
    }

    clearAndFocusSearch();
  }, [
    cartOpen,
    clearAndFocusSearch,
    clearCartConfirmOpen,
    closeCart,
    closeClearCartConfirm,
    closeKgModal,
    kgOpen,
  ]);

  useEffect(() => {
    if (cartItems.length > 0) return;
    setCartDetailsOpen(false);
    setClearCartConfirmOpen(false);
    setQuickModeCheckoutExpanded(false);
    resetPayments();
    setMsg({ text: "", ok: true });
  }, [cartItems.length, resetPayments]);

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

  // -------------------------
  // Cart actions
  // -------------------------
  const applySaleToLocalProducts = useCallback((items) => {
    setProducts((prev) =>
      prev.map((product) => {
        const soldItem = items.find((item) => item.producto.id === product.id);
        if (!soldItem) return product;

        const soldQty = Number(soldItem.cantidad || 0);
        const nextStock = Math.max(Number(product.stock || 0) - soldQty, 0);

        return {
          ...product,
          stock: roundStockForUnit(nextStock, product.unidad),
        };
      })
    );
  }, [setProducts]);

  function addToCart(p) {
    if (Number(p.stock || 0) <= 0) {
      setMsg({ text: "Sin stock.", ok: false });
      showToast({ ok: false, text: "Sin stock." });
      vibrate(60);
      return;
    }

    if (isKgUnit(p.unidad)) {
      openAddKg(p);
      return;
    }

    addUnitProduct(p, {
      onAdded: () => {
        clearSearch();
        focusSearch();
      },
    });
  }

  function toggleCartDetails() {
    if (cart.size === 0) return;
    setCartDetailsOpen((prev) => !prev);
  }

  function requestClearCart() {
    if (cart.size === 0) return;
    setClearCartConfirmOpen(true);
  }

  // -------------------------
  // Save sale
  // -------------------------
  const saveSale = useCallback(async () => {
    if (cart.size === 0) {
      setMsg({ text: "", ok: true });
      showToast({ ok: false, text: "No hay productos seleccionados" });
      vibrate(60);
      return false;
    }

    if (paymentBreakdown.length === 0) {
      setMsg({ text: "Seleccioná al menos un medio de pago.", ok: false });
      showToast({ ok: false, text: "Seleccioná al menos un medio de pago." });
      vibrate(60);
      return false;
    }

    const invalidPayment = paymentBreakdown.find(
      (payment) => !Number.isFinite(payment.amount) || payment.amount <= 0
    );
    if (invalidPayment) {
      const text = `Monto inválido en ${invalidPayment.method}`;
      setMsg({ text, ok: false });
      showToast({ ok: false, text });
      vibrate(60);
      return false;
    }

    if (Math.abs(paymentDifference) >= 0.009) {
      const text =
        paymentDifference > 0
          ? `Faltan asignar ${formatMoney(paymentDifference)}`
          : `Los medios superan el total por ${formatMoney(Math.abs(paymentDifference))}`;
      setMsg({ text, ok: false });
      showToast({ ok: false, text });
      vibrate(60);
      return false;
    }

    setSavingSale(true);
    try {
      setMsg({ text: "Guardando venta...", ok: true });

      const pagos = paymentBreakdown.map((payment) => ({
        medioPago: payment.method,
        monto: Number(payment.amount.toFixed(2)),
      }));

      const mainPayment = [...pagos].sort((a, b) => b.monto - a.monto)[0];
      const secondaryPayments = pagos.filter((payment) => payment.medioPago !== mainPayment.medioPago);

      const medioPago = mainPayment.medioPago;

      const mixedPaymentNote = secondaryPayments.length
        ? `Pago mixto: ${secondaryPayments.map((payment) => `${payment.medioPago} ${formatMoney(payment.monto)}`).join(" + ")}`
        : "";

      const observacion = [obs.trim(), mixedPaymentNote].filter(Boolean).join(" | ");

      const saleItems = Array.from(cart.values());
      const items = saleItems.map((it) => ({
        productoId: it.producto.id,
        cantidad: it.cantidad,
        total: it.total, // solo KG
      }));

      await createSale({ items, medioPago, observacion });

      applySaleToLocalProducts(saleItems);
      resetCart();
      clearSearch();
      resetPayments();
      setQuickModeCheckoutExpanded(false);
      setMsg({ text: "Venta guardada ✅", ok: true });
      showToast({ ok: true, text: "Venta guardada ✅" });
      vibrate(35);
      focusSearch();
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
  }, [
    applySaleToLocalProducts,
    cart,
    clearSearch,
    focusSearch,
    obs,
    paymentBreakdown,
    paymentDifference,
    resetCart,
    resetPayments,
    showToast,
  ]);

  const saveSaleAndCloseCart = useCallback(async () => {
    const ok = await saveSale();
    if (!ok) return;

    await sleep(200);
    setCartOpen(false);
    setMsg({ text: "", ok: true });
    focusSearch();
  }, [focusSearch, saveSale]);

  function clearCart() {
    if (cart.size === 0) return;

    clearCartState();
    setCartDetailsOpen(false);
    setClearCartConfirmOpen(false);
    setQuickModeCheckoutExpanded(false);
  }

  useEffect(() => {
    function handleWindowKeyDown(e) {
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        saveSaleAndCloseCart();
        return;
      }

      if (
        !e.ctrlKey
        && !e.altKey
        && !e.metaKey
        && e.key.toLowerCase() === "b"
        && !isEditableTarget(e.target)
        && !clearCartConfirmOpen
        && !kgOpen
        && !cartOpen
      ) {
        e.preventDefault();
        clearAndFocusSearch();
        return;
      }

      if (e.altKey) {
        const paymentShortcuts = {
          Digit1: PAYMENT_METHODS[0],
          Numpad1: PAYMENT_METHODS[0],
          Digit2: PAYMENT_METHODS[1],
          Numpad2: PAYMENT_METHODS[1],
          Digit3: PAYMENT_METHODS[2],
          Numpad3: PAYMENT_METHODS[2],
        };
        const selectedMethod = paymentShortcuts[e.code];

        if (selectedMethod) {
          e.preventDefault();
          handleSelectPaymentShortcut(selectedMethod);
          return;
        }

        if (e.code === "KeyQ") {
          e.preventDefault();
          toggleQuickMode();
          return;
        }
      }

      if (e.key !== "Escape") return;

      e.preventDefault();
      handleEscapeAction();
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [cartOpen, clearAndFocusSearch, clearCartConfirmOpen, handleEscapeAction, handleSelectPaymentShortcut, kgOpen, saveSaleAndCloseCart, toggleQuickMode]);

  const quickModeExpanded = quickModeCheckoutExpanded || paymentBreakdown.length > 1;

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <SalesCatalogPanel
        onKeyDownCapture={handleCatalogKeyDownCapture}
        activeCat={activeCat}
        cartItemsCount={cartItems.length}
        onOpenCart={() => setCartOpen(true)}
        refresh={refresh}
        loadingProducts={loadingProducts}
        search={search}
        searchInputRef={searchInputRef}
        onSearchChange={setSearch}
        onSearchKeyDown={handleSearchKeyDown}
        isGlobalSearch={isGlobalSearch}
        onSelectCategory={setActiveCat}
        filtered={filtered}
        productButtonRefs={productButtonRefs}
        addToCart={addToCart}
        onProductKeyDown={handleProductKeyDown}
        quickMode={quickMode}
        onQuickModeChange={toggleQuickMode}
        quickModeHelpOpen={quickModeHelpOpen}
        onToggleQuickModeHelp={toggleQuickModeHelp}
      />

      <SalesDesktopCartPanel
        cartItems={cartItems}
        cartSummary={cartSummary}
        total={total}
        cartDetailsOpen={cartDetailsOpen}
        toggleCartDetails={toggleCartDetails}
        saveSale={saveSale}
        requestClearCart={requestClearCart}
        savingSale={savingSale}
        openEditKg={openEditKg}
        remove={remove}
        setQty={setQty}
        paymentDrafts={paymentDrafts}
        paymentOrder={paymentOrder}
        obs={obs}
        paymentDifference={paymentDifference}
        togglePaymentMethod={togglePaymentMethod}
        setPaymentAmount={setPaymentAmount}
        setObs={setObs}
        msg={msg}
        quickMode={quickMode}
        quickModeExpanded={quickModeExpanded}
        onToggleQuickModeExpanded={() => setQuickModeCheckoutExpanded((prev) => !prev)}
      />

      <SalesMobileCartDrawer
        cartOpen={cartOpen}
        closeCart={closeCart}
        total={total}
        cartItems={cartItems}
        paymentDrafts={paymentDrafts}
        paymentOrder={paymentOrder}
        savingSale={savingSale}
        msg={msg}
        paymentDifference={paymentDifference}
        saveSaleAndCloseCart={saveSaleAndCloseCart}
        paymentBreakdown={paymentBreakdown}
        cartSummary={cartSummary}
        cartDetailsOpen={cartDetailsOpen}
        toggleCartDetails={toggleCartDetails}
        requestClearCart={requestClearCart}
        openEditKg={openEditKg}
        remove={remove}
        setQty={setQty}
        obs={obs}
        togglePaymentMethod={togglePaymentMethod}
        setPaymentAmount={setPaymentAmount}
        setObs={setObs}
        quickMode={quickMode}
        quickModeExpanded={quickModeExpanded}
        onToggleQuickModeExpanded={() => setQuickModeCheckoutExpanded((prev) => !prev)}
      />

      <ClearCartConfirmDrawer
        open={clearCartConfirmOpen}
        onClose={closeClearCartConfirm}
        onConfirm={clearCart}
        cartItemsCount={cartItems.length}
        cartSummary={cartSummary}
        total={total}
      />

      <KgSaleDrawer
        open={kgOpen}
        kgProduct={kgProduct}
        closeKgModal={closeKgModal}
        confirmKgSale={confirmKgSale}
        kgMode={kgMode}
        kgTotal={kgTotal}
        setKgTotal={setKgTotal}
        estimatedKg={estimatedKg}
      />

      <Toast
        show={toast.show}
        ok={toast.ok}
        text={toast.text}
        actionLabel={toast.actionLabel}
        onAction={toast.onAction}
        onClose={hideToast}
      />
    </div>
  );
}
