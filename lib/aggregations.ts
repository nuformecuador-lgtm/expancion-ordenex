// Lógica pura de agregación: convierte filas de `orders` en el shape
// que consumen los componentes del dashboard.

import {
  ESTADOS_CONFIRMADOS,
  ESTADO_SIN_STOCK,
  GAM_STATUS,
  HUB_MAP,
  PROVINCIAS_ORDER,
  RUTA_MAP,
  FOCUS_PROVINCIAS,
  RANGE_DAYS,
} from './gam-config';
import { provinciaDeCanton, cleanCantonName } from './cantones-cr';
import type {
  OrderRow,
  DashboardData,
  ProvinciaStat,
  CantonStat,
  Provincia,
  DailyBucket,
} from './types';

const CONFIRMADOS_SET = new Set<string>(ESTADOS_CONFIRMADOS);

function isConfirmada(estado: string | null): boolean {
  return !!estado && CONFIRMADOS_SET.has(estado);
}
function isSinStock(estado: string | null): boolean {
  return estado === ESTADO_SIN_STOCK;
}

function dayKey(iso: string | null): string | null {
  if (!iso) return null;
  // YYYY-MM-DD en UTC. Para dashboard semanal alcanza.
  return iso.slice(0, 10);
}

export function aggregate(
  rows: OrderRow[],
  rangeFrom: string,
  rangeTo: string,
): DashboardData {
  const warnings: string[] = [];

  // Conteos por provincia → cantón
  const byProv = new Map<Provincia, Map<string, CantonStat>>();
  const estadoCount = new Map<string, number>();
  const dailyMap = new Map<string, DailyBucket>();

  // Inicializar buckets diarios para los últimos N días (para que el chart no salte fechas vacías).
  const days = Math.max(1, Math.round((+new Date(rangeTo) - +new Date(rangeFrom)) / 86400000));
  for (let i = 0; i < Math.min(days, RANGE_DAYS); i++) {
    const d = new Date(rangeTo);
    d.setUTCDate(d.getUTCDate() - i);
    const k = d.toISOString().slice(0, 10);
    dailyMap.set(k, { fecha: k, confirmadas: 0, sinStock: 0 });
  }

  let unmatched = 0;

  for (const r of rows) {
    const provincia = provinciaDeCanton(r.ciudad);
    if (provincia === 'Sin clasificar') unmatched++;

    const cantonLabel = cleanCantonName(r.ciudad);

    if (!byProv.has(provincia)) byProv.set(provincia, new Map());
    const cantMap = byProv.get(provincia)!;
    const prev =
      cantMap.get(cantonLabel) ?? {
        canton: cantonLabel,
        confirmadas: 0,
        sinStock: 0,
        total: 0,
      };

    const conf = isConfirmada(r.estado);
    const sin = isSinStock(r.estado);
    if (conf) prev.confirmadas++;
    if (sin) prev.sinStock++;
    if (conf || sin) prev.total++;
    cantMap.set(cantonLabel, prev);

    if (r.estado) {
      estadoCount.set(r.estado, (estadoCount.get(r.estado) ?? 0) + 1);
    }

    const dk = dayKey(r.created_at);
    if (dk) {
      const bucket =
        dailyMap.get(dk) ?? { fecha: dk, confirmadas: 0, sinStock: 0 };
      if (conf) bucket.confirmadas++;
      if (sin) bucket.sinStock++;
      dailyMap.set(dk, bucket);
    }
  }

  if (unmatched > 0) {
    warnings.push(
      `${unmatched} orden(es) con cantón no reconocido — revisar limpieza de \`ciudad\` en CRM.`,
    );
  }

  const provincias: ProvinciaStat[] = PROVINCIAS_ORDER
    .map((prov) => {
      const cantMap = byProv.get(prov) ?? new Map();
      const cantones = Array.from(cantMap.values()).sort(
        (a, b) => b.total - a.total,
      );
      const confirmadas = cantones.reduce((s, c) => s + c.confirmadas, 0);
      const sinStock = cantones.reduce((s, c) => s + c.sinStock, 0);
      return {
        provincia: prov,
        gam: GAM_STATUS[prov],
        hub: HUB_MAP[prov],
        ruta: RUTA_MAP[prov] ?? null,
        confirmadas,
        sinStock,
        total: confirmadas + sinStock,
        cantones,
      };
    })
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total);

  const totals = provincias.reduce(
    (acc, p) => {
      acc.confirmadas += p.confirmadas;
      acc.sinStock += p.sinStock;
      acc.total += p.total;
      return acc;
    },
    { confirmadas: 0, sinStock: 0, total: 0, provinciasActivas: 0 },
  );
  totals.provinciasActivas = provincias.filter(
    (p) => p.provincia !== 'Sin clasificar',
  ).length;

  // Cobertura GAM: % del total que cae en cada bucket.
  const cobertura = { cubre: 0, parcial: 0, expandir: 0 };
  for (const p of provincias) {
    if (p.gam === 'cubre') cobertura.cubre += p.total;
    else if (p.gam === 'parcial') cobertura.parcial += p.total;
    else if (p.gam === 'expandir') cobertura.expandir += p.total;
  }

  const focusZones = provincias.filter((p) =>
    FOCUS_PROVINCIAS.includes(p.provincia),
  );

  const estadoBreakdown = Array.from(estadoCount.entries())
    .map(([estado, count]) => ({ estado, count }))
    .sort((a, b) => b.count - a.count);

  const daily = Array.from(dailyMap.values()).sort((a, b) =>
    a.fecha < b.fecha ? -1 : 1,
  );

  return {
    generatedAt: new Date().toISOString(),
    rangeFrom,
    rangeTo,
    totals,
    cobertura,
    provincias,
    focusZones,
    estadoBreakdown,
    daily,
    warnings,
  };
}

/**
 * Resultado vacío que renderiza un dashboard "sin datos" sin reventar
 * cuando faltan envs o el CRM está caído.
 */
export function emptyDashboard(rangeFrom: string, rangeTo: string): DashboardData {
  return aggregate([], rangeFrom, rangeTo);
}
