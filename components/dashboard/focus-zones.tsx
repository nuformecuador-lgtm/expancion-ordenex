import type { ProvinciaStat } from '@/lib/types';

interface Props {
  provincias: ProvinciaStat[];
}

export function FocusZones({ provincias }: Props) {
  if (provincias.length === 0) {
    return (
      <div className="surface p-6 text-sm text-[var(--text-muted)]">
        Sin pedidos confirmados o sin stock en zonas de expansión esta semana.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em] md:text-xl">
          Zonas estratégicas
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Foco · expansión GAM
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        {provincias.map((p) => (
          <FocusCard key={p.provincia} p={p} />
        ))}
      </div>
    </div>
  );
}

function FocusCard({ p }: { p: ProvinciaStat }) {
  const top = p.cantones.slice(0, 5);
  return (
    <div className="surface relative overflow-hidden p-5 md:p-6">
      {p.ruta && (
        <div className="absolute right-0 top-0 bg-[var(--blue)]/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--blue)]">
          {p.ruta}
        </div>
      )}
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
        {p.hub}
      </p>
      <h3 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] md:text-3xl">
        {p.provincia}
      </h3>
      <div className="mt-3 flex items-baseline gap-4">
        <div>
          <p className="font-display text-3xl font-bold text-[var(--accent)]">
            {p.confirmadas}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Confirmadas
          </p>
        </div>
        <div>
          <p className="font-display text-3xl font-bold text-[var(--red)]">
            {p.sinStock}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Sin stock
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Top cantones
        </p>
        <ul className="mt-2 space-y-1.5">
          {top.length === 0 && (
            <li className="text-sm text-[var(--text-muted)]">—</li>
          )}
          {top.map((c) => (
            <li
              key={c.canton}
              className="flex items-center justify-between border-b border-[var(--border)] pb-1.5"
            >
              <span className="text-sm">{c.canton}</span>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {c.total}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
