import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { CATEGORIES, TYPE_LABELS, TYPE_BADGE, isDigitalType, formatPrice } from '../../constants/catalog';
import Icon from '../../components/ui/Icon';
import BookCover from '../../components/ui/BookCover';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Reveal from '../../components/ui/Reveal';
import Hero from '../../components/landing/Hero';
import ValueProps from '../../components/landing/ValueProps';
import FeaturedCarousel from '../../components/landing/FeaturedCarousel';
import CategoryShowcase from '../../components/landing/CategoryShowcase';
import Stats from '../../components/landing/Stats';
import BrandStory from '../../components/landing/BrandStory';
import Testimonials from '../../components/landing/Testimonials';
import Newsletter from '../../components/landing/Newsletter';

function ProductCard({ product, stockData }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);

  const stockInfo = stockData?.[product.id];
  const hasStock = stockInfo != null; // solo conocemos el stock si se cargó el inventario (usuario con sesión)
  const digital = isDigitalType(product.tipo) || !product.inventarioId;
  const stock = stockInfo?.cantidad ?? 0;
  const soldOut = !digital && hasStock && stock <= 0;
  const lowStock = !digital && hasStock && stock > 0 && stock <= 3;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product, 1);
      addToast(`"${product.titulo}" agregado al carrito`);
    } catch (err) {
      addToast(err.message || 'No se pudo agregar', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-line-strong"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-50/60">
        <BookCover src={product.imageUrl} title={product.titulo} author={product.autor?.nombre} />
        <span className={`badge absolute left-2.5 top-2.5 ${TYPE_BADGE[product.tipo] || 'bg-stone-100 text-stone-600'}`}>
          {TYPE_LABELS[product.tipo] || product.tipo}
        </span>
        {soldOut && <span className="badge absolute right-2.5 top-2.5 bg-red-100 text-red-700">Agotado</span>}
        {lowStock && <span className="badge absolute right-2.5 top-2.5 bg-amber-100 text-amber-800">Últimas {stock}</span>}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-brand-700">{product.titulo}</h3>
        <p className="mt-1 truncate text-xs text-muted">{product.autor?.nombre || 'Autor desconocido'}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="font-display text-lg font-semibold text-accent-600">{formatPrice(product.precio)}</span>
          {soldOut ? (
            <span className="badge bg-stone-100 text-stone-500">Sin stock</span>
          ) : (
            <button onClick={handleAdd} disabled={adding} className="btn btn-primary btn-sm shrink-0" aria-label={`Agregar ${product.titulo}`}>
              <Icon name={adding ? 'refresh' : 'plus'} className={`w-4 h-4 ${adding ? 'animate-spin' : ''}`} /> Agregar
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="skeleton aspect-[3/4]" />
          <div className="space-y-2 p-3.5">
            <div className="skeleton h-4 w-4/5 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton mt-3 h-6 w-2/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [stockMap, setStockMap] = useState({});
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('titulo') || '');

  const page = parseInt(searchParams.get('page') || '0');
  const categoria = searchParams.get('categoria') || '';
  const titulo = searchParams.get('titulo') || '';
  const showLanding = !titulo && !categoria;

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 15, sort: 'id,desc' };
    if (categoria) params.categoria = categoria;
    if (titulo) params.titulo = titulo;
    // El endpoint de inventario requiere sesión; solo lo pedimos si hay usuario autenticado
    // (evita el 401 que provoca el popup de login del navegador para invitados).
    Promise.all([
      api.products.list(params),
      isAuthenticated ? api.inventory.list().catch(() => []) : Promise.resolve([]),
    ])
      .then(([productsRes, inventoryRes]) => {
        setProducts(productsRes);
        const map = {};
        (Array.isArray(inventoryRes) ? inventoryRes : []).forEach((inv) => { if (inv.productId) map[inv.productId] = inv; });
        setStockMap(map);
      })
      .catch(() => setProducts({ content: [], totalPages: 0, number: 0, totalElements: 0 }))
      .finally(() => setLoading(false));
  }, [page, categoria, titulo, isAuthenticated]);

  // Destacados para el carrusel (solo en el landing).
  useEffect(() => {
    if (!showLanding) return;
    setFeaturedLoading(true);
    api.products.list({ page: 0, size: 12, sort: 'precio,desc' })
      .then((res) => setFeatured(res.content || []))
      .catch(() => setFeatured([]))
      .finally(() => setFeaturedLoading(false));
  }, [showLanding]);

  useEffect(() => { setSearch(titulo); }, [titulo]);

  const updateParams = useCallback((updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v || v === 0) params.set(k, v);
      else params.delete(k);
    });
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const changePage = (p) => {
    updateParams({ page: p > 0 ? p : undefined });
    const anchor = document.getElementById('catalogo');
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const changeCategory = (cat) => updateParams({ categoria: cat || undefined, page: undefined });
  const handleSearch = (e) => { e.preventDefault(); updateParams({ titulo: search.trim() || undefined, page: undefined }); };
  const clearSearch = () => { setSearch(''); updateParams({ titulo: undefined, page: undefined }); };

  const totalResults = products.totalElements || 0;

  const catalog = (
    <div id="catalogo" className="page scroll-mt-20 py-10">
      {/* Filtros de categoría */}
      <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button key={cat.value} onClick={() => changeCategory(cat.value)} className={`chip shrink-0 ${categoria === cat.value ? 'chip-on' : 'chip-off'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">
            {titulo ? 'Resultados de búsqueda' : categoria ? CATEGORIES.find((c) => c.value === categoria)?.label : 'Todo el catálogo'}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {loading ? 'Buscando…' : `${totalResults} libro${totalResults !== 1 ? 's' : ''}`}
            {titulo && <> para <span className="font-medium text-ink">“{titulo}”</span></>}
          </p>
        </div>
        {titulo && <button onClick={clearSearch} className="btn btn-secondary btn-sm"><Icon name="close" className="w-4 h-4" /> Limpiar</button>}
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : products.content?.length === 0 ? (
        <EmptyState icon="search" title="No se encontraron libros" description="Intenta con otro término de búsqueda o explora otra categoría.">
          <button onClick={() => updateParams({ titulo: undefined, categoria: undefined, page: undefined })} className="btn btn-primary">Ver todo el catálogo</button>
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.content?.map((product) => <ProductCard key={product.id} product={product} stockData={stockMap} />)}
          </div>
          <Pagination page={products.number} totalPages={products.totalPages} onChange={changePage} />
        </>
      )}
    </div>
  );

  // Vista de resultados (búsqueda/categoría): cabecera compacta + catálogo.
  if (!showLanding) {
    return (
      <div>
        <div className="border-b border-line bg-surface-soft">
          <form onSubmit={handleSearch} className="page flex max-w-xl gap-2 py-6">
            <div className="relative flex-1">
              <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título o autor…" className="input py-3 pl-12" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg shrink-0">Buscar</button>
          </form>
        </div>
        {catalog}
      </div>
    );
  }

  // Landing completo.
  return (
    <div>
      <Hero />
      <ValueProps />
      <FeaturedCarousel title="Destacados de la semana" subtitle="Los más buscados" products={featured} loading={featuredLoading} />
      <CategoryShowcase />
      <Stats />
      {catalog}
      <BrandStory />
      <Testimonials />
      <Newsletter />
    </div>
  );
}
