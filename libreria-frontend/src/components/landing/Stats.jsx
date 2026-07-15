import { useEffect, useRef, useState } from 'react';

function Counter({ to, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const dur = 1500;
      let start;
      const step = (t) => {
        if (!start) start = t;
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(to * eased);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);

  const display = val.toLocaleString('es-PE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span ref={ref}>{display}{suffix}</span>;
}

const STATS = [
  { to: 12000, suffix: '+', label: 'Títulos disponibles' },
  { to: 48000, suffix: '+', label: 'Lectores felices' },
  { to: 4.9, decimals: 1, label: 'Valoración media' },
  { to: 25, suffix: '', label: 'Ciudades con envío' },
];

export default function Stats() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-900 py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />
      <div className="page relative grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="font-display text-4xl font-semibold text-white sm:text-5xl">
              <Counter to={s.to} suffix={s.suffix} decimals={s.decimals || 0} />
            </p>
            <p className="mt-2 text-sm text-brand-100/80">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
