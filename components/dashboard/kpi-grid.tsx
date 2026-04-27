import type { DashboardData } from '@/lib/types';

interface Props {
  totals: DashboardData['totals'];
}

interface Kpi {
  label: string;
  value: number;
  hint?: string;
  accent?: 'green' | 'red' | 'blue' | 'yellow';
}

const ACCENT_VAR: Record<NonNullable<Kpi['accent']>, string> = {
  green: 'var(--accent)',
  red: 'var(--red)',
  blue: 'var(--blue)',
  yellow: 'var(--yellow)',
};

function fmt(n: number): string {
  return new Intl.NumberFormat('es-CR').format(n);
}

export function KpiGrid({ totals }: Props) {
  const kpis: Kpi[] = [
    { label: 'Total relevante', value: totals.total, accent: 'green', hint: 'confirm. + sin stock' },
    { label: 'Confirmadas', value: totals.confirmadas, accent: 'green', hint: 'todos los canales' },
    { label: 'Sin stock', value: totals.sinStock, accent: 'red', hint: 'pedidos perdidos' },
    { label: 'Provincias activas', value: totals.provinciasActivas, accent: 'blue', hint: 'con pedidos esta semana' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {kpis.map((k, i) => (
        <div
          key={k.label}
          className="surface relative overflow-hidden p-5 md:p-6"
          style={{ animationDelay: `${0.05 * (i + 1)}s` }}
        >
          <div
            className="absolute left-0 top-0 h-[2px] w-full opacity-60"
            style={{
              background: `linear-gradient(90deg, ${ACCENT_VAR[k.accent ?? 'green']}, transparent)`,
            }}
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {k.label}
          </p>
          <p
            className="mt-2 font-display font-extrabold tracking-[-0.04em]"
            style={{
              fontSize: 'clamp(28px, 5vw, 44px)',
              color: ACCENT_VAR[k.accent ?? 'green'],
            }}
          >
            {fmt(k.value)}
          </p>
          {k.hint && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
              {k.hint}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
