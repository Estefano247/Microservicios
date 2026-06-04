import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useCart } from '../../contexts/CartContext';

const CATEGORIES = [
  { label: 'Todas', value: '' },
  { label: 'Novela', value: 'NOVELA' },
  { label: 'Ciencia Ficción', value: 'CIENCIA_FICCION' },
  { label: 'Ficción', value: 'FICCION' },
  { label: 'Historia', value: 'HISTORIA' },
  { label: 'Biografía', value: 'BIOGRAFIA' },
  { label: 'Poesía', value: 'POESIA' },
  { label: 'Infantil', value: 'INFANTIL' },
  { label: 'Técnico', value: 'TECNICO' },
  { label: 'Ensayo', value: 'ENSAYO' },
  { label: 'Misterio', value: 'MISTERIO' },
  { label: 'Drama', value: 'DRAMA' },
  { label: 'Fantasía', value: 'FANTASIA' },
  { label: 'Romance', value: 'ROMANCE' },
  { label: 'Comedia', value: 'COMEDIA' },
];

const TYPE_LABELS = { FISICO: 'Físico', DIGITAL: 'Digital', AUDIO_LIBRO: 'Audiolibro' };
const TYPE_COLORS = { FISICO: 'bg-blue-100 text-blue-700', DIGITAL: 'bg-green-100 text-green-700', AUDIO_LIBRO: 'bg-purple-100 text-purple-700' };

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [cantidad, setCantidad] = useState(1);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, cantidad);
    setCantidad(1);
  };

  const handleViewDesc = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  const isDigital = !product.inventarioId;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border p-3 flex flex-col">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 overflow-hidden relative">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.titulo} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )}
          <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[product.tipo] || 'bg-gray-100 text-gray-700'}`}>
            {TYPE_LABELS[product.tipo] || product.tipo}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 truncate text-sm leading-tight">{product.titulo}</h3>
        <p className="text-xs text-gray-500 truncate mt-0.5">{product.autor?.nombre}</p>
      </Link>
      <div className="pt-2 flex items-center justify-between">
        <p className="text-base font-bold text-indigo-600">S/ {Number(product.precio).toFixed(2)}</p>
        {isDigital ? (
          <span className="text-[10px] font-medium text-green-600">Digital</span>
        ) : (
          <span className="text-[10px] font-medium text-blue-600">Físico</span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCantidad(Math.max(1, cantidad - 1)); }}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm leading-none">-</button>
          <span className="px-2 py-1 text-xs font-medium min-w-[20px] text-center">{cantidad}</span>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCantidad(cantidad + 1); }}
            className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm leading-none">+</button>
        </div>
        <button onClick={handleAddToCart}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-1.5 rounded-lg transition">
          Agregar
        </button>
      </div>
      <button onClick={handleViewDesc}
        className="mt-1.5 w-full border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-medium py-1.5 rounded-lg transition">
        Ver descripción
      </button>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border p-3 animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState({ content: [], totalPages: 0, number: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('titulo') || '');

  const page = parseInt(searchParams.get('page') || '0');
  const categoria = searchParams.get('categoria') || '';
  const titulo = searchParams.get('titulo') || '';

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 15, sort: 'id,desc' };
    if (categoria) params.categoria = categoria;
    if (titulo) params.titulo = titulo;
    api.products.list(params)
      .then(setProducts)
      .catch(() => setProducts({ content: [], totalPages: 0, number: 0, totalElements: 0 }))
      .finally(() => setLoading(false));
  }, [page, categoria, titulo]);

  const updateParams = useCallback((updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v || v === 0) params.set(k, v);
      else params.delete(k);
    });
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const changePage = (p) => updateParams({ page: p > 0 ? p : undefined });

  const changeCategory = (cat) => {
    setSearch(search);
    updateParams({ categoria: cat || undefined, page: undefined });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ titulo: search || undefined, page: undefined });
  };

  const totalResults = products.totalElements || 0;

  return (
    <div>
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Librería Online</h1>
          <p className="text-indigo-200 mb-6 max-w-xl mx-auto text-sm md:text-base">
            Descubre libros físicos, digitales y audiolibros
          </p>
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="flex-1 px-4 py-2.5 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm" />
            <button type="submit" className="bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition text-sm">
              Buscar
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-1.5 mb-6">
          {CATEGORIES.map((cat) => (
            <button key={cat.value} onClick={() => changeCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                categoria === cat.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Buscando...' : `${totalResults} libro${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`}
            {titulo && <span> para &ldquo;{titulo}&rdquo;</span>}
          </p>
          {titulo && (
            <button onClick={() => { setSearch(''); updateParams({ titulo: undefined, page: undefined }); }}
              className="text-xs text-indigo-600 hover:underline">
              Limpiar búsqueda
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : products.content?.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500 font-medium">No se encontraron libros</p>
            <p className="text-gray-400 text-sm mt-1">Intenta con otra búsqueda o categoría</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.content?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {products.totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-8">
                <button disabled={products.first} onClick={() => changePage(page - 1)}
                  className="px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-50 text-xs font-medium">
                  &laquo;
                </button>
                {Array.from({ length: Math.min(products.totalPages, 8) }, (_, i) => (
                  <button key={i} onClick={() => changePage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium ${
                      i === products.number ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-50'
                    }`}>
                    {i + 1}
                  </button>
                ))}
                {products.totalPages > 8 && <span className="text-xs text-gray-400">...</span>}
                <button disabled={products.last} onClick={() => changePage(page + 1)}
                  className="px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-50 text-xs font-medium">
                  &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
