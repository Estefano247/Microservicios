import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';

const THRESHOLDS = { CRITICAL: 3, LOW: 10 };

function getStatus(cantidad, minStock) {
  if (cantidad == null || cantidad <= 0) return { label: 'Agotado', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', bar: 'bg-red-500' };
  if (cantidad <= THRESHOLDS.CRITICAL) return { label: 'Crítico', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', bar: 'bg-red-500' };
  if (cantidad <= (minStock || THRESHOLDS.LOW)) return { label: 'Bajo', badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500', bar: 'bg-amber-500' };
  return { label: 'Normal', badge: 'bg-brand-100 text-brand-800', dot: 'bg-brand-600', bar: 'bg-brand-500' };
}

function StockBar({ cantidad, minStock, maxStock, barColor }) {
  const safeMax = maxStock || 200;
  const pct = Math.min(((cantidad || 0) / safeMax) * 100, 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line">
      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.max(pct, 3)}%` }} />
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className={`mt-1 font-display text-3xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export default function InventoryManager() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadInventory = () => {
    setLoading(true);
    api.inventory.list()
      .then((res) => setInventory(Array.isArray(res) ? res : []))
      .catch(() => setInventory([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadInventory(); }, []);

  const adjustStock = async (item, type) => {
    const q = prompt(`Cantidad a ${type === 'add' ? 'agregar' : 'reducir'} (${item.productName || 'Producto #' + item.productId}):`, '1');
    if (!q || isNaN(parseInt(q)) || parseInt(q) <= 0) return;
    try {
      if (type === 'add') await api.inventory.add(item.id, parseInt(q));
      else await api.inventory.reduce(item.id, parseInt(q));
      loadInventory();
    } catch (e) { alert(e.message); }
  };

  const filtered = inventory.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (item.productName && item.productName.toLowerCase().includes(q))
      || item.productId?.toString().includes(q)
      || item.id?.toString().includes(q);
  });

  const lowStockCount = inventory.filter((i) => (i.cantidad ?? 0) <= (i.minStock || THRESHOLDS.LOW)).length;
  const outOfStockCount = inventory.filter((i) => (i.cantidad ?? 0) <= 0).length;

  if (loading) return <PageLoader />;

  return (
    <div>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Inventario</h1>
          <p className="mt-1 text-sm text-muted">Control de stock de productos físicos.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto o ID…" className="input w-56 pl-9" />
          </div>
          <button onClick={loadInventory} className="btn btn-secondary" aria-label="Recargar">
            <Icon name="refresh" className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total de productos" value={inventory.length} tone="text-ink" />
        <StatCard label="Stock bajo / crítico" value={lowStockCount} tone={lowStockCount > 0 ? 'text-amber-600' : 'text-brand-600'} />
        <StatCard label="Agotados" value={outOfStockCount} tone={outOfStockCount > 0 ? 'text-red-600' : 'text-brand-600'} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-soft text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-semibold">Producto</th>
                <th className="px-5 py-3 text-right font-semibold">Stock</th>
                <th className="w-40 px-5 py-3 font-semibold">Nivel</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Ubicación</th>
                <th className="px-5 py-3 text-right font-semibold">Ajustar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((item) => {
                const status = getStatus(item.cantidad, item.minStock);
                return (
                  <tr key={item.id} className="transition-colors hover:bg-surface-soft">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink">{item.productName || '—'}</p>
                      <p className="text-xs text-muted">Producto #{item.productId} · Reg. #{item.id}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-lg font-bold ${item.cantidad <= 0 ? 'text-red-600' : item.cantidad <= THRESHOLDS.CRITICAL ? 'text-red-500' : 'text-ink'}`}>
                        {item.cantidad ?? 0}
                      </span>
                      {item.minStock != null && <span className="ml-1 text-xs text-muted">/ min {item.minStock}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <StockBar cantidad={item.cantidad} minStock={item.minStock} maxStock={item.maxStock} barColor={status.bar} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${status.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} /> {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{item.ubicacion || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => adjustStock(item, 'add')} className="inline-flex items-center gap-1 rounded-lg border border-brand-200 px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50">
                          <Icon name="plus" className="w-3.5 h-3.5" /> Entrada
                        </button>
                        <button onClick={() => adjustStock(item, 'reduce')} disabled={!item.cantidad || item.cantidad <= 0}
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-surface-soft disabled:opacity-40">
                          <Icon name="minus" className="w-3.5 h-3.5" /> Salida
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState icon="box" title={search ? 'Sin resultados' : 'Sin registros de inventario'} description={search ? 'Prueba con otro término de búsqueda.' : undefined} />
        )}
      </div>
    </div>
  );
}
