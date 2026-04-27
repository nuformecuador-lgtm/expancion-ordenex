import type { DailyBucket } from '@/lib/types';

interface Props {
  daily: DailyBucket[];
}

function shortDay(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return new Intl.DateTimeFormat('es-CR', {
    timeZone: 'America/Costa_Rica',
    day: '2-digit',
    month: 'short',
  }).format(d);
}

export function DailyChart({ daily }: Props) {
  const max = Math.max(
    1,
    ...daily.map((d) => d.confirmadas + d.sinStock),
  );

  return (
    <div className="surface p-5 md:p-6">
      <h3 className="font-display text-base font-bold tracking-[-0.02em] md:text-lg">
        Volumen diario
      </h3>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        últimos 7 días · confirmadas / sin stock
      </p>
      <div className="mt-6 flex h-44 items-end gap-2 md:gap-3">
        {daily.map((d) => {
          const total = d.confirmadas + d.sinStock;
          const hPct = (total / max) * 100;
          const confirmadasH = total > 0 ? (d.confirmadas / total) * hPct : 0;
          const sinStockH = total > 0 ? (d.sinStock / total) * hPct : 0;
          return (
            <div
              key={d.fecha}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <div className="relative flex h-full w-full flex-col justify-end">
                {sinStockH > 0 && (
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${sinStockH}%`,
                      background: 'var(--red)',
                      boxShadow: '0 0 6px var(--red)',
                    }}
                    title={`Sin stock: ${d.sinStock}`}
                  />
                )}
                {confirmadasH > 0 && (
                  <div
                    className="w-full transition-all"
                    style={{
                      height: `${confirmadasH}%`,
                      background: 'var(--accent)',
                      boxShadow: '0 0 8px var(--accent)',
                      borderTopLeftRadius: sinStockH === 0 ? '2px' : 0,
                      borderTopRightRadius: sinStockH === 0 ? '2px' : 0,
                    }}
                    title={`Confirmadas: ${d.confirmadas}`}
                  />
                )}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                {shortDay(d.fecha)}
              </span>
              <span className="font-mono text-[10px] text-[var(--text)]">
                {total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
