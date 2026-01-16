import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        "btn " + (isActive ? "btn-primary" : "btn-ghost")
      }
    >
      {children}
    </NavLink>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar ruta actual para el select en mobile
  const current =
    location.pathname.startsWith("/productos") ? "/productos" : "/ventas";

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold shrink-0">
                IS
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-bold truncate">IlSupremo</div>
                <div className="text-xs text-slate-500 truncate">Ventas & Stock</div>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden sm:flex gap-2">
              <NavItem to="/ventas">Ventas</NavItem>
              <NavItem to="/productos">Productos</NavItem>
              <NavItem to="/dashboard">Dashboard</NavItem>
            </nav>

            {/* Mobile nav (select) */}
            <div className="sm:hidden w-36">
              <select
                className="input py-2 w-full"
                value={current}
                onChange={(e) => navigate(e.target.value)}
              >
                <option value="/ventas">Ventas</option>
                <option value="/productos">Productos</option>
                <option value="/dashboard">Registro Ventas</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* padding-top para compensar header fixed */}
      <main className="max-w-6xl mx-auto px-3 py-4 pt-20">
        <Outlet />
      </main>
    </div>
  );
}
