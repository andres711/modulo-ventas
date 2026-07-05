import { useEffect, useRef } from "react";

export default function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
  cardClassName = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
}) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const frameId = window.requestAnimationFrame(() => {
      bodyRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Modal centrado */}
      <div
        className={[
          "fixed inset-0 z-50 flex items-center justify-center",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div
          className={[
            "w-full max-w-lg mx-auto px-3",
            "transition-transform duration-200",
            open ? "scale-100 opacity-100" : "scale-95 opacity-0",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()} // evita cerrar al clickear dentro
        >
          {/* Card */}
          <div className={`card overflow-hidden max-h-[85vh] flex flex-col ${cardClassName}`}>
            {/* Header fijo */}
            <div className={`flex items-center justify-between gap-2 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 ${headerClassName}`}>
              <div className="font-bold truncate">{title}</div>
              <button className="btn shrink-0" onClick={onClose}>
                Cerrar
              </button>
            </div>

            {/* Body scrolleable */}
            <div ref={bodyRef} className={`flex-1 overflow-auto p-4 ${bodyClassName}`}>
              {children}
            </div>

            {/* Footer fijo */}
            {footer ? (
              <div className={`border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 ${footerClassName}`}>
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
