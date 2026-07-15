import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { guestCart } from '../../utils/guestCart';
import { formatPrice } from '../../constants/catalog';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  const isGuest = !isAuthenticated;

  const loadCart = () => {
    if (isGuest) {
      setCart({ items: guestCart.getItems(), total: guestCart.total });
      setLoading(false);
      return;
    }
    if (!user) return;
    api.cart.get(user.id)
      .then(setCart)
      .catch(() => setCart({ items: [], total: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCart(); }, [user, isGuest]);

  useEffect(() => {
    if (searchParams.get('sync') === '1' && isAuthenticated && user) {
      const localItems = guestCart.getItems();
      if (localItems.length > 0) {
        Promise.all(localItems.map((item) =>
          api.cart.addItem(user.id, { productoId: item.productoId, cantidad: item.cantidad })
        )).then(() => {
          guestCart.clear();
          addToast('Carrito sincronizado');
          navigate('/cart', { replace: true });
          loadCart();
        }).catch(() => addToast('Error al sincronizar carrito', 'error'));
      }
    }
  }, [searchParams, isAuthenticated, user]);

  const removeItem = async (productoId) => {
    try {
      if (isGuest) {
        setCart({ items: guestCart.removeItem(productoId), total: guestCart.total });
      } else {
        await api.cart.removeItem(user.id, productoId);
        loadCart();
      }
      addToast('Producto eliminado del carrito');
    } catch { addToast('Error al eliminar producto', 'error'); }
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad < 1) return;
    if (isGuest) setCart({ items: guestCart.updateQuantity(productoId, cantidad), total: guestCart.total });
  };

  const clearCart = async () => {
    try {
      if (isGuest) { guestCart.clear(); setCart({ items: [], total: 0 }); }
      else { await api.cart.clear(user.id); setCart({ items: [], total: 0 }); }
      addToast('Carrito vaciado');
    } catch { addToast('Error al vaciar carrito', 'error'); }
  };

  const placeOrder = () => {
    if (isGuest) { navigate('/login?redirect=/cart?sync=1'); return; }
    setOrdering(true);
    api.orders.create({ usuarioId: user.id })
      .then(() => {
        guestCart.clear();
        addToast('¡Pedido creado exitosamente!');
        navigate('/profile/orders', { replace: true });
      })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setOrdering(false));
  };

  if (loading) return <PageLoader label="Cargando tu carrito…" />;

  const items = cart?.items || [];
  const count = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div className="page py-8">
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">Carrito de compras</h1>

      {!items.length ? (
        <div className="card py-10">
          <EmptyState
            icon="cart"
            title="Tu carrito está vacío"
            description="Explora el catálogo y agrega tus próximas lecturas."
          >
            <button onClick={() => navigate('/')} className="btn btn-primary">
              <Icon name="book" className="w-4 h-4" /> Explorar libros
            </button>
          </EmptyState>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted">{count} artículo{count !== 1 ? 's' : ''}</p>
              <button onClick={clearCart} className="text-sm font-medium text-muted hover:text-red-600">Vaciar carrito</button>
            </div>
            {items.map((item) => (
              <div key={item.productoId} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
                <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-200">
                  <Icon name="book" className="w-7 h-7" strokeWidth={1.3} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-ink">{item.titulo || `Producto #${item.productoId}`}</h3>
                  <p className="mt-0.5 text-sm text-muted">{formatPrice(item.precioUnitario)} por unidad</p>
                  {isGuest ? (
                    <div className="mt-2.5 inline-flex items-center rounded-lg border border-line bg-white">
                      <button onClick={() => updateQuantity(item.productoId, item.cantidad - 1)} className="flex h-8 w-8 items-center justify-center text-ink hover:bg-surface-soft disabled:opacity-40" disabled={item.cantidad <= 1} aria-label="Menos">
                        <Icon name="minus" className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center text-sm font-semibold tabular-nums">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.productoId, item.cantidad + 1)} className="flex h-8 w-8 items-center justify-center text-ink hover:bg-surface-soft" aria-label="Más">
                        <Icon name="plus" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Cantidad: <span className="font-medium text-ink">{item.cantidad}</span></p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-display text-lg font-semibold text-accent-600">{formatPrice(item.subtotal)}</span>
                  <button onClick={() => removeItem(item.productoId)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-red-50 hover:text-red-600">
                    <Icon name="trash" className="w-3.5 h-3.5" /> Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h2 className="font-display text-lg font-semibold text-ink">Resumen del pedido</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Subtotal ({count})</dt><dd className="font-medium text-ink">{formatPrice(cart.total)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd className="font-medium text-brand-700">A calcular</dd></div>
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-display text-2xl font-semibold text-accent-600">{formatPrice(cart.total)}</span>
              </div>
              <button onClick={placeOrder} disabled={ordering} className="btn btn-primary btn-lg mt-5 w-full">
                {ordering ? 'Procesando…' : (isGuest ? 'Iniciar sesión para comprar' : 'Realizar pedido')}
              </button>
              <button onClick={() => navigate('/')} className="btn btn-ghost mt-2 w-full">Seguir comprando</button>

              {isGuest && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <Icon name="alert" className="mt-0.5 w-4 h-4 shrink-0" />
                  <span>Tus productos se guardan localmente. Inicia sesión para sincronizar el carrito y completar la compra.</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
