const API_BASE = '/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw new Error('Sesion expirada');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    let message = `Error ${res.status}`;
    if (body.error) {
      if (typeof body.error === 'string') {
        message = body.error;
      } else if (typeof body.error === 'object') {
        message = Object.values(body.error).filter(Boolean).join('. ');
      }
    } else if (body.message) {
      message = body.message;
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    login: (data) => request('/users/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data) => request('/users/auth', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/users/auth/logout', { method: 'POST' }),
  },
  users: {
    me: () => request('/users/me'),
    getById: (id) => request(`/users/${id}`),
    changePassword: (data) => request('/users/change-password', { method: 'PATCH', body: JSON.stringify(data) }),
    sessions: () => request('/users/sessions'),
    adminList: (params) => request(`/users/admin?${new URLSearchParams(params)}`),
    adminGet: (id) => request(`/users/admin/${id}`),
    adminDeactivate: (id) => request(`/users/admin/${id}`, { method: 'DELETE' }),
    adminReactivate: (email) => request(`/users/admin/reactivate?email=${encodeURIComponent(email)}`, { method: 'PATCH' }),
  },
  products: {
    list: (params) => request(`/products?${new URLSearchParams(params)}`),
    getById: (id) => request(`/products/${id}`),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  authors: {
    list: (params) => request(`/authors?${new URLSearchParams(params)}`),
    getById: (id) => request(`/authors/${id}`),
    create: (data) => request('/authors', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/authors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/authors/${id}`, { method: 'DELETE' }),
  },
  inventory: {
    list: (params) => request(`/inventory?${new URLSearchParams(params)}`),
    getById: (id) => request(`/inventory/${id}`),
    getByProduct: (productId) => request(`/inventory/product/${productId}`),
    create: (data) => request('/inventory', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    reduce: (id, quantity) => request(`/inventory/${id}/reduce?quantity=${quantity}`, { method: 'PATCH' }),
    add: (id, quantity) => request(`/inventory/${id}/add?quantity=${quantity}`, { method: 'PATCH' }),
    delete: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
  },
  cart: {
    get: (userId) => request(`/cart/usuario/${userId}`),
    addItem: (userId, data) => request(`/cart/usuario/${userId}/items`, { method: 'POST', body: JSON.stringify(data) }),
    removeItem: (userId, productId) => request(`/cart/usuario/${userId}/items/${productId}`, { method: 'DELETE' }),
    clear: (userId) => request(`/cart/usuario/${userId}`, { method: 'DELETE' }),
  },
  orders: {
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    getById: (id) => request(`/orders/${id}`),
    getByNumber: (numero) => request(`/orders/numero/${numero}`),
    listByUser: (userId, params) => request(`/orders/usuario/${userId}?${new URLSearchParams(params)}`),
    listAll: (params) => request(`/orders?${new URLSearchParams(params)}`),
    updateStatus: (id, data) => request(`/orders/${id}/estado`, { method: 'PATCH', body: JSON.stringify(data) }),
    cancel: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  },
};

export function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
