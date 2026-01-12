export default function Toast({ show, ok = true, text = "", onClose }) {
  return (
    <div
      className={[
        "fixed z-[60] left-1/2 -translate-x-1/2 top-4",
        "transition-all duration-200",
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
      ].join(" ")}
      role="status"
      aria-live="polite"
      onClick={onClose}
    >
      <div
        className={[
          "card px-4 py-3",
          "shadow-md",
          ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50",
        ].join(" ")}
      >
        <div className={["text-sm font-semibold", ok ? "text-emerald-800" : "text-rose-800"].join(" ")}>
          {text}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">Tocá para cerrar</div>
      </div>
    </div>
  );
}
