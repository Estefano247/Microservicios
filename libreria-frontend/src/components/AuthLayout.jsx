import { Link } from 'react-router-dom';
import Icon from './ui/Icon';
import BrandMark from './ui/BrandMark';

// Layout de dos paneles para Login / Registro.
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="page grid min-h-[calc(100vh-4rem)] items-center gap-10 py-10 lg:grid-cols-2">
      {/* Panel de marca — solo escritorio */}
      <div className="relative hidden overflow-hidden rounded-3xl bg-brand-800 p-10 lg:flex lg:min-h-[560px] lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }}
        />
        <Link to="/" className="relative flex items-center gap-2.5 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <BrandMark className="h-6 w-6" tone="mono" />
          </span>
          <span className="font-display text-xl font-semibold">Libreria Store</span>
        </Link>

        <div className="relative">
          <Icon name="sparkle" className="mb-5 w-8 h-8 text-accent-400" />
          <blockquote className="font-display text-2xl font-medium leading-snug text-white">
            “Un libro es un sueño que sostienes en las manos.”
          </blockquote>
          <p className="mt-3 text-sm text-brand-100/80">— Neil Gaiman</p>
        </div>

        <div className="relative flex gap-6 text-brand-100/90">
          {[
            { icon: 'book', label: 'Miles de títulos' },
            { icon: 'download', label: 'Formato digital' },
            { icon: 'lock', label: 'Pago seguro' },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-2 text-xs font-medium">
              <Icon name={f.icon} className="w-4 h-4" /> {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Panel de formulario */}
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center lg:text-left">
          <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}
