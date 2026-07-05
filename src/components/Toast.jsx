export default function Toast({
  show,
  text = "",
  actionLabel = "",
  onAction = null,
  onClose,
}) {
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
          "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
        ].join(" ")}
      >
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {text}
        </div>
        {actionLabel && onAction ? (
          <button
            type="button"
            className={[
              "mt-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition",
              "border border-slate-300 bg-slate-100 text-slate-950 hover:bg-slate-200 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200",
            ].join(" ")}
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
          >
            {actionLabel}
          </button>
        ) : null}
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Tocá para cerrar</div>
      </div>
    </div>
  );
}
