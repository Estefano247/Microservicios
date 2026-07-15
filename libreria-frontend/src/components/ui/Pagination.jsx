import Icon from './Icon';

// Paginación con ventana deslizante. Espera una página estilo Spring (0-index).
export default function Pagination({ page, totalPages, onChange, maxVisible = 7 }) {
  if (!totalPages || totalPages <= 1) return null;

  let start = Math.max(0, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible);
  if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
  const pages = [];
  for (let i = start; i < end; i++) pages.push(i);

  const base = 'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors';

  return (
    <nav className="flex justify-center items-center gap-1.5 mt-10" aria-label="Paginación">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 0}
        className={`${base} h-9 w-9 border border-line bg-white text-ink hover:bg-surface-soft disabled:opacity-40 disabled:hover:bg-white`}
        aria-label="Página anterior"
      >
        <Icon name="chevronLeft" className="w-4 h-4" />
      </button>

      {start > 0 && <span className="px-1 text-muted">…</span>}

      {pages.map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          aria-current={i === page ? 'page' : undefined}
          className={`${base} h-9 min-w-9 px-2 ${
            i === page
              ? 'bg-brand-600 text-white shadow-sm'
              : 'border border-line bg-white text-ink hover:bg-surface-soft'
          }`}
        >
          {i + 1}
        </button>
      ))}

      {end < totalPages && <span className="px-1 text-muted">…</span>}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className={`${base} h-9 w-9 border border-line bg-white text-ink hover:bg-surface-soft disabled:opacity-40 disabled:hover:bg-white`}
        aria-label="Página siguiente"
      >
        <Icon name="chevronRight" className="w-4 h-4" />
      </button>
    </nav>
  );
}
