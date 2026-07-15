import { useState } from 'react';
import Icon from './Icon';

// Paleta de degradados tipo "portada editorial" (colores ricos y variados).
const PALETTE = [
  ['#1f5c3d', '#0f2c1f'], // verde bosque
  ['#b45309', '#7c2d12'], // terracota
  ['#1e3a5f', '#0f2942'], // azul noche
  ['#4c1d95', '#2e1065'], // violeta
  ['#7f1d1d', '#450a0a'], // vino
  ['#115e59', '#042f2e'], // teal
  ['#3f3f46', '#18181b'], // carbón
  ['#78350f', '#451a03'], // marrón
  ['#155e75', '#083344'], // cian profundo
  ['#9a3412', '#431407'], // óxido
];

function hash(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h + str.charCodeAt(i) * (i + 1)) % 997;
  return h;
}

// Portada "de diseño" generada a partir del título (siempre disponible, sin red).
function GeneratedCover({ title, author, big }) {
  const [c1, c2] = PALETTE[hash(title) % PALETTE.length];
  return (
    <div
      className="flex h-full w-full flex-col justify-between p-4 text-white"
      style={{ backgroundImage: `linear-gradient(145deg, ${c1}, ${c2})` }}
    >
      <Icon name="book" className={big ? 'w-7 h-7 opacity-60' : 'w-5 h-5 opacity-55'} />
      <div className="min-h-0">
        <p className={`font-display font-semibold leading-tight ${big ? 'text-2xl line-clamp-5' : 'text-sm line-clamp-4'}`}>
          {title}
        </p>
        {author && (
          <p className={`mt-1.5 text-white/75 ${big ? 'text-sm' : 'text-[11px]'} line-clamp-1`}>{author}</p>
        )}
      </div>
      <span className={`rounded-full bg-white/40 ${big ? 'h-1 w-12' : 'h-0.5 w-8'}`} />
    </div>
  );
}

// Portada con imagen real (si carga) sobre una portada generada de respaldo.
export default function BookCover({ src, title, author, big = false }) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <GeneratedCover title={title} author={author} big={big} />
      {showImg && (
        <img
          src={src}
          alt={title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
    </div>
  );
}
