'use client';

import { useMemo, useState } from 'react';
import type { DashboardData, GamStatus } from '@/lib/types';
import { Header } from './header';
import { KpiGrid } from './kpi-grid';
import { GamCoverage } from './gam-coverage';
import { FocusZones } from './focus-zones';
import { ProvinceGrid } from './province-grid';
import { EstadoChart } from './estado-chart';
import { DailyChart } from './daily-chart';
import { Footer } from './footer';

type GamFilter = 'todas' | GamStatus;
type SortMode = 'volumen' | 'nombre';

const FILTERS: { id: GamFilter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'cubre', label: 'GAM cubre' },
  { id: 'parcial', label: 'GAM parcial' },
  { id: 'expandir', label: 'A expandir' },
];

interface Props {
  data: DashboardData;
}

export function DashboardClient({ data }: Props) {
  const [filter, setFilter] = useState<GamFilter>('todas');
  const [sort, setSort] = useState<SortMode>('volumen');
  const [search, setSearch] = useState('');

  const filteredProvincias = useMemo(() => {
    let list = data.provincias.slice();
    if (filter !== 'todas') list = list.filter((p) => p.gam === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list
        .map((p) => ({
          ...p,
          cantones: p.cantones.filter((c) =>
            c.canton.toLowerCase().includes(q),
          ),
        }))
        .filter((p) => p.cantones.length > 0 || p.provincia.toLowerCase().includes(q));
    }
    if (sort === 'nombre') {
      list.sort((a, b) => a.provincia.localeCompare(b.provincia));
    } else {
      list.sort((a, b) => b.total - a.total);
    }
    return list;
  }, [data.provincias, filter, sort, search]);

  // Recalcular totales según filtro
  const filteredTotals = useMemo(() => {
    const t = filteredProvincias.reduce(
      (acc, p) => {
        acc.confirmadas += p.confirmadas;
        acc.sinStock += p.sinStock;
        acc.total += p.total;
        return acc;
      },
      { confirmadas: 0, sinStock: 0, total: 0, provinciasActivas: 0 },
    );
    t.provinciasActivas = filteredProvincias.filter(
      (p) => p.provincia !== 'Sin clasificar',
    ).length;
    return t;
  }, [filteredProvincias]);

  function scrollToProvince(name: string) {
    const el = document.getElementById(`prov-${name}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('ring-2', 'ring-[var(--accent)]');
      setTimeout(() => el.classList.remove('ring-2', 'ring-[var(--accent)]'), 1500);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-8 md:py-12">
      <Header
        generatedAt={data.generatedAt}
        rangeFrom={data.rangeFrom}
        rangeTo={data.rangeTo}
      />

      <section className="mt-10 animate-fade-up delay-1">
        <KpiGrid totals={filteredTotals} />
      </section>

      <section className="mt-8 animate-fade-up delay-2">
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
          search={search}
          setSearch={setSearch}
          counts={countsByFilter(data)}
        />
      </section>

      <section className="mt-8 animate-fade-up delay-3">
        <GamCoverage cobertura={data.cobertura} totals={data.totals} />
      </section>

      <section className="mt-12 animate-fade-up delay-4">
        <FocusZones
          provincias={data.focusZones}
          onPick={(name) => scrollToProvince(name)}
        />
      </section>

      <section className="mt-12 animate-fade-up delay-5">
        <ProvinceGrid provincias={filteredProvincias} />
      </section>

      <section className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-[1fr_2fr] animate-fade-up delay-6">
        <EstadoChart breakdown={data.estadoBreakdown} />
        <DailyChart daily={data.daily} />
      </section>

      <Footer generatedAt={data.generatedAt} warnings={data.warnings} />
    </main>
  );
}

function countsByFilter(data: DashboardData) {
  const c: Record<GamFilter, number> = {
    todas: data.provincias.length,
    cubre: 0,
    parcial: 0,
    expandir: 0,
    'no-aplica': 0,
  };
  for (const p of data.provincias) c[p.gam]++;
  return c;
}

interface FilterBarProps {
  filter: GamFilter;
  setFilter: (v: GamFilter) => void;
  sort: SortMode;
  setSort: (v: SortMode) => void;
  search: string;
  setSearch: (v: string) => void;
  counts: Record<GamFilter, number>;
}

function FilterBar({
  filter,
  setFilter,
  sort,
  setSort,
  search,
  setSearch,
  counts,
}: FilterBarProps) {
  return (
    <div className="surface flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="font-mono text-[10px] uppercase tracking-[0.15em] rounded-full px-3 py-1.5 transition-all min-h-[36px]"
              style={{
                background: active ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                color: active ? '#0a0f0d' : 'var(--text)',
                border: `0.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {f.label}
              <span
                className="ml-2 opacity-60"
                style={{ color: active ? '#0a0f0d' : 'var(--text-muted)' }}
              >
                {counts[f.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="search"
          inputMode="search"
          placeholder="Buscar cantón…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 md:w-56 font-mono text-xs bg-black/30 border border-[var(--border)] rounded-md px-3 py-2 text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          type="button"
          onClick={() => setSort(sort === 'volumen' ? 'nombre' : 'volumen')}
          className="font-mono text-[10px] uppercase tracking-[0.15em] rounded-md border border-[var(--border)] px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors min-h-[36px]"
          title="Cambiar orden"
        >
          ↕ {sort}
        </button>
      </div>
    </div>
  );
}
