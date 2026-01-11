import { NavLink, Outlet } from "react-router-dom";

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
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-3 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">
              IS
            </div>
            <div className="leading-tight">
              <div className="font-bold">IlSupremo</div>
              <div className="text-xs text-slate-500">Ventas & Stock</div>
            </div>
          </div>

          <nav className="flex gap-2">
            <NavItem to="/ventas">Ventas</NavItem>
            <NavItem to="/productos">Productos</NavItem>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 py-4">
        <Outlet />
      </main>
    </div>
  );
}
