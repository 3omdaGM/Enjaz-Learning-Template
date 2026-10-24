import type { ReactNode } from 'react';

/** Keep every item visible; viewport changes never hide items or add pagination. */
export default function FitPages({ items, className = '', label }: { items: readonly ReactNode[]; className?: string; label: string }) {
  return <div className="fit-pages" role="region" aria-label={label}><div className={className}>{items}</div></div>;
}
