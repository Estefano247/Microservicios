import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/public/Home';
import ProductDetail from './pages/public/ProductDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Cart from './pages/cart/Cart';
import Profile from './pages/profile/Profile';
import MyOrders from './pages/profile/MyOrders';
import AdminDashboard from './pages/admin/Dashboard';
import ProductsManager from './pages/admin/ProductsManager';
import ProductForm from './pages/admin/ProductForm';
import UsersManager from './pages/admin/UsersManager';
import OrdersManager from './pages/admin/OrdersManager';
import InventoryManager from './pages/admin/InventoryManager';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><ProductsManager /></AdminRoute>} />
                <Route path="/admin/products/new" element={<AdminRoute><ProductForm /></AdminRoute>} />
                <Route path="/admin/products/:id" element={<AdminRoute><ProductForm /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><UsersManager /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><OrdersManager /></AdminRoute>} />
                <Route path="/admin/inventory" element={<AdminRoute><InventoryManager /></AdminRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
