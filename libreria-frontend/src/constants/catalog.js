// Catálogo: etiquetas y estilos compartidos en toda la app.

export const CATEGORIES = [
  { label: 'Todas', value: '' },
  { label: 'Novela', value: 'NOVELA' },
  { label: 'Ciencia Ficción', value: 'CIENCIA_FICCION' },
  { label: 'Ficción', value: 'FICCION' },
  { label: 'Historia', value: 'HISTORIA' },
  { label: 'Biografía', value: 'BIOGRAFIA' },
  { label: 'Poesía', value: 'POESIA' },
  { label: 'Infantil', value: 'INFANTIL' },
  { label: 'Técnico', value: 'TECNICO' },
  { label: 'Ensayo', value: 'ENSAYO' },
  { label: 'Misterio', value: 'MISTERIO' },
  { label: 'Drama', value: 'DRAMA' },
  { label: 'Fantasía', value: 'FANTASIA' },
  { label: 'Romance', value: 'ROMANCE' },
  { label: 'Comedia', value: 'COMEDIA' },
];

// Categorías sin la opción "Todas" (para formularios/detalle).
export const CATEGORY_VALUES = CATEGORIES.filter((c) => c.value).map((c) => c.value);

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.filter((c) => c.value).map((c) => [c.value, c.label])
);

export const TYPES = ['FISICO', 'DIGITAL', 'AUDIO_LIBRO'];

export const TYPE_LABELS = { FISICO: 'Físico', DIGITAL: 'Digital', AUDIO_LIBRO: 'Audiolibro' };

export const TYPE_BADGE = {
  FISICO: 'bg-brand-50 text-brand-700',
  DIGITAL: 'bg-accent-50 text-accent-700',
  AUDIO_LIBRO: 'bg-violet-50 text-violet-700',
};

export const isDigitalType = (tipo) => tipo === 'DIGITAL' || tipo === 'AUDIO_LIBRO';

// Estados de pedido.
export const ORDER_STATUS = ['PENDIENTE', 'PAGO_PENDIENTE', 'RESERVADO', 'COMPLETADO', 'CANCELADO', 'FALLIDO'];

export const STATUS_LABELS = {
  PENDIENTE: 'Pendiente',
  PAGO_PENDIENTE: 'Pago pendiente',
  RESERVADO: 'Reservado',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
  FALLIDO: 'Fallido',
};

export const STATUS_BADGE = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  PAGO_PENDIENTE: 'bg-orange-100 text-orange-800',
  RESERVADO: 'bg-sky-100 text-sky-800',
  COMPLETADO: 'bg-brand-100 text-brand-800',
  CANCELADO: 'bg-red-100 text-red-700',
  FALLIDO: 'bg-stone-200 text-stone-600',
};

// Formatea un precio en Soles.
export const formatPrice = (value) =>
  `S/ ${Number(value || 0).toFixed(2)}`;
