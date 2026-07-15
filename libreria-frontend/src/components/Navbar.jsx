import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartSidebar from './CartSidebar';
import Icon from './ui/Icon';
import BrandMark from './ui/BrandMark';

function Logo({ isAdmin }) {
  return (
    <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2 shrink-0 group">
      <BrandMark className="h-9 w-9 transition-transform group-hover:scale-105" />
      <span className="font-display text-xl font-semibold tracking-tight leading-none">
        <span className="text-brand-700">Libreria</span> <span className="text-brand-500">Store</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?titulo=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  const CartButton = ({ className = '' }) => (
    <button
      onClick={() => setCartOpen(true)}
      className={`relative inline-flex items-center justify-center rounded-xl p-2 text-ink/80 hover:text-brand-700 hover:bg-brand-50 transition-colors ${className}`}
      aria-label={`Carrito${count > 0 ? `, ${count} artículos` : ''}`}
    >
      <Icon name="cart" className="w-[22px] h-[22px]" strokeWidth={1.6} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="page">
        <div className="flex h-16 items-center gap-4">
          <Logo isAdmin={isAdmin} />

          {!isAdmin && (
            <>
              {/* Búsqueda — escritorio */}
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-auto relative">
                <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar libros, autores…"
                  className="input pl-10 py-2 bg-white/70"
                />
              </form>

              {/* Acciones — escritorio */}
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <CartButton />
                {isAuthenticated ? (
                  <div className="flex items-center gap-1 pl-1.5 ml-1 border-l border-line">
                    <Link
                      to="/profile/orders"
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-ink/80 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                    >
                      <Icon name="receipt" className="w-4 h-4" /> Mis pedidos
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-brand-50 transition-colors max-w-[180px]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                        {(user?.fullName || user?.email || '?').charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-ink truncate hidden lg:block">
                        {user?.fullName || user?.email}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center rounded-xl p-2 text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Cerrar sesión"
                    >
                      <Icon name="logout" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-1">
                    <Link to="/login" className="btn btn-ghost btn-sm">Ingresar</Link>
                    <Link to="/register" className="btn btn-primary btn-sm">Crear cuenta</Link>
                  </div>
                )}
              </div>

              {/* Acciones — móvil */}
              <div className="flex md:hidden items-center gap-1 ml-auto">
                <CartButton />
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="inline-flex items-center justify-center rounded-xl p-2 text-ink hover:bg-ink/5"
                  aria-label="Menú"
                >
                  <Icon name={menuOpen ? 'close' : 'menu'} className="w-6 h-6" />
                </button>
              </div>
            </>
          )}

          {isAdmin && (
            <div className="hidden md:flex items-center gap-1.5 shrink-0 ml-auto">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                <Icon name="dashboard" className="w-4 h-4" /> Panel de control
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center rounded-xl p-2 text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Cerrar sesión"
              >
                <Icon name="logout" className="w-[18px] h-[18px]" />
              </button>
            </div>
          )}
        </div>

        {/* Panel móvil */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-1 space-y-1.5 animate-fade-in">
            {isAdmin ? (
              <>
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-medium text-white">
                  <Icon name="dashboard" className="w-5 h-5" /> Panel de control
                </Link>
                <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                  <Icon name="logout" className="w-5 h-5" /> Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <form onSubmit={handleSearch} className="relative mb-2">
                  <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar libros, autores…"
                    className="input pl-10"
                  />
                </form>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5">
                      <Icon name="user" className="w-5 h-5 text-muted" /> Mi perfil
                    </Link>
                    <Link to="/profile/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5">
                      <Icon name="receipt" className="w-5 h-5 text-muted" /> Mis pedidos
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                      <Icon name="logout" className="w-5 h-5" /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="btn btn-secondary flex-1">Ingresar</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary flex-1">Crear cuenta</Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </nav>
  );
}
