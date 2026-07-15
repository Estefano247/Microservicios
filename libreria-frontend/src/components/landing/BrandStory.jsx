import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import Reveal from '../ui/Reveal';

const POINTS = [
  'Curaduría experta: cada título elegido con cuidado.',
  'Físico, digital y audio en un solo lugar.',
  'Seguimiento de pedidos en tiempo real.',
];

export default function BrandStory() {
  return (
    <section className="page py-14">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="relative flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-accent-50 p-10">
            <div className="blob pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-brand-200/50" />
            <div className="blob pointer-events-none absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-accent-100/60" style={{ animationDelay: '2s' }} />
            <img
              src="/logo.png"
              alt="Libreria Store"
              className="relative float-y w-64 max-w-full drop-shadow-xl"
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Sobre Libreria Store</p>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Una librería moderna, pensada para lectores exigentes
            </h2>
            <p className="mt-4 text-muted">
              Combinamos la calidez de la librería de barrio con la comodidad de la mejor tecnología.
              Descubre, compra y disfruta tus libros favoritos en el formato que prefieras.
            </p>
            <ul className="mt-6 space-y-3">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                    <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.2} />
                  </span>
                  <span className="text-sm text-ink">{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn btn-primary btn-lg">Crear cuenta gratis</Link>
              <a href="#catalogo" className="btn btn-secondary btn-lg">Explorar catálogo</a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
