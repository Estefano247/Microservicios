import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { guestCart } from '../utils/guestCart';
import { api } from '../api/client';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const isGuest = !isAuthenticated;

  const loadCart = useCallback(() => {
    if (isGuest) {
      setItems(guestCart.getItems());
      return;
    }
    if (!user) return;
    setLoading(true);
    api.cart.get(user.id)
      .then(data => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isGuest, user]);

  useEffect(() => { loadCart() }, [loadCart]);

  const addToCart = async (product, cantidad = 1) => {
    if (isGuest) {
      const newItems = guestCart.addItem(product, cantidad);
      setItems([...newItems]);
    } else if (user) {
      await api.cart.addItem(user.id, { productoId: product.id, cantidad });
      await loadCart();
    }
  };

  const removeFromCart = async (productoId) => {
    if (isGuest) {
      const newItems = guestCart.removeItem(productoId);
      setItems([...newItems]);
    } else if (user) {
      await api.cart.removeItem(user.id, productoId);
      await loadCart();
    }
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad < 1) return;
    if (isGuest) {
      const newItems = guestCart.updateQuantity(productoId, cantidad);
      setItems([...newItems]);
    }
  };

  const clearCart = async () => {
    if (isGuest) {
      guestCart.clear();
      setItems([]);
    } else if (user) {
      await api.cart.clear(user.id);
      setItems([]);
    }
  };

  const total = items.reduce((sum, i) => sum + Number(i.subtotal || i.precioUnitario * i.cantidad), 0);
  const count = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, total, count, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
