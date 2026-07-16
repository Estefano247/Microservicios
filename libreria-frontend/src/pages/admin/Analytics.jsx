import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '../../api/client';
import Icon from '../../components/ui/Icon';
import { CATEGORY_LABELS, TYPE_LABELS, STATUS_LABELS, formatPrice } from '../../constants/catalog';

const COLORS = ['#2563eb', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4'];

function MetricCard({ icon, label, value, tone = 'brand', loading }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-50 text-accent-600',
    sky: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
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
    </div>
  );
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [carts, setCarts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    Promise.all([
      api.users.adminList({ page: 0, size: 10000 }).catch(() => ({ content: [], totalElements: 0 })),
      api.products.list({ page: 0, size: 10000 }).catch(() => ({ content: [], totalElements: 0 })),
      api.inventory.list().catch(() => []),
      api.cart.adminAll().catch(() => []),
      api.orders.listAll({ page: 0, size: 10000 }).catch(() => ({ content: [], totalElements: 0 })),
    ]).then(([usersRes, productsRes, inv, cartData, ordersRes]) => {
      setUsers(usersRes.content || []);
      setTotalUsers(usersRes.totalElements ?? 0);
      setProducts(productsRes.content || []);
      setTotalProducts(productsRes.totalElements ?? 0);
      setInventory(Array.isArray(inv) ? inv : []);
      setCarts(Array.isArray(cartData) ? cartData : []);
      setOrders(ordersRes.content || []);
      setTotalOrders(ordersRes.totalElements ?? 0);
    }).finally(() => setLoading(false));
  }, []);

  const avgPrice = products.length
    ? products.reduce((s, p) => s + Number(p.precio || 0), 0) / products.length
    : 0;

  const lowStockItems = inventory.filter(
    (i) => (i.cantidad ?? 0) <= (i.minStock || 10)
  );

  const cartRows = [];
  for (const cart of carts) {
    for (const item of (cart.items || [])) {
      cartRows.push({
        usuarioId: cart.usuarioId,
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      });
    }
  }
  const uniqueCartUsers = new Set(cartRows.map((r) => r.usuarioId)).size;

  const usersByRole = {};
  users.forEach((u) => {
    const label = u.role === 'ADMIN' ? 'Admin' : u.role === 'CUSTOMER' ? 'Cliente' : u.role || 'Desconocido';
    usersByRole[label] = (usersByRole[label] || 0) + 1;
  });
  const usersByRoleData = Object.entries(usersByRole).map(([name, value]) => ({ name, value }));

  const productsByCategory = {};
  products.forEach((p) => {
    const label = CATEGORY_LABELS[p.categoria] || p.categoria || 'Sin categoría';
    productsByCategory[label] = (productsByCategory[label] || 0) + 1;
  });
  const productsByCategoryData = Object.entries(productsByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const productsByType = {};
  products.forEach((p) => {
    const label = TYPE_LABELS[p.tipo] || p.tipo || 'Desconocido';
    productsByType[label] = (productsByType[label] || 0) + 1;
  });
  const productsByTypeData = Object.entries(productsByType).map(([name, value]) => ({ name, value }));

  const authorCountries = {};
  products.forEach((p) => {
    const pais = p.autor?.paisOrigen;
    if (pais) {
      authorCountries[pais] = (authorCountries[pais] || 0) + 1;
    }
  });
  const authorCountriesData = Object.entries(authorCountries)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const ordersByStatus = {};
  orders.forEach((o) => {
    const label = STATUS_LABELS[o.estado] || o.estado || 'Desconocido';
    ordersByStatus[label] = (ordersByStatus[label] || 0) + 1;
  });
  const ordersByStatusData = Object.entries(ordersByStatus).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">Analítica</h1>
        <p className="mt-1 text-sm text-muted">
          Dashboard consolidado con métricas y gráficos de la tienda.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <MetricCard icon="users" label="Usuarios" value={totalUsers} tone="sky" loading={loading} />
        <MetricCard icon="book" label="Catálogo" value={totalProducts} tone="brand" loading={loading} />
        <MetricCard icon="receipt" label="Órdenes" value={totalOrders} tone="accent" loading={loading} />
        <MetricCard icon="alert" label="Stock bajo" value={lowStockItems.length} tone="amber" loading={loading} />
        <MetricCard icon="cart" label="Con carrito" value={uniqueCartUsers} tone="violet" loading={loading} />
        <MetricCard icon="star" label="Precio prom." value={loading ? '' : formatPrice(avgPrice)} tone="emerald" loading={loading} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Usuarios por rol</h2>
          {usersByRoleData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={usersByRoleData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {usersByRoleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Productos por formato</h2>
          {productsByTypeData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productsByTypeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {productsByTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Productos por categoría</h2>
          {productsByCategoryData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productsByCategoryData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {productsByCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Órdenes por estado</h2>
          {ordersByStatusData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={ordersByStatusData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {ordersByStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {authorCountriesData.length > 0 && (
          <div className="card p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Libros por país del autor</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={authorCountriesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {authorCountriesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Resumen de carritos</h2>
          {loading ? (
            <div className="skeleton h-12 w-full rounded" />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-surface-soft px-4 py-3">
                <span className="text-sm text-muted">Items en carritos</span>
                <span className="font-display text-xl font-semibold text-ink">{cartRows.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-soft px-4 py-3">
                <span className="text-sm text-muted">Usuarios con carrito</span>
                <span className="font-display text-xl font-semibold text-ink">{uniqueCartUsers}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">Alertas de stock</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-soft text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-semibold">Producto</th>
                    <th className="px-5 py-3 text-right font-semibold">Stock actual</th>
                    <th className="px-5 py-3 text-right font-semibold">Stock mínimo</th>
                    <th className="px-5 py-3 text-center font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {lowStockItems.map((item) => {
                    const cant = item.cantidad ?? 0;
                    const min = item.minStock || 10;
                    const isCritical = cant <= 3;
                    const isOut = cant <= 0;
                    const statusClass = isOut
                      ? 'bg-red-100 text-red-700'
                      : isCritical
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800';
                    return (
                      <tr key={item.id} className="transition-colors hover:bg-surface-soft">
                        <td className="px-5 py-3.5 font-medium text-ink">
                          {item.productName || `Producto #${item.productId}`}
                        </td>
                        <td className={`px-5 py-3.5 text-right font-medium ${isOut || isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                          {cant}
                        </td>
                        <td className="px-5 py-3.5 text-right text-muted">{min}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`badge ${statusClass}`}>
                            {isOut ? 'Agotado' : isCritical ? 'Crítico' : 'Bajo'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
