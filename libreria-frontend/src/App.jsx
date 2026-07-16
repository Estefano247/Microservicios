import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import NonAdminRoute from './components/NonAdminRoute';
import Home from './pages/public/Home';
import ProductDetail from './pages/public/ProductDetail';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Cart from './pages/cart/Cart';
import Profile from './pages/profile/Profile';
import MyOrders from './pages/profile/MyOrders';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ProductsManager from './pages/admin/ProductsManager';
import ProductForm from './pages/admin/ProductForm';
import UsersManager from './pages/admin/UsersManager';
import OrdersManager from './pages/admin/OrdersManager';
import InventoryManager from './pages/admin/InventoryManager';
import AdminAnalytics from './pages/admin/Analytics';
import AuthorsManager from './pages/admin/AuthorsManager';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<NonAdminRoute><Home /></NonAdminRoute>} />
                  <Route path="/products/:id" element={<NonAdminRoute><ProductDetail /></NonAdminRoute>} />
                  <Route path="/login" element={<NonAdminRoute><Login /></NonAdminRoute>} />
                  <Route path="/register" element={<NonAdminRoute><Register /></NonAdminRoute>} />
                  <Route path="/cart" element={<NonAdminRoute><Cart /></NonAdminRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><NonAdminRoute><Profile /></NonAdminRoute></ProtectedRoute>} />
                  <Route path="/profile/orders" element={<ProtectedRoute><NonAdminRoute><MyOrders /></NonAdminRoute></ProtectedRoute>} />

                  {/* Panel de administración con layout anidado */}
                  <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<ProductsManager />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/:id" element={<ProductForm />} />
                    <Route path="users" element={<UsersManager />} />
                    <Route path="orders" element={<OrdersManager />} />
                    <Route path="inventory" element={<InventoryManager />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="authors" element={<AuthorsManager />} />
                  </Route>
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
