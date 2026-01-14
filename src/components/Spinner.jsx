export default function Spinner({ label = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <div className="app-spinner" aria-hidden="true" />
      <div className="text-sm text-slate-600">{label}</div>
    </div>
  );
}
