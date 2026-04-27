import type { ProvinciaStat } from '@/lib/types';
import { ProvinceCard } from './province-card';

interface Props {
  provincias: ProvinciaStat[];
}

export function ProvinceGrid({ provincias }: Props) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em] md:text-xl">
          Todas las provincias
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
          tap para ver cantones
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        {provincias.map((p) => (
          <ProvinceCard key={p.provincia} p={p} />
        ))}
      </div>
    </div>
  );
}
