import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { guestCart } from '../../utils/guestCart';

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
      const items = guestCart.getItems();
      setCart({ items, total: guestCart.total });
      setLoading(false);
      return;
    }
    if (!user) return;
    api.cart.get(user.id)
      .then(setCart)
      .catch(() => setCart({ items: [], total: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCart() }, [user, isGuest]);

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
        }).catch((e) => addToast('Error al sincronizar carrito', 'error'));
      }
    }
  }, [searchParams, isAuthenticated, user]);

  const removeItem = async (productoId) => {
    try {
      if (isGuest) {
        const items = guestCart.removeItem(productoId);
        setCart({ items, total: guestCart.total });
      } else {
        await api.cart.removeItem(user.id, productoId);
        loadCart();
      }
    } catch {}
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad < 1) return;
    if (isGuest) {
      const items = guestCart.updateQuantity(productoId, cantidad);
      setCart({ items, total: guestCart.total });
    }
  };

  const clearCart = async () => {
    try {
      if (isGuest) {
        guestCart.clear();
        setCart({ items: [], total: 0 });
      } else {
        await api.cart.clear(user.id);
        setCart({ items: [], total: 0 });
      }
    } catch {}
  };

  const placeOrder = () => {
    if (isGuest) {
      navigate('/login?redirect=/cart?sync=1');
      return;
    }
    setOrdering(true);
    api.orders.create({ usuarioId: user.id })
      .then(() => { guestCart.clear(); navigate('/profile/orders', { replace: true }); })
      .catch((e) => addToast(e.message, 'error'))
      .finally(() => setOrdering(false));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

      {!cart?.items?.length ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
          <button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg">
            Explorar Productos
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {cart.items.map((item) => (
              <div key={item.productoId} className="flex items-center justify-between bg-white rounded-xl shadow-sm border p-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.titulo || `Producto #${item.productoId}`}</h3>
                  <p className="text-sm text-gray-500">Precio: S/ {Number(item.precioUnitario).toFixed(2)}</p>
                  {isGuest ? (
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => updateQuantity(item.productoId, item.cantidad - 1)} className="text-gray-500 hover:text-gray-700 text-lg leading-none px-1">-</button>
                      <span className="text-sm font-medium">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.productoId, item.cantidad + 1)} className="text-gray-500 hover:text-gray-700 text-lg leading-none px-1">+</button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">S/ {Number(item.subtotal).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.productoId)} className="text-red-600 hover:text-red-800 text-sm mt-1">Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-indigo-600">S/ {Number(cart.total).toFixed(2)}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={clearCart} className="flex-1 border border-red-300 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-lg transition">
                Vaciar Carrito
              </button>
              <button onClick={placeOrder} disabled={ordering}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition">
                {ordering ? 'Procesando...' : (isGuest ? 'Iniciar Sesión para Comprar' : 'Realizar Pedido')}
              </button>
            </div>
            {isGuest && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                Los productos se guardan localmente. Inicia sesión para sincronizar tu carrito y realizar la compra.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
