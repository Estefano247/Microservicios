import { NavLink, Outlet, Link } from 'react-router-dom';
import Icon from '../../components/ui/Icon';

function analyticsUrl() {
  const token = localStorage.getItem('token');
  const base = '/analytics';
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

const NAV = [
  { to: '/admin', label: 'Resumen', icon: 'dashboard', end: true },
  { to: '/admin/products', label: 'Productos', icon: 'book' },
  { to: '/admin/inventory', label: 'Inventario', icon: 'box' },
  { to: '/admin/orders', label: 'Pedidos', icon: 'receipt' },
  { to: '/admin/users', label: 'Usuarios', icon: 'users' },
  { to: analyticsUrl(), label: 'Analítica', icon: 'chartBar', external: true },
];

function NavItem({ item, onClick }) {
  if (item.external) {
    return (
      <a
        href={item.to}
        onClick={onClick}
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors text-ink/70 hover:bg-brand-50 hover:text-brand-700"
        target="_self"
      >
        <Icon name={item.icon} className="w-5 h-5" />
        {item.label}
      </a>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-ink/70 hover:bg-brand-50 hover:text-brand-700'
        }`
      }
    >
      <Icon name={item.icon} className="w-5 h-5" />
      {item.label}
    </NavLink>
  );
}

export default function AdminLayout() {
  return (
    <div className="page py-6 lg:py-8">
      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 flex items-center gap-2 px-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Icon name="dashboard" className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none text-ink">Administración</p>
              <p className="mt-1 text-xs text-muted">Panel de gestión</p>
            </div>
          </div>

          {/* Nav — horizontal en móvil, vertical en escritorio */}
          <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {NAV.map((item) => (
              <div key={item.to} className="shrink-0 lg:shrink">
                <NavItem item={item} />
              </div>
            ))}
          </nav>

          <Link to="/" className="mt-4 hidden items-center gap-2 px-3.5 text-sm text-muted hover:text-brand-700 lg:flex">
            <Icon name="arrowLeft" className="w-4 h-4" /> Volver a la tienda
          </Link>
        </aside>

        {/* Contenido */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
