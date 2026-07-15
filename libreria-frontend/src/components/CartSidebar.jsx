import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { formatPrice } from '../constants/catalog';
import Icon from './ui/Icon';
import { Spinner } from './ui/Loader';

export default function CartSidebar({ open, onClose }) {
  const { items, loading, removeFromCart, updateQuantity, clearCart, total, count } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const go = (path) => { onClose(); navigate(path); };

  const handleCheckout = () => {
    onClose();
    navigate(isAuthenticated ? '/cart' : '/login?redirect=/cart?sync=1');
  };

  const handleRemove = (id) => { removeFromCart(id); addToast('Producto eliminado del carrito'); };
  const handleClear = () => { clearCart(); addToast('Carrito vaciado'); };

  // Cerrar con Escape y bloquear el scroll de fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Portal a <body>: evita que el backdrop-filter del navbar "atrape" el position:fixed.
  return createPortal(
    <div className="cart-portal">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[70] bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-surface shadow-[var(--shadow-pop)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Icon name="cart" className="w-5 h-5 text-brand-600" />
            Tu carrito
            {count > 0 && <span className="text-sm font-normal text-muted">({count})</span>}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-ink/5 hover:text-ink" aria-label="Cerrar">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center"><Spinner className="w-8 h-8" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-400">
              <Icon name="cart" className="w-8 h-8" strokeWidth={1.3} />
            </div>
            <p className="font-semibold text-ink">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-muted">Agrega libros para comenzar tu pedido.</p>
            <button onClick={() => go('/')} className="btn btn-primary mt-5">Explorar catálogo</button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <div key={item.productoId} className="flex gap-3 rounded-xl border border-line bg-surface-soft p-3">
                  <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-200">
                    <Icon name="book" className="w-6 h-6" strokeWidth={1.3} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.titulo || `Producto #${item.productoId}`}</p>
                    <p className="text-xs text-muted">{formatPrice(item.precioUnitario)} c/u</p>
                    {!isAuthenticated ? (
                      <div className="mt-2 inline-flex items-center rounded-lg border border-line bg-white">
                        <button onClick={() => updateQuantity(item.productoId, item.cantidad - 1)} className="flex h-7 w-7 items-center justify-center text-ink hover:bg-surface-soft disabled:opacity-40" disabled={item.cantidad <= 1} aria-label="Menos">
                          <Icon name="minus" className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold tabular-nums">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.productoId, item.cantidad + 1)} className="flex h-7 w-7 items-center justify-center text-ink hover:bg-surface-soft" aria-label="Más">
                          <Icon name="plus" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-muted">Cantidad: {item.cantidad}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="text-sm font-semibold text-accent-600">{formatPrice(item.subtotal)}</span>
                    <button onClick={() => handleRemove(item.productoId)} className="rounded-lg p-1 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Eliminar">
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <footer className="space-y-3 border-t border-line bg-surface px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Total</span>
                <span className="font-display text-xl font-semibold text-ink">{formatPrice(total)}</span>
              </div>
              <button onClick={handleCheckout} className="btn btn-primary btn-lg w-full">
                {isAuthenticated ? 'Realizar pedido' : 'Iniciar sesión para comprar'}
              </button>
              <div className="flex items-center justify-between">
                <button onClick={() => go('/cart')} className="text-sm font-medium text-brand-700 hover:underline">Ver carrito completo</button>
                <button onClick={handleClear} className="text-sm font-medium text-muted hover:text-red-600">Vaciar</button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>,
    document.body
  );
}
