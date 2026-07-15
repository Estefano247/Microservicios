import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { ORDER_STATUS, STATUS_LABELS, STATUS_BADGE, formatPrice } from '../../constants/catalog';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

export default function OrdersManager() {
  const [orders, setOrders] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [updating, setUpdating] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    api.orders.listAll({ page, size: 10, sort: 'creadoEn,desc' })
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [page]);

  const updateStatus = async (id, estado) => {
    setUpdating(id);
    try { await api.orders.updateStatus(id, { estado }); loadOrders(); }
    catch (e) { alert(e.message); }
    finally { setUpdating(null); }
  };

  const cancelOrder = async (id) => {
    if (!confirm('¿Cancelar este pedido?')) return;
    setUpdating(id);
    try { await api.orders.cancel(id); loadOrders(); }
    catch (e) { alert(e.message); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">Pedidos</h1>
        <p className="mt-1 text-sm text-muted">Gestiona el estado de los pedidos de los clientes.</p>
      </header>

      {loading ? (
        <PageLoader />
      ) : !orders.content?.length ? (
        <div className="card py-10">
          <EmptyState icon="receipt" title="Sin pedidos" description="Todavía no se han registrado pedidos." />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.content.map((order) => (
              <article key={order.id} className="card overflow-hidden">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-soft px-5 py-3.5">
                  <div>
                    <p className="font-semibold text-ink">Pedido #{order.numeroOrden?.substring(0, 8)}</p>
                    <p className="text-xs text-muted">
                      Usuario #{order.usuarioId} · {new Date(order.creadoEn).toLocaleString('es-PE')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${STATUS_BADGE[order.estado] || 'bg-stone-100 text-stone-600'}`}>
                      {STATUS_LABELS[order.estado] || order.estado}
                    </span>
                    <select
                      value={order.estado}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="input w-auto py-1.5 text-xs"
                      aria-label="Cambiar estado"
                    >
                      {ORDER_STATUS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    {order.estado !== 'CANCELADO' && order.estado !== 'COMPLETADO' && (
                      <button onClick={() => cancelOrder(order.id)} disabled={updating === order.id} className="btn btn-danger btn-sm">
                        Cancelar
                      </button>
                    )}
                  </div>
                </header>
                <div className="px-5 py-4">
                  <ul className="space-y-2">
                    {order.items?.map((item) => (
                      <li key={item.productoId} className="flex justify-between gap-4 text-sm">
                        <span className="text-ink">{item.titulo || `Producto #${item.productoId}`}<span className="text-muted"> × {item.cantidad}</span></span>
                        <span className="font-medium text-ink">{formatPrice(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className="font-semibold text-ink">Total</span>
                    <span className="font-display text-lg font-semibold text-accent-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Pagination page={orders.number} totalPages={orders.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
