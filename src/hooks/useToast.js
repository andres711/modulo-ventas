import { useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState({ show: false, ok: true, text: "" });
  const timerRef = useRef(null);

  function showToast({ ok = true, text = "", ms = 2200 } = {}) {
    clearTimeout(timerRef.current);
    setToast({ show: true, ok, text });

    timerRef.current = setTimeout(() => {
      setToast(t => ({ ...t, show: false }));
    }, ms);
  }

  function hideToast() {
    clearTimeout(timerRef.current);
    setToast(t => ({ ...t, show: false }));
  }

  return { toast, showToast, hideToast };
}
