// Spinner en línea y loader de página completa.
export function Spinner({ className = 'w-5 h-5', color = 'border-brand-600' }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block animate-spin rounded-full border-[3px] border-t-transparent ${color} ${className}`}
    />
  );
}

export function PageLoader({ label = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner className="w-9 h-9" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export default PageLoader;
