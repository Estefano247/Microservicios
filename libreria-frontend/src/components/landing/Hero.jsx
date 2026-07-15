import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';

const FLOATING_BOOKS = [
  { title: 'Cien años de soledad', author: 'G. García Márquez', from: '#1f5c3d', to: '#2f7350', rot: '-8deg', delay: '0s', x: 'left-2 top-6', z: 'z-10' },
  { title: 'Rayuela', author: 'Julio Cortázar', from: '#b45309', to: '#c2740c', rot: '5deg', delay: '1.2s', x: 'right-4 top-0', z: 'z-20' },
  { title: 'Ficciones', author: 'J. L. Borges', from: '#0f2c1f', to: '#184a31', rot: '-3deg', delay: '0.6s', x: 'left-16 bottom-2', z: 'z-30' },
];

function BookCover({ b }) {
  return (
    <div
      className={`float-y absolute ${b.x} ${b.z} h-56 w-40 rounded-xl p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10`}
      style={{ background: `linear-gradient(150deg, ${b.from}, ${b.to})`, '--rot': b.rot, animationDelay: b.delay }}
    >
      <div className="flex h-full flex-col justify-between text-white">
        <Icon name="book" className="w-6 h-6 opacity-70" />
        <div>
          <p className="font-display text-sm font-semibold leading-tight line-clamp-2">{b.title}</p>
          <p className="mt-1 text-[10px] text-white/70">{b.author}</p>
        </div>
        <div className="mt-3 h-1 w-8 rounded-full bg-white/40" />
      </div>
    </div>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/?titulo=${encodeURIComponent(q.trim())}`);
  };

  const scrollToCatalog = () => {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900">
      {/* Blobs decorativos */}
      <div className="blob pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand-400/25" />
      <div className="blob pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-accent-500/20" style={{ animationDelay: '3s' }} />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      <div className="page relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
        {/* Contenido */}
        <div className="animate-fade-up text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-brand-100 ring-1 ring-white/15 backdrop-blur">
            <Icon name="sparkle" className="w-3.5 h-3.5 text-accent-400" /> Nueva colección · Temporada 2026
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Las historias que<br />
            <span className="bg-gradient-to-r from-brand-200 via-white to-accent-200 bg-clip-text text-transparent">te estaban buscando</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base text-brand-100/85 lg:mx-0">
            Miles de títulos en físico, digital y audiolibro. Envío a todo el país, descarga instantánea y las mejores recomendaciones.
          </p>

          {/* Búsqueda */}
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md gap-2 lg:mx-0">
            <div className="relative flex-1">
              <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Busca un libro o autor…"
                className="w-full rounded-xl border-0 bg-white py-3.5 pl-12 pr-4 text-sm text-ink placeholder:text-muted/70 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/25"
              />
            </div>
            <button type="submit" className="btn btn-accent btn-lg shrink-0">Buscar</button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
            <button onClick={scrollToCatalog} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-accent-200">
              Explorar catálogo <Icon name="chevronRight" className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 text-sm text-brand-100/80">
              <span className="flex -space-x-1.5">
                {[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="w-4 h-4 text-accent-400" strokeWidth={0} fill="currentColor" />)}
              </span>
              <span className="font-medium">4.9</span> · +2.400 reseñas
            </div>
          </div>
        </div>

        {/* Visual: pila de libros flotante */}
        <div className="relative hidden h-[420px] lg:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-72 w-72">
              <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-2xl" />
              {FLOATING_BOOKS.map((b) => <BookCover key={b.title} b={b} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Onda inferior */}
      <svg className="block w-full text-paper" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 60V30c240-30 480-30 720 0s480 30 720 0v30H0Z" />
      </svg>
    </section>
  );
}
