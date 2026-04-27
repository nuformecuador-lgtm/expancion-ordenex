'use client';

import { useState } from 'react';
import type { ProvinciaStat, GamStatus } from '@/lib/types';

interface Props {
  p: ProvinciaStat;
}

const GAM_BADGE: Record<GamStatus, { label: string; color: string }> = {
  cubre: { label: 'GAM cubre', color: 'var(--accent)' },
  parcial: { label: 'GAM parcial', color: 'var(--yellow)' },
  expandir: { label: 'expandir', color: 'var(--blue)' },
  'no-aplica': { label: '—', color: 'var(--text-muted)' },
};

export function ProvinceCard({ p }: Props) {
  const [open, setOpen] = useState(false);
  const badge = GAM_BADGE[p.gam];

  return (
    <div
      id={`prov-${p.provincia}`}
      className="surface overflow-hidden transition-all rounded-xl"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full min-h-[44px] items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em]"
              style={{
                background: `${badge.color}1f`,
                color: badge.color,
              }}
            >
              {badge.label}
            </span>
            {p.ruta && (
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--blue)]">
                {p.ruta}
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate font-display text-lg font-bold tracking-[-0.02em]">
            {p.provincia}
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
            {p.hub}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-[var(--accent)]">
              {p.total}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)]">
              {p.confirmadas} ok · {p.sinStock} sst
            </p>
          </div>
          <span
            className="font-mono text-xs text-[var(--text-muted)] transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▾
          </span>
        </div>
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-[350ms] ease-in-out"
        style={{ maxHeight: open ? `${Math.min(420, p.cantones.length * 36 + 40)}px` : '0px' }}
      >
        <div className="border-t border-[var(--border)] px-5 py-3">
          {p.cantones.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Sin cantones.</p>
          ) : (
            <ul className="space-y-1.5">
              {p.cantones.map((c) => (
                <li
                  key={c.canton}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{c.canton}</span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">
                    {c.confirmadas}<span className="text-[var(--accent)]">·</span>{c.sinStock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
