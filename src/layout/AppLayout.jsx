import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "app.sidebarCollapsed";
const THEME_STORAGE_KEY = "app.theme";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function SalesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M7 4v6m10-6v6M6 11h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9-4 9 4-9 4-9-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9 4 9-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10.5v6L12 20l7-3.5v-6" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16v-3" />
    </svg>
  );
}

function ExpensesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v16H6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 16h3" />
    </svg>
  );
}

function applyTheme(theme) {
  if (typeof window === "undefined") return;

  const root = window.document.documentElement;
  const body = window.document.body;
  const appRoot = window.document.getElementById("root");
  const isDarkTheme = theme === "dark";

  root.classList.toggle("dark", isDarkTheme);
  body.classList.toggle("dark", isDarkTheme);
  appRoot?.classList.toggle("dark", isDarkTheme);
  root.dataset.theme = theme;
  body.dataset.theme = theme;
  if (appRoot) appRoot.dataset.theme = theme;
  root.style.colorScheme = theme;
  body.style.colorScheme = theme;
  if (appRoot) appRoot.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function ThemeToggleButton({ theme, onThemeChange, className = "", compact = false }) {
  return (
    <div
      role="group"
      aria-label="Selector de tema"
      className={[
        compact
          ? "inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white p-1 text-sm dark:border-slate-700 dark:bg-slate-900"
          : "inline-flex min-w-[9rem] items-center gap-1 rounded-full border border-slate-300 bg-white p-1 text-sm dark:border-slate-700 dark:bg-slate-900",
        className,
      ].join(" ")}
    >
      <button
        type="button"
        className={[
          compact
            ? "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition"
            : "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition",
          theme === "light"
            ? "bg-slate-100 text-slate-950 border border-slate-300"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        ].join(" ")}
        onClick={() => onThemeChange("light")}
        aria-pressed={theme === "light"}
        aria-label="Tema claro"
        title="Tema claro"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
        </svg>
        {!compact ? "Claro" : null}
      </button>
      <button
        type="button"
        className={[
          compact
            ? "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition"
            : "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition",
          theme === "dark"
            ? "bg-slate-100 text-slate-950 border border-slate-300 dark:border-slate-100"
            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        ].join(" ")}
        onClick={() => onThemeChange("dark")}
        aria-pressed={theme === "dark"}
        aria-label="Tema oscuro"
        title="Tema oscuro"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
        {!compact ? "Oscuro" : null}
      </button>
    </div>
  );
}

const NAV_SECTIONS = [
  {
    title: "Operaciones",
    items: [
      { to: "/ventas", label: "Ventas", hint: "Caja y carrito", icon: <SalesIcon /> },
      { to: "/gastos", label: "Gastos", hint: "Egresos del negocio", icon: <ExpensesIcon /> },
    ],
  },
  {
    title: "Gestion",
    items: [
      { to: "/productos", label: "Productos", hint: "Catalogo y stock", icon: <ProductsIcon /> },
      { to: "/dashboard", label: "Dashboard", hint: "Metricas y reportes", icon: <DashboardIcon /> },
    ],
  },
];

const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

function NavItem({ to, label, hint, icon, onClick, collapsed = false }) {
  return (
    <NavLink
      to={to}
      end
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
          collapsed ? "justify-center px-2" : "",
          isActive
            ? "border-slate-300 bg-slate-100 text-slate-950 shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:shadow-slate-950/40"
            : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        ].join(" ")
      }
      onClick={onClick}
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition",
              isActive
                ? "border-slate-300 bg-white text-slate-900 dark:border-slate-950/10 dark:bg-slate-950/10 dark:text-slate-950"
                : "border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:border-slate-600 dark:group-hover:text-slate-100",
            ].join(" ")}
          >
            {icon}
          </span>

          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{label}</span>
              <span
                className={[
                  "block truncate text-xs",
                  isActive ? "text-slate-300 dark:text-slate-700" : "text-slate-500 dark:text-slate-400",
                ].join(" ")}
              >
                {hint}
              </span>
            </span>
          ) : null}

          {!collapsed ? (
            <span
              className={[
                "h-2.5 w-2.5 shrink-0 rounded-full transition",
                isActive ? "bg-slate-400 dark:bg-slate-500" : "bg-slate-200 group-hover:bg-slate-300 dark:bg-slate-700 dark:group-hover:bg-slate-600",
              ].join(" ")}
            />
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
  });

  const currentItem =
    NAV_ITEMS.find(({ to }) => location.pathname.startsWith(to)) || NAV_ITEMS[0];
  const isSalesRoute = location.pathname.startsWith("/ventas");
  const isProductsRoute = location.pathname.startsWith("/productos");
  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const brand = (collapsed = false) => (
    <div className={["flex items-center min-w-0", collapsed ? "justify-center" : "gap-3"].join(" ")}>
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 font-bold text-slate-950 shadow-sm dark:bg-slate-100 dark:text-slate-950 dark:shadow-slate-950/40">
        IS
      </div>
      {!collapsed ? (
        <div className="min-w-0 leading-tight">
          <div className="truncate font-bold text-slate-900 dark:text-slate-100">IlSupremo</div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">Ventas & Stock</div>
        </div>
      ) : null}
    </div>
  );

  const navigation = (onItemClick, collapsed = false) => (
    <div className="grid gap-6">
      {NAV_SECTIONS.map((section) => (
        <section key={section.title} className="grid gap-2">
          {!collapsed ? (
            <div className="px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              {section.title}
            </div>
          ) : null}
          <nav className="grid gap-1.5">
            {section.items.map((item) => (
              <NavItem key={item.to} {...item} onClick={onItemClick} collapsed={collapsed} />
            ))}
          </nav>
        </section>
      ))}
    </div>
  );

  return (
    <div className={[theme === "dark" ? "dark" : "", "min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950"].join(" ")}>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <button
            type="button"
            className="btn px-3"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">{brand()}</div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggleButton theme={theme} onThemeChange={setTheme} className="px-1" />
            <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {currentItem.label}
            </div>
          </div>
        </div>
      </header>

      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-white transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-950 lg:flex lg:flex-col",
          sidebarCollapsed ? "w-24" : "w-72",
        ].join(" ")}
      >
        <div className={["border-b border-slate-200 dark:border-slate-800", sidebarCollapsed ? "px-3 py-5" : "px-5 py-5"].join(" ")}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">{brand(sidebarCollapsed)}</div>
            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label={sidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
                title={sidebarCollapsed ? "Expandir" : "Colapsar"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={["h-4 w-4 transition-transform", sidebarCollapsed ? "rotate-180" : ""].join(" ")}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className={["flex-1 overflow-y-auto py-5", sidebarCollapsed ? "px-2" : "px-4"].join(" ")}>
          {navigation(undefined, sidebarCollapsed)}
        </div>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className={["rounded-2xl bg-slate-100 dark:bg-slate-900/80", sidebarCollapsed ? "px-2 py-2" : "px-4 py-3"].join(" ")}>
            {!sidebarCollapsed ? (
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Tema
              </div>
            ) : null}
            <div className={sidebarCollapsed ? "flex justify-center" : "flex"}>
              <ThemeToggleButton theme={theme} onThemeChange={setTheme} compact />
            </div>
          </div>
        </div>
      </aside>

      <div
        className={[
          "fixed inset-0 z-50 bg-slate-950/30 transition-opacity lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setMenuOpen(false)}
      >
        <aside
          className={[
            "h-full w-72 max-w-[85vw] border-r border-slate-200 bg-white px-4 py-4 transition-transform dark:border-slate-800 dark:bg-slate-950",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            {brand()}
            <div className="flex items-center gap-2">
              <ThemeToggleButton theme={theme} onThemeChange={setTheme} className="px-1" />
              <button
                type="button"
                className="btn px-3"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menu"
              >
                Cerrar
              </button>
            </div>
          </div>
          <div className="overflow-y-auto pb-4">{navigation(() => setMenuOpen(false))}</div>
        </aside>
      </div>

      <main
        className={[
          "px-3 py-4 pt-20 transition-[margin] duration-200 lg:px-6 lg:py-6",
          sidebarCollapsed ? "lg:ml-24" : "lg:ml-72",
        ].join(" ")}
      >
        <div className={["mx-auto", isSalesRoute || isProductsRoute ? "max-w-[110rem]" : "max-w-6xl"].join(" ")}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
