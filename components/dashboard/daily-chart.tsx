'use client';

import { useState } from 'react';
import type { DailyBucket } from '@/lib/types';

interface Props {
  daily: DailyBucket[];
}

function shortDay(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return new Intl.DateTimeFormat('es-CR', {
    timeZone: 'America/Costa_Rica',
    day: '2-digit',
    weekday: 'short',
  }).format(d);
}

export function DailyChart({ daily }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.confirmadas + d.sinStock));

  return (
    <div className="surface p-5 md:p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="font-display text-base font-bold tracking-[-0.02em] md:text-lg">
            Volumen diario
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            semana · confirmadas / sin stock
          </p>
        </div>
        {hover !== null && daily[hover] && (
          <div className="text-right font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text)]">
            <p>{shortDay(daily[hover].fecha)}</p>
            <p className="text-[var(--accent)]">
              {daily[hover].confirmadas} ok
            </p>
            <p className="text-[var(--red)]">{daily[hover].sinStock} sst</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex h-44 items-end gap-2 md:gap-3">
        {daily.map((d, i) => {
          const total = d.confirmadas + d.sinStock;
          const hPct = (total / max) * 100;
          const confirmadasH = total > 0 ? (d.confirmadas / total) * hPct : 0;
          const sinStockH = total > 0 ? (d.sinStock / total) * hPct : 0;
          const isHover = hover === i;
          return (
            <div
              key={d.fecha}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onTouchStart={() => setHover(i)}
              onTouchEnd={() => setTimeout(() => setHover(null), 1200)}
              className="flex min-w-[36px] flex-1 cursor-pointer flex-col items-center gap-1.5 touch-manipulation"
            >
              <div className="relative flex h-full w-full flex-col justify-end">
                {sinStockH > 0 && (
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: `${sinStockH}%`,
                      background: 'var(--red)',
                      boxShadow: isHover ? '0 0 12px var(--red)' : '0 0 6px var(--red)',
                      opacity: isHover ? 1 : 0.9,
                    }}
                  />
                )}
                {confirmadasH > 0 && (
                  <div
                    className="w-full transition-all"
                    style={{
                      height: `${confirmadasH}%`,
                      background: 'var(--accent)',
                      boxShadow: isHover
                        ? '0 0 14px var(--accent)'
                        : '0 0 8px var(--accent)',
                      opacity: isHover || hover === null ? 1 : 0.55,
                      borderTopLeftRadius: sinStockH === 0 ? '2px' : 0,
                      borderTopRightRadius: sinStockH === 0 ? '2px' : 0,
                    }}
                  />
                )}
              </div>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.1em]"
                style={{
                  color: isHover ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
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
