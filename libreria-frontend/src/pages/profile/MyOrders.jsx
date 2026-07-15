import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { STATUS_LABELS, STATUS_BADGE, formatPrice } from '../../constants/catalog';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

const CANCELLABLE = ['PENDIENTE', 'PAGO_PENDIENTE'];

export default function MyOrders() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.orders.listByUser(user.id, { page, size: 10, sort: 'creadoEn,desc' })
      .then(setOrders)
      .catch(() => addToast('Error al cargar pedidos', 'error'))
      .finally(() => setLoading(false));
  }, [user, page]);

  const handleCancel = async (orderId) => {
    setCancelling(orderId);
    try {
      await api.orders.cancel(orderId);
      addToast('Pedido cancelado exitosamente');
      setOrders((prev) => ({
        ...prev,
        content: prev.content.map((o) => (o.id === orderId ? { ...o, estado: 'CANCELADO' } : o)),
      }));
    } catch (e) {
      addToast(e.message || 'Error al cancelar pedido', 'error');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <PageLoader label="Cargando tus pedidos…" />;

  return (
    <div className="page max-w-4xl py-8">
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Mis pedidos</h1>

      {!orders.content?.length ? (
        <div className="card py-10">
          <EmptyState
            icon="receipt"
            title="Aún no tienes pedidos"
            description="Cuando realices tu primera compra, aparecerá aquí."
          >
            <a href="/" className="btn btn-primary"><Icon name="book" className="w-4 h-4" /> Explorar libros</a>
          </EmptyState>
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
                      {new Date(order.creadoEn).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {CANCELLABLE.includes(order.estado) && (
                      <button onClick={() => handleCancel(order.id)} disabled={cancelling === order.id} className="btn btn-danger btn-sm">
                        {cancelling === order.id ? 'Cancelando…' : 'Cancelar'}
                      </button>
                    )}
                    <span className={`badge ${STATUS_BADGE[order.estado] || 'bg-stone-100 text-stone-600'}`}>
                      {STATUS_LABELS[order.estado] || order.estado}
                    </span>
                  </div>
                </header>
                <div className="px-5 py-4">
                  <ul className="space-y-2">
                    {order.items?.map((item) => (
                      <li key={item.productoId} className="flex justify-between gap-4 text-sm">
                        <span className="text-ink">
                          {item.titulo || `Producto #${item.productoId}`}
                          <span className="text-muted"> × {item.cantidad}</span>
                        </span>
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
