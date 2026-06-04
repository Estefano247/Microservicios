const STORAGE_KEY = 'guest_cart';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const guestCart = {
  getItems() {
    return load();
  },

  addItem(product, cantidad = 1) {
    const items = load();
    const idx = items.findIndex((i) => i.productoId === product.id);
    if (idx >= 0) {
      items[idx].cantidad += cantidad;
    } else {
      items.push({
        productoId: product.id,
        titulo: product.titulo,
        precioUnitario: Number(product.precio),
        cantidad,
        subtotal: Number(product.precio) * cantidad,
      });
    }
    items.forEach((i) => { i.subtotal = i.precioUnitario * i.cantidad; });
    save(items);
    return items;
  },

  removeItem(productoId) {
    const items = load().filter((i) => i.productoId !== productoId);
    save(items);
    return items;
  },

  updateQuantity(productoId, cantidad) {
    const items = load();
    const item = items.find((i) => i.productoId === productoId);
    if (item) {
      item.cantidad = cantidad;
      item.subtotal = item.precioUnitario * cantidad;
    }
    save(items);
    return items;
  },

  clear() {
    save([]);
    return [];
  },

  get total() {
    return load().reduce((sum, i) => sum + i.subtotal, 0);
  },
};
