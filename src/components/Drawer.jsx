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
          <div className="card overflow-hidden max-h-[85vh] flex flex-col">
            {/* Header fijo */}
            <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-200 bg-white">
              <div className="font-bold truncate">{title}</div>
              <button className="btn shrink-0" onClick={onClose}>
                Cerrar
              </button>
            </div>

            {/* Body scrolleable */}
            <div className="flex-1 overflow-auto p-4">
              {children}
            </div>

            {/* Footer fijo */}
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
