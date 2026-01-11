export default function Drawer({ open, title, onClose, children, footer }) {
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

      {/* Panel */}
      <div
        className={[
          "fixed inset-x-0 bottom-0 z-50",
          "transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto max-w-6xl px-3 pb-3">
          <div className="card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-200 bg-white">
              <div className="font-bold">{title}</div>
              <button className="btn" onClick={onClose}>Cerrar</button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-auto p-4">
              {children}
            </div>

            {/* Footer */}
            {footer ? (
              <div className="border-t border-slate-200 bg-white p-4">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
