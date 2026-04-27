import { fetchOrdersCR } from '@/lib/queries';
import { aggregate, emptyDashboard } from '@/lib/aggregations';
import { Header } from '@/components/dashboard/header';
import { KpiGrid } from '@/components/dashboard/kpi-grid';
import { GamCoverage } from '@/components/dashboard/gam-coverage';
import { FocusZones } from '@/components/dashboard/focus-zones';
import { ProvinceGrid } from '@/components/dashboard/province-grid';
import { EstadoChart } from '@/components/dashboard/estado-chart';
import { DailyChart } from '@/components/dashboard/daily-chart';
import { Footer } from '@/components/dashboard/footer';

// ISR: regenerar máximo cada 24h. El cron `/api/refresh` fuerza la
// revalidación a las 6 AM hora Costa Rica (12:00 UTC).
export const revalidate = 86400;
export const dynamic = 'force-static';

export default async function DashboardPage() {
  let data;
  try {
    const { rows, rangeFrom, rangeTo } = await fetchOrdersCR();
    data = aggregate(rows, rangeFrom, rangeTo);
  } catch (e) {
    const now = new Date().toISOString();
    const from = new Date(Date.now() - 7 * 86400_000).toISOString();
    data = emptyDashboard(from, now);
    data.warnings.push(
      `Error leyendo CRM: ${e instanceof Error ? e.message : 'desconocido'}`,
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <Header generatedAt={data.generatedAt} />

      <section className="mt-10 animate-fade-up delay-1">
        <KpiGrid totals={data.totals} />
      </section>

      <section className="mt-12 animate-fade-up delay-2">
        <GamCoverage cobertura={data.cobertura} totals={data.totals} />
      </section>

      <section className="mt-12 animate-fade-up delay-3">
        <FocusZones provincias={data.focusZones} />
      </section>

      <section className="mt-12 animate-fade-up delay-4">
        <ProvinceGrid provincias={data.provincias} />
      </section>

      <section className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-[1fr_2fr] animate-fade-up delay-5">
        <EstadoChart breakdown={data.estadoBreakdown} />
        <DailyChart daily={data.daily} />
      </section>

      <Footer generatedAt={data.generatedAt} warnings={data.warnings} />
    </main>
  );
}
