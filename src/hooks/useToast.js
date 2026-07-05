import { useCallback, useEffect, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState({
    show: false,
    ok: true,
    text: "",
    actionLabel: "",
    onAction: null,
  });
  const timerRef = useRef(null);

  const showToast = useCallback(
    ({ ok = true, text = "", ms = 2200, actionLabel = "", onAction = null } = {}) => {
    clearTimeout(timerRef.current);
      setToast({ show: true, ok, text, actionLabel, onAction });

      timerRef.current = setTimeout(() => {
        setToast((t) => ({ ...t, show: false, actionLabel: "", onAction: null }));
      }, ms);
    },
    []
  );

  const hideToast = useCallback(() => {
    clearTimeout(timerRef.current);
    setToast((t) => ({ ...t, show: false, actionLabel: "", onAction: null }));
  }, []);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return { toast, showToast, hideToast };
}
