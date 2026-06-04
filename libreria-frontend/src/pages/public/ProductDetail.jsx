import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { guestCart } from '../../utils/guestCart';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.products.getById(id)
      .then(setProduct)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const addToCart = async () => {
    setAdding(true);
    try {
      if (isAuthenticated) {
        await api.cart.addItem(user.id, { productoId: product.id, cantidad: quantity });
      } else {
        guestCart.addItem(product, quantity);
      }
      addToast('Agregado al carrito');
      navigate('/cart');
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-[3/4] bg-gray-200 rounded-xl" />
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const categoryLabels = {
    NOVELA: 'Novela', CIENCIA_FICCION: 'Ciencia Ficción', FICCION: 'Ficción',
    HISTORIA: 'Historia', BIOGRAFIA: 'Biografía', POESIA: 'Poesía',
    INFANTIL: 'Infantil', TECNICO: 'Técnico', ENSAYO: 'Ensayo',
    MISTERIO: 'Misterio', DRAMA: 'Drama', FANTASIA: 'Fantasía',
    ROMANCE: 'Romance', COMEDIA: 'Comedia',
  };

  const typeLabels = { FISICO: 'Físico', DIGITAL: 'Digital', AUDIO_LIBRO: 'Audiolibro' };
  const typeColors = { FISICO: 'bg-blue-100 text-blue-700', DIGITAL: 'bg-green-100 text-green-700', AUDIO_LIBRO: 'bg-purple-100 text-purple-700' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block text-sm">&larr; Volver al catálogo</button>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-[3/4] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.titulo} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )}
        </div>

        <div>
          <div className="flex gap-2 mb-3">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
              {categoryLabels[product.categoria] || product.categoria}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColors[product.tipo] || 'bg-gray-100'}`}>
              {typeLabels[product.tipo] || product.tipo}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.titulo}</h1>
          <p className="text-lg text-gray-600 mb-4">{product.autor?.nombre}</p>
          <p className="text-3xl font-bold text-indigo-600 mb-6">S/ {Number(product.precio).toFixed(2)}</p>
          <div className="space-y-2 text-gray-600 mb-8 text-sm">
            {product.isbn && <p><span className="font-semibold">ISBN:</span> {product.isbn}</p>}
            {product.paginas && <p><span className="font-semibold">Páginas:</span> {product.paginas}</p>}
            {product.anioPublicacion && <p><span className="font-semibold">Año:</span> {product.anioPublicacion}</p>}
          </div>
          {product.descripcion && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{product.descripcion}</p>
            </div>
          )}

          {product.tipo !== 'DIGITAL' && product.tipo !== 'AUDIO_LIBRO' && (
            <div className="flex items-center gap-4 mb-6">
              <label className="font-semibold text-gray-700 text-sm">Cantidad:</label>
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1.5 hover:bg-gray-100 text-base">-</button>
                <span className="px-4 py-1.5 border-x text-base font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1.5 hover:bg-gray-100 text-base">+</button>
              </div>
            </div>
          )}

          <button onClick={addToCart} disabled={adding}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-8 py-3 rounded-lg transition text-sm">
            {adding ? 'Agregando...' : (product.tipo === 'DIGITAL' || product.tipo === 'AUDIO_LIBRO' ? 'Comprar ahora' : 'Agregar al Carrito')}
          </button>
        </div>
      </div>
    </div>
  );
}
