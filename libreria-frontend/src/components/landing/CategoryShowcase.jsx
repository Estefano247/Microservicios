import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import Reveal from '../ui/Reveal';

// Categorías destacadas con su gradiente e icono.
const CATS = [
  { value: 'NOVELA', label: 'Novela', icon: 'book', from: 'from-brand-600', to: 'to-brand-800' },
  { value: 'CIENCIA_FICCION', label: 'Ciencia Ficción', icon: 'sparkle', from: 'from-indigo-500', to: 'to-indigo-800' },
  { value: 'HISTORIA', label: 'Historia', icon: 'receipt', from: 'from-amber-500', to: 'to-accent-700' },
  { value: 'INFANTIL', label: 'Infantil', icon: 'star', from: 'from-rose-400', to: 'to-rose-600' },
  { value: 'FANTASIA', label: 'Fantasía', icon: 'sparkle', from: 'from-violet-500', to: 'to-violet-800' },
  { value: 'TECNICO', label: 'Técnico', icon: 'box', from: 'from-sky-500', to: 'to-sky-800' },
  { value: 'POESIA', label: 'Poesía', icon: 'book', from: 'from-teal-500', to: 'to-teal-800' },
  { value: 'MISTERIO', label: 'Misterio', icon: 'search', from: 'from-stone-600', to: 'to-stone-900' },
];

export default function CategoryShowcase() {
  return (
    <section className="page py-12">
      <Reveal>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Explora por género</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Categorías para cada lector</h2>
          </div>
          <Link to="/?categoria=" className="hidden shrink-0 text-sm font-semibold text-brand-700 hover:underline sm:block">
            Ver todas →
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {CATS.map((c, i) => (
          <Reveal key={c.value} delay={(i % 4) * 80}>
            <Link
              to={`/?categoria=${c.value}`}
              className={`group relative flex h-32 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${c.from} ${c.to} p-4 text-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]`}
            >
              <span
                className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150"
              />
              <Icon name={c.icon} className="relative w-6 h-6 opacity-90" />
              <div className="relative flex items-center justify-between">
                <span className="font-display text-lg font-semibold">{c.label}</span>
                <Icon name="chevronRight" className="w-4 h-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
