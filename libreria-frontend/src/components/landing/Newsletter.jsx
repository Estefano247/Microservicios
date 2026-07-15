import { useState } from 'react';
import { useToast } from '../Toast';
import Icon from '../ui/Icon';
import Reveal from '../ui/Reveal';

export default function Newsletter() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    addToast('¡Listo! Te avisaremos de las novedades.');
    setEmail('');
  };

  return (
    <section className="page py-14">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-14 text-center sm:px-12">
          <div className="blob pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-500/20" />
          <div className="blob pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-brand-400/25" style={{ animationDelay: '2s' }} />
          <div className="relative mx-auto max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-100 ring-1 ring-white/15">
              <Icon name="sparkle" className="w-3.5 h-3.5 text-accent-400" /> Newsletter
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
              Recibe las novedades antes que nadie
            </h2>
            <p className="mt-3 text-brand-100/85">
              Recomendaciones, lanzamientos y ofertas exclusivas directo en tu correo.
            </p>
            <form onSubmit={submit} className="mx-auto mt-7 flex max-w-md flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Icon name="user" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder:text-muted/70 shadow-lg focus:outline-none focus:ring-4 focus:ring-white/25"
                />
              </div>
              <button type="submit" className="btn btn-accent btn-lg shrink-0">Suscribirme</button>
            </form>
            <p className="mt-3 text-xs text-brand-100/60">Sin spam. Cancela cuando quieras.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
