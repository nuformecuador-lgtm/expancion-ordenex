import type { DashboardData } from '@/lib/types';

interface Props {
  cobertura: DashboardData['cobertura'];
  totals: DashboardData['totals'];
}

const SEGMENTS = [
  { key: 'cubre' as const, label: 'GAM cubre', color: 'var(--accent)' },
  { key: 'parcial' as const, label: 'GAM parcial', color: 'var(--yellow)' },
  { key: 'expandir' as const, label: 'A expandir', color: 'var(--blue)' },
];

function pct(n: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((n / total) * 1000) / 10;
}

export function GamCoverage({ cobertura, totals }: Props) {
  const total = cobertura.cubre + cobertura.parcial + cobertura.expandir;

  return (
    <div className="surface surface-strong p-5 md:p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold tracking-[-0.02em] md:text-xl">
          Cobertura GAM
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {totals.total} pedidos · 7d
        </span>
      </div>

      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-black/30">
        {SEGMENTS.map((s) => {
          const v = cobertura[s.key];
          const w = pct(v, total);
          if (w === 0) return null;
          return (
            <div
              key={s.key}
              className="h-full transition-all"
              style={{
                width: `${w}%`,
                background: s.color,
                boxShadow: `0 0 10px ${s.color}`,
              }}
              title={`${s.label}: ${v} (${w}%)`}
            />
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {SEGMENTS.map((s) => {
          const v = cobertura[s.key];
          const w = pct(v, total);
          return (
            <div key={s.key}>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
                  {s.label}
                </span>
              </div>
              <p
                className="mt-1 font-display text-xl font-bold tracking-[-0.03em]"
                style={{ color: s.color }}
              >
                {w}%
              </p>
              <p className="font-mono text-[10px] text-[var(--text-muted)]">
                {v} pedidos
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
