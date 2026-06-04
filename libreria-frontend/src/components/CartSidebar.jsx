import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export default function CartSidebar({ open, onClose }) {
  const { items, loading, removeFromCart, updateQuantity, clearCart, total, count } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  const handlePlaceOrder = () => {
    onClose();
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart?sync=1');
    } else {
      navigate('/cart');
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <div className={`ml-auto w-80 sm:w-96 bg-white h-full shadow-2xl flex flex-col transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                Carrito
                {count > 0 && <span className="ml-2 text-sm font-normal text-gray-500">({count} {count === 1 ? 'producto' : 'productos'})</span>}
              </h2>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <p className="text-gray-500 font-medium mb-1">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm">Agrega productos para comenzar</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.productoId} className="flex items-start justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-medium text-sm text-gray-900 truncate">{item.titulo || `Producto #${item.productoId}`}</p>
                        <p className="text-xs text-gray-500">S/ {Number(item.precioUnitario).toFixed(2)}</p>
                        {!isAuthenticated ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <button onClick={() => updateQuantity(item.productoId, item.cantidad - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-200 text-sm">-</button>
                            <span className="text-xs font-medium w-5 text-center">{item.cantidad}</span>
                            <button onClick={() => updateQuantity(item.productoId, item.cantidad + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-200 text-sm">+</button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">Cantidad: {item.cantidad}</p>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="font-semibold text-sm text-indigo-600">S/ {Number(item.subtotal).toFixed(2)}</p>
                        <button onClick={() => removeFromCart(item.productoId)}
                          className="text-red-500 hover:text-red-700 text-xs mt-1">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-indigo-600">S/ {Number(total).toFixed(2)}</span>
                  </div>
                  <button onClick={handlePlaceOrder}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition">
                    {isAuthenticated ? 'Realizar Pedido' : 'Iniciar Sesión para Comprar'}
                  </button>
                  <button onClick={handleViewCart}
                    className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-lg text-sm transition">
                    Ver carrito completo
                  </button>
                  <button onClick={() => { clearCart(); addToast('Carrito vaciado'); }}
                    className="w-full text-red-600 hover:text-red-800 text-xs text-center block">
                    Vaciar Carrito
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
