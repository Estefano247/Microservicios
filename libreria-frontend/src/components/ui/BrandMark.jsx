// Marca "Libreria Store": libro abierto + carrito, inspirada en el logo oficial.
// tone="color" → dos verdes (claro/oscuro); tone="mono" → usa currentColor.
export default function BrandMark({ className = 'h-9 w-9', tone = 'color' }) {
  const mono = tone === 'mono';
  const dark = mono ? 'currentColor' : '#12692f';
  const bright = mono ? 'currentColor' : '#38b34a';
  const cart = mono ? 'currentColor' : '#12692f';
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      {/* Carrito */}
      <g stroke={cart} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.8 12.2h2.4l2.1 9.3h11.5l1.9-6.9H18.1" />
      </g>
      <circle cx="20.6" cy="25" r="1.5" fill={cart} />
      <circle cx="29.6" cy="25" r="1.5" fill={cart} />
      {/* Libro — página izquierda (oscura) */}
      <path d="M24 22c-4.5-2.8-10-4.4-18-4.4V34c8 0 13.5 1.6 18 4.4Z" fill={dark} opacity={mono ? 0.9 : 1} />
      {/* Libro — página derecha (clara) */}
      <path d="M24 22c4.5-2.8 10-4.4 18-4.4V34c-8 0-13.5 1.6-18 4.4Z" fill={bright} />
      {/* Lomo */}
      <path d="M24 22v16.4" stroke={mono ? 'currentColor' : '#0e5427'} strokeWidth="1.5" strokeLinecap="round" opacity={mono ? 0.5 : 1} />
    </svg>
  );
}
