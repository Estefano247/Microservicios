import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import Icon from '../../components/ui/Icon';

const LOW_STOCK_THRESHOLD = 10;

function MetricCard({ icon, label, value, tone = 'brand', loading, hint }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-50 text-accent-600',
    sky: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon name={icon} className="w-5 h-5" />
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-muted">{label}</p>
      {loading ? (
        <div className="skeleton mt-1 h-9 w-16 rounded" />
      ) : (
        <p className="mt-0.5 font-display text-3xl font-semibold text-ink">{value}</p>
      )}
      {hint && !loading && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const QUICK = [
  { title: 'Productos', desc: 'Gestiona el catálogo de libros', link: '/admin/products', icon: 'book' },
  { title: 'Inventario', desc: 'Controla el stock disponible', link: '/admin/inventory', icon: 'box' },
  { title: 'Pedidos', desc: 'Revisa y actualiza pedidos', link: '/admin/orders', icon: 'receipt' },
  { title: 'Usuarios', desc: 'Administra las cuentas', link: '/admin/users', icon: 'users' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, lowStock: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.products.list({ page: 0, size: 1 }).catch(() => ({})),
      api.orders.listAll({ page: 0, size: 1 }).catch(() => ({})),
      api.users.adminList({ page: 0, size: 1 }).catch(() => ({})),
      api.inventory.list().catch(() => []),
    ]).then(([p, o, u, inv]) => {
      const invArr = Array.isArray(inv) ? inv : [];
      setStats({
        products: p.totalElements ?? 0,
        orders: o.totalElements ?? 0,
        users: u.totalElements ?? 0,
        lowStock: invArr.filter((i) => (i.cantidad ?? 0) <= (i.minStock || LOW_STOCK_THRESHOLD)).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">Resumen</h1>
        <p className="mt-1 text-sm text-muted">Vista general de la operación de la tienda.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard icon="book" label="Productos" value={stats.products} tone="brand" loading={loading} />
        <MetricCard icon="receipt" label="Pedidos" value={stats.orders} tone="accent" loading={loading} />
        <MetricCard icon="users" label="Usuarios" value={stats.users} tone="sky" loading={loading} />
        <MetricCard icon="alert" label="Stock bajo" value={stats.lowStock} tone="amber" loading={loading} hint={stats.lowStock > 0 ? 'Requiere reposición' : 'Todo en orden'} />
      </div>

      <h2 className="mb-3 mt-10 font-display text-xl font-semibold text-ink">Accesos rápidos</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUICK.map((c) => (
          <Link key={c.title} to={c.link} className="card group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
              <Icon name={c.icon} className="w-6 h-6" />
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-ink group-hover:text-brand-700">{c.title}</h3>
              <p className="text-sm text-muted">{c.desc}</p>
            </div>
            <Icon name="chevronRight" className="w-5 h-5 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
