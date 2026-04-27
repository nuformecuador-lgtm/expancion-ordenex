import { loadSnapshot } from '@/lib/snapshot';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

// ISR: regenerar máximo cada 24h. El cron `/api/refresh` fuerza la
// revalidación a las 6 AM hora Costa Rica (12:00 UTC).
// Por ahora servimos el snapshot estático (data/snapshot.json) generado por
// `npm run snapshot` — no requiere envs en Vercel.
export const revalidate = 86400;
export const dynamic = 'force-static';

export default function DashboardPage() {
  const data = loadSnapshot();
  return <DashboardClient data={data} />;
}
