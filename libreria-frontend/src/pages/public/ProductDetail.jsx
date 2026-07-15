import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import { guestCart } from '../../utils/guestCart';
import {
  CATEGORY_LABELS, TYPE_LABELS, TYPE_BADGE, isDigitalType, formatPrice,
} from '../../constants/catalog';
import Icon from '../../components/ui/Icon';
import BookCover from '../../components/ui/BookCover';

function QtyStepper({ value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-line bg-white">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-10 w-10 items-center justify-center rounded-l-xl text-ink hover:bg-surface-soft disabled:opacity-40"
        disabled={value <= 1}
        aria-label="Disminuir cantidad"
      >
        <Icon name="minus" className="w-4 h-4" />
      </button>
      <span className="w-10 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-r-xl text-ink hover:bg-surface-soft"
        aria-label="Aumentar cantidad"
      >
        <Icon name="plus" className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [stockInfo, setStockInfo] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.products.getById(id)
      .then((p) => {
        setProduct(p);
        // El inventario requiere sesión; solo lo pedimos si el usuario está autenticado
        // (evita el 401 que dispara el popup de login del navegador para invitados).
        if (p.inventarioId && isAuthenticated) api.inventory.getByProduct(p.id).then(setStockInfo).catch(() => {});
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate, isAuthenticated]);

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
    <div className="page py-10">
      <div className="grid animate-pulse gap-10 md:grid-cols-2">
        <div className="skeleton mx-auto aspect-[3/4] w-full max-w-sm rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-1/4 rounded" />
          <div className="skeleton h-10 w-3/4 rounded" />
          <div className="skeleton h-5 w-1/3 rounded" />
          <div className="skeleton h-9 w-1/4 rounded" />
          <div className="skeleton h-24 rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const digital = isDigitalType(product.tipo);
  const stock = stockInfo?.cantidad;
  const soldOut = !digital && product.inventarioId && stock <= 0;

  return (
    <div className="page py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted">
        <Link to="/" className="hover:text-brand-700">Catálogo</Link>
        <Icon name="chevronRight" className="w-3.5 h-3.5" />
        <span className="truncate font-medium text-ink">{product.titulo}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
        {/* Portada */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="group mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-brand-50/60 shadow-[var(--shadow-card)]">
            <BookCover src={product.imageUrl} title={product.titulo} author={product.autor?.nombre} big />
          </div>
        </div>

        {/* Información */}
        <div className="animate-fade-up">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="badge bg-brand-50 text-brand-700">
              {CATEGORY_LABELS[product.categoria] || product.categoria}
            </span>
            <span className={`badge ${TYPE_BADGE[product.tipo] || 'bg-stone-100 text-stone-600'}`}>
              {TYPE_LABELS[product.tipo] || product.tipo}
            </span>
          </div>

          <h1 className="font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
            {product.titulo}
          </h1>
          <p className="mt-2 text-lg text-muted">{product.autor?.nombre || 'Autor desconocido'}</p>

          <p className="mt-5 font-display text-4xl font-semibold text-accent-600">
            {formatPrice(product.precio)}
          </p>

          {/* Stock */}
          {!digital && product.inventarioId && stock !== undefined && (
            <div className="mt-4">
              {stock <= 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Agotado
                </span>
              ) : stock <= 3 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Últimas {stock} unidades
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                  <span className="h-2 w-2 rounded-full bg-brand-500" /> En stock ({stock} disponibles)
                </span>
              )}
            </div>
          )}
          {digital && (
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
              <Icon name={product.tipo === 'AUDIO_LIBRO' ? 'headphones' : 'download'} className="w-4 h-4" />
              {product.tipo === 'AUDIO_LIBRO' ? 'Disponible en audio' : 'Descarga inmediata'}
            </span>
          )}

          {/* CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {!digital && !soldOut && <QtyStepper value={quantity} onChange={setQuantity} />}
            {soldOut ? (
              <button disabled className="btn btn-primary btn-lg cursor-not-allowed opacity-60">
                Agotado
              </button>
            ) : (
              <button onClick={addToCart} disabled={adding} className="btn btn-primary btn-lg flex-1 sm:flex-none">
                <Icon name={digital ? 'download' : 'cart'} className="w-5 h-5" />
                {adding ? 'Agregando…' : (digital ? 'Comprar ahora' : 'Agregar al carrito')}
              </button>
            )}
          </div>

          {/* Ficha técnica */}
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-line bg-surface-soft p-5 sm:grid-cols-3">
            {product.isbn && (
              <div><dt className="text-xs uppercase tracking-wide text-muted">ISBN</dt><dd className="mt-0.5 text-sm font-medium text-ink">{product.isbn}</dd></div>
            )}
            {product.paginas > 0 && (
              <div><dt className="text-xs uppercase tracking-wide text-muted">Páginas</dt><dd className="mt-0.5 text-sm font-medium text-ink">{product.paginas}</dd></div>
            )}
            {product.anioPublicacion > 0 && (
              <div><dt className="text-xs uppercase tracking-wide text-muted">Año</dt><dd className="mt-0.5 text-sm font-medium text-ink">{product.anioPublicacion}</dd></div>
            )}
          </dl>

          {/* Descripción */}
          {product.descripcion && (
            <div className="mt-8">
              <h3 className="font-display text-lg font-semibold text-ink">Sobre este libro</h3>
              <p className="mt-2 leading-relaxed text-muted">{product.descripcion}</p>
            </div>
          )}

          {/* Garantías */}
          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-line pt-6 sm:grid-cols-3">
            {[
              { icon: digital ? 'download' : 'truck', text: digital ? 'Entrega digital' : 'Envío 24-48h' },
              { icon: 'lock', text: 'Pago seguro' },
              { icon: 'refresh', text: 'Devolución fácil' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2 text-sm text-muted">
                <Icon name={f.icon} className="w-4 h-4 text-brand-600" /> {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
