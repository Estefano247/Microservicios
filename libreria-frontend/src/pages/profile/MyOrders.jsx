import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_COLORS = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  PAGO_PENDIENTE: 'bg-orange-100 text-orange-700',
  RESERVADO: 'bg-blue-100 text-blue-700',
  COMPLETADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
  FALLIDO: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  PAGO_PENDIENTE: 'Pago Pendiente',
  RESERVADO: 'Reservado',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
  FALLIDO: 'Fallido',
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.orders.listByUser(user.id, { page, size: 10, sort: 'creadoEn,desc' })
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

      {!orders.content?.length ? (
        <p className="text-center text-gray-500 py-12">No tienes pedidos aún.</p>
      ) : (
        <>
          <div className="space-y-4">
            {orders.content.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Pedido #{order.numeroOrden?.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500">{new Date(order.creadoEn).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.estado] || 'bg-gray-100'}`}>
                    {STATUS_LABELS[order.estado] || order.estado}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items?.map((item) => (
                    <div key={item.productoId} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.titulo || `Producto #${item.productoId}`} x{item.cantidad}</span>
                      <span className="text-gray-900 font-medium">S/ {Number(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-indigo-600">S/ {Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {orders.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button disabled={orders.first} onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 text-sm font-medium">&laquo; Anterior</button>
              {Array.from({ length: orders.totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium ${i === orders.number ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-50'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={orders.last} onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 text-sm font-medium">Siguiente &raquo;</button>
            </div>
          )}
        </>
      )}

      <div className="mt-8 text-center">
        <Link to="/products" className="text-indigo-600 hover:underline font-medium">&larr; Seguir comprando</Link>
      </div>
    </div>
  );
}
