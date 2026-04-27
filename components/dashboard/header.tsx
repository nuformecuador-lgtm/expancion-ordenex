import { LivePill } from '@/components/ui/live-pill';

interface Props {
  generatedAt: string;
}

function formatCR(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-CR', {
    timeZone: 'America/Costa_Rica',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function Header({ generatedAt }: Props) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Nuform · Operación COD
        </p>
        <h1
          className="mt-2 font-display font-extrabold leading-[0.95] tracking-[-0.04em]"
          style={{ fontSize: 'clamp(36px, 8vw, 72px)' }}
        >
          Operación COD
          <br />
          <span className="text-[var(--accent)]">Costa Rica</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--text-muted)] md:text-base">
          Dashboard semanal de expansión GAM. Lectura directa del CRM —
          confirmadas + sin stock, últimos 7 días.
        </p>
      </div>
      <LivePill label={`Actualizado · ${formatCR(generatedAt)}`} />
    </header>
  );
}
