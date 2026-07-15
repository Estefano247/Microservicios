import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../Toast';
import { TYPE_LABELS, TYPE_BADGE, formatPrice } from '../../constants/catalog';
import Icon from '../ui/Icon';
import BookCover from '../ui/BookCover';
import Reveal from '../ui/Reveal';

function FeaturedCard({ product }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product, 1);
      addToast(`"${product.titulo}" agregado al carrito`);
    } catch (err) {
      addToast(err.message || 'No se pudo agregar', 'error');
    } finally { setAdding(false); }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex w-52 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-50/60">
        <BookCover src={product.imageUrl} title={product.titulo} author={product.autor?.nombre} />
        <span className={`badge absolute left-2.5 top-2.5 ${TYPE_BADGE[product.tipo] || 'bg-stone-100 text-stone-600'}`}>
          {TYPE_LABELS[product.tipo] || product.tipo}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:text-brand-700">{product.titulo}</h3>
        <p className="mt-1 truncate text-xs text-muted">{product.autor?.nombre || 'Autor desconocido'}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="font-display text-lg font-semibold text-accent-600">{formatPrice(product.precio)}</span>
          <button onClick={add} disabled={adding} className="btn btn-primary btn-sm" aria-label="Agregar al carrito">
            <Icon name={adding ? 'refresh' : 'plus'} className={`w-4 h-4 ${adding ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </Link>
  );
}

function SkeletonRow() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-52 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="skeleton aspect-[3/4]" />
          <div className="space-y-2 p-3.5"><div className="skeleton h-4 w-4/5 rounded" /><div className="skeleton h-3 w-1/2 rounded" /></div>
        </div>
      ))}
    </div>
  );
}

export default function FeaturedCarousel({ title, subtitle, products, loading }) {
  const scroller = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => { update(); }, [products]);

  const scrollBy = (dir) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: 'smooth' });
  };

  // Autoplay suave con pausa al interactuar.
  useEffect(() => {
    const el = scroller.current;
    if (!el || !products?.length) return;
    let paused = false;
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    const id = setInterval(() => {
      if (paused) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: 224, behavior: 'smooth' });
    }, 3500);
    return () => {
      clearInterval(id);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
    };
  }, [products]);

  if (!loading && !products?.length) return null;

  return (
    <section className="page py-12">
      <Reveal>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {subtitle && <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{subtitle}</p>}
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">{title}</h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => scrollBy(-1)} disabled={!canPrev} className="btn btn-secondary h-10 w-10 !px-0 disabled:opacity-40" aria-label="Anterior">
              <Icon name="chevronLeft" className="w-5 h-5" />
            </button>
            <button onClick={() => scrollBy(1)} disabled={!canNext} className="btn btn-secondary h-10 w-10 !px-0 disabled:opacity-40" aria-label="Siguiente">
              <Icon name="chevronRight" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <SkeletonRow />
      ) : (
        <div
          ref={scroller}
          onScroll={update}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 pb-2"
        >
          {products.map((p) => <FeaturedCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}
