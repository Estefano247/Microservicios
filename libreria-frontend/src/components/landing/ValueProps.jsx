import Icon from '../ui/Icon';
import Reveal from '../ui/Reveal';

const ITEMS = [
  { icon: 'truck', title: 'Envío 24-48h', desc: 'Despacho rápido a todo el país con seguimiento.' },
  { icon: 'download', title: 'Entrega digital', desc: 'E-books y audiolibros disponibles al instante.' },
  { icon: 'refresh', title: 'Devolución fácil', desc: '30 días para cambios y devoluciones sin costo.' },
  { icon: 'lock', title: 'Pago 100% seguro', desc: 'Transacciones cifradas y datos protegidos.' },
];

export default function ValueProps() {
  return (
    <section className="page py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((it, i) => (
          <Reveal key={it.title} delay={i * 90}>
            <div className="card h-full p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon name={it.icon} className="w-6 h-6" />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{it.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{it.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
