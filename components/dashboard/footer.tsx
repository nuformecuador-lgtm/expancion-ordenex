interface Props {
  generatedAt: string;
  warnings: string[];
}

export function Footer({ generatedAt, warnings }: Props) {
  return (
    <footer className="mt-16 border-t border-[var(--border)] pt-6 pb-8">
      {warnings.length > 0 && (
        <div className="mb-4 surface p-3 text-[11px] text-[var(--yellow)]">
          {warnings.map((w, i) => (
            <p key={i} className="font-mono">⚠ {w}</p>
          ))}
        </div>
      )}
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
        expancion-ordenex · refresh diario 6:00 AM CR · datos del CRM Director Ecommerce
      </p>
      <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
        último build · {new Date(generatedAt).toISOString()}
      </p>
    </footer>
  );
}
