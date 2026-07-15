import Icon from './Icon';

// Estado vacío reutilizable con icono, título, descripción y acción opcional.
export default function EmptyState({ icon = 'book', title, description, children }) {
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon name={icon} className="w-8 h-8" strokeWidth={1.4} />
      </div>
      <p className="text-lg font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-muted mt-1.5 max-w-sm mx-auto">{description}</p>}
      {children && <div className="mt-6 flex justify-center">{children}</div>}
    </div>
  );
}
