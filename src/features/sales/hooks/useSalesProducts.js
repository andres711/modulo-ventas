import { useCallback, useEffect, useState } from "react";
import { getProducts } from "../../products/api";
import { sleep } from "../../../lib/ui";

export function useSalesProducts({ showToast, onStatusChange } = {}) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const refresh = useCallback(async () => {
    const start = Date.now();
    setLoadingProducts(true);

    try {
      const nextProducts = await getProducts();
      setProducts(nextProducts);
      onStatusChange?.({ text: "", ok: true });
    } catch (error) {
      const text = error?.message || String(error);
      onStatusChange?.({ text, ok: false });
      showToast?.({ ok: false, text });
    } finally {
      const elapsed = Date.now() - start;
      const min = 250;
      if (elapsed < min) await sleep(min - elapsed);
      setLoadingProducts(false);
    }
  }, [onStatusChange, showToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    products,
    setProducts,
    loadingProducts,
    refresh,
  };
}
