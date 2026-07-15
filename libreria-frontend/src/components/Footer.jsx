import { Link } from 'react-router-dom';
import Icon from './ui/Icon';
import BrandMark from './ui/BrandMark';

const FEATURES = [
  { icon: 'truck', title: 'Envío a todo el país', desc: 'Despacho en 24-48h a nivel nacional' },
  { icon: 'download', title: 'Entrega digital', desc: 'Descarga tus e-books al instante' },
  { icon: 'lock', title: 'Pago seguro', desc: 'Tus datos siempre protegidos' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface-soft">
      {/* Beneficios */}
      <div className="page border-b border-line">
        <div className="grid gap-6 py-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon name={f.icon} className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{f.title}</p>
                <p className="text-xs text-muted mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pie */}
      <div className="page py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BrandMark className="h-9 w-9" />
              <span className="font-display text-lg font-semibold">
                <span className="text-brand-700">Libreria</span> <span className="text-brand-500">Store</span>
              </span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Libros físicos, digitales y audiolibros. Descubre tu próxima gran lectura.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <Link to="/" className="text-muted hover:text-brand-700">Catálogo</Link>
            <Link to="/cart" className="text-muted hover:text-brand-700">Carrito</Link>
            <Link to="/profile/orders" className="text-muted hover:text-brand-700">Mis pedidos</Link>
            <Link to="/login" className="text-muted hover:text-brand-700">Ingresar</Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-line pt-6 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Libreria Store · Proyecto académico de arquitectura de microservicios.
        </div>
      </div>
    </footer>
  );
}
