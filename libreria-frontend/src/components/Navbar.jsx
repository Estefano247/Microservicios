import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/?titulo=${encodeURIComponent(mobileSearch.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-700 shrink-0">
            <span className="text-2xl">&#128218;</span> Librería
          </Link>

          <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
            <button onClick={() => setCartOpen(true)} className="relative text-gray-700 hover:text-indigo-600 p-1.5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
            {isAdmin && <Link to="/admin" className="text-gray-700 hover:text-indigo-600 font-medium text-sm">Admin</Link>}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="text-gray-700 hover:text-indigo-600 font-medium text-sm truncate max-w-[120px]">{user?.fullName || user?.email}</Link>
                <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium">Salir</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Ingresar</Link>
                <Link to="/register" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-medium">Registro</Link>
              </div>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <form onSubmit={handleMobileSearch} className="flex gap-2 pb-2">
              <input type="text" value={mobileSearch} onChange={(e) => setMobileSearch(e.target.value)}
                placeholder="Buscar libros..." className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm">Ir</button>
            </form>
            <button onClick={() => { setMenuOpen(false); setCartOpen(true); }} className="block w-full text-left px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm">Carrito {count > 0 ? `(${count})` : ''}</button>
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm">Admin</Link>}
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm">Perfil</Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block w-full text-left px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm">Cerrar Sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm">Ingresar</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 text-sm">Registrarse</Link>
              </>
            )}
          </div>
        )}
      </div>
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </nav>
  );
}
