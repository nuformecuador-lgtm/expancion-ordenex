interface Props {
  label: string;
}

export function LivePill({ label }: Props) {
  return (
    <div className="surface inline-flex items-center gap-2 self-start px-3 py-2">
      <span className="live-dot" aria-hidden />
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text)]">
        {label}
      </span>
    </div>
  );
}
