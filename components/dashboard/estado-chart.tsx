interface Props {
  breakdown: { estado: string; count: number }[];
}

export function EstadoChart({ breakdown }: Props) {
  const max = Math.max(1, ...breakdown.map((b) => b.count));
  return (
    <div className="surface p-5 md:p-6">
      <h3 className="font-display text-base font-bold tracking-[-0.02em] md:text-lg">
        Estados
      </h3>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        confirm. + sin stock · 7d
      </p>
      <ul className="mt-4 space-y-3">
        {breakdown.length === 0 && (
          <li className="text-sm text-[var(--text-muted)]">Sin datos.</li>
        )}
        {breakdown.map((b) => {
          const w = Math.max(2, Math.round((b.count / max) * 100));
          const isSinStock = b.estado === 'PRODUCTO SIN STOCK';
          const color = isSinStock ? 'var(--red)' : 'var(--accent)';
          return (
            <li key={b.estado}>
              <div className="flex items-center justify-between">
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em]">
                  {b.estado}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">
                  {b.count}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-black/30">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${w}%`,
                    background: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
