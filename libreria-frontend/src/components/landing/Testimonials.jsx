import Icon from '../ui/Icon';
import Reveal from '../ui/Reveal';

const REVIEWS = [
  { name: 'María Fernanda', role: 'Lectora frecuente', text: 'La entrega fue rapidísima y el empaque impecable. La experiencia de compra se siente premium de principio a fin.', initial: 'M', tint: 'bg-brand-100 text-brand-700' },
  { name: 'Carlos Rivas', role: 'Cliente digital', text: 'Compré un audiolibro y lo empecé a escuchar al instante. La app es fluida y muy fácil de usar.', initial: 'C', tint: 'bg-accent-100 text-accent-700' },
  { name: 'Lucía Mendoza', role: 'Club de lectura', text: 'El catálogo es enorme y las recomendaciones siempre aciertan. Mi librería favorita, sin duda.', initial: 'L', tint: 'bg-sky-100 text-sky-700' },
];

export default function Testimonials() {
  return (
    <section className="page py-14">
      <Reveal>
        <div className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Opiniones reales</p>
          <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Lo que dicen nuestros lectores</h2>
        </div>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <Reveal key={r.name} delay={i * 100}>
            <figure className="card flex h-full flex-col p-6">
              <div className="flex gap-0.5 text-accent-400">
                {[0, 1, 2, 3, 4].map((s) => <Icon key={s} name="star" className="w-4 h-4" strokeWidth={0} fill="currentColor" />)}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/90">“{r.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${r.tint}`}>{r.initial}</span>
                <div>
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-muted">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
