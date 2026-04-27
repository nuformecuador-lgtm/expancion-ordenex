#!/usr/bin/env node
// Snapshot builder.
// Lee credenciales de Supabase desde un .env (por defecto ../director-crm/.env.local),
// consulta `orders` filtrando CR + estados relevantes para la última semana ISO
// (lunes a domingo), agrega y escribe data/snapshot.json.
//
// Uso:
//   npm run snapshot
//   SNAPSHOT_ENV_FILE=/path/to/.env npm run snapshot
//   SNAPSHOT_DAYS=14 npm run snapshot
//
// El snapshot es PÚBLICO (queda en el repo) — solo contiene agregados,
// nunca filas crudas con PII.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

import {
  ESTADOS_CONFIRMADOS,
  ESTADO_SIN_STOCK,
  PAIS_CR,
} from '../lib/gam-config.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// ---------- 1. Cargar env desde un archivo (sin imprimir valores) ----------
const envFile =
  process.env.SNAPSHOT_ENV_FILE ??
  resolve(projectRoot, '..', 'director-crm', '.env.local');

if (!existsSync(envFile)) {
  console.error(`[snapshot] no encuentro env file: ${envFile}`);
  process.exit(1);
}

const envText = readFileSync(envFile, 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
  if (!m) continue;
  let val = m[2].trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  env[m[1]] = val;
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  env.SUPABASE_SERVICE_KEY ??
  env.SUPABASE_SERVICE_ROLE_KEY ??
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    '[snapshot] faltan NEXT_PUBLIC_SUPABASE_URL o key en el env file',
  );
  process.exit(1);
}
console.log(
  `[snapshot] env cargado OK (url len=${SUPABASE_URL.length}, key len=${SUPABASE_KEY.length})`,
);

// ---------- 2. Calcular ventana: última semana ISO (lun → dom) ----------
const now = new Date();
const dow = now.getUTCDay(); // 0=dom, 1=lun, ...
// Lunes de ESTA semana en UTC
const thisMonday = new Date(now);
thisMonday.setUTCDate(now.getUTCDate() - ((dow + 6) % 7));
thisMonday.setUTCHours(0, 0, 0, 0);
// Lunes de la semana pasada
const lastMonday = new Date(thisMonday);
lastMonday.setUTCDate(thisMonday.getUTCDate() - 7);
// Domingo de la semana pasada (23:59:59.999)
const lastSunday = new Date(thisMonday);
lastSunday.setUTCMilliseconds(thisMonday.getUTCMilliseconds() - 1);

const overrideDays = process.env.SNAPSHOT_DAYS
  ? parseInt(process.env.SNAPSHOT_DAYS, 10)
  : null;

let rangeFrom, rangeTo;
if (overrideDays && overrideDays > 0) {
  rangeTo = now.toISOString();
  const f = new Date(now);
  f.setUTCDate(now.getUTCDate() - overrideDays);
  rangeFrom = f.toISOString();
} else {
  rangeFrom = lastMonday.toISOString();
  rangeTo = lastSunday.toISOString();
}

console.log(`[snapshot] ventana: ${rangeFrom} → ${rangeTo}`);

// ---------- 3. Query Supabase ----------
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const ESTADOS = [...ESTADOS_CONFIRMADOS, ESTADO_SIN_STOCK];

const PAGE = 1000;
let all = [];
for (let offset = 0; ; offset += PAGE) {
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id,pais,pedido,fecha,estado,ciudad,precio,hora_confirmacion,created_at',
    )
    .eq('pais', PAIS_CR)
    .in('estado', ESTADOS)
    .gte('created_at', rangeFrom)
    .lte('created_at', rangeTo)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE - 1);

  if (error) {
    console.error('[snapshot] error supabase:', error.message);
    process.exit(1);
  }
  all = all.concat(data ?? []);
  if (!data || data.length < PAGE) break;
}
console.log(`[snapshot] filas crudas: ${all.length}`);

// ---------- 4. Agregar (re-implementación standalone, no depende de TS) ----------
import { provinciaDeCanton, cleanCantonName } from '../lib/cantones-cr.ts';
import {
  GAM_STATUS,
  HUB_MAP,
  RUTA_MAP,
  PROVINCIAS_ORDER,
  FOCUS_PROVINCIAS,
} from '../lib/gam-config.ts';

const CONFIRMADOS_SET = new Set(ESTADOS_CONFIRMADOS);
const isConfirmada = (s) => !!s && CONFIRMADOS_SET.has(s);
const isSinStock = (s) => s === ESTADO_SIN_STOCK;

const byProv = new Map();
const estadoCount = new Map();
const dailyMap = new Map();

// Buckets diarios para los 7 días de la ventana
const fromDate = new Date(rangeFrom);
const toDate = new Date(rangeTo);
for (let d = new Date(fromDate); d <= toDate; d.setUTCDate(d.getUTCDate() + 1)) {
  const k = d.toISOString().slice(0, 10);
  dailyMap.set(k, { fecha: k, confirmadas: 0, sinStock: 0 });
}

let unmatched = 0;
let revenueConfirmadas = 0;

for (const r of all) {
  const provincia = provinciaDeCanton(r.ciudad);
  if (provincia === 'Sin clasificar') unmatched++;
  const cantonLabel = cleanCantonName(r.ciudad);

  if (!byProv.has(provincia)) byProv.set(provincia, new Map());
  const cantMap = byProv.get(provincia);
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

  if (conf) {
    const p = parseFloat(r.precio);
    if (!isNaN(p)) revenueConfirmadas += p;
  }

  if (r.estado) {
    estadoCount.set(r.estado, (estadoCount.get(r.estado) ?? 0) + 1);
  }

  const dk = (r.created_at ?? '').slice(0, 10);
  if (dk && dailyMap.has(dk)) {
    const b = dailyMap.get(dk);
    if (conf) b.confirmadas++;
    if (sin) b.sinStock++;
  } else if (dk) {
    // si cae fuera por TZ, lo agregamos igual
    dailyMap.set(dk, {
      fecha: dk,
      confirmadas: conf ? 1 : 0,
      sinStock: sin ? 1 : 0,
    });
  }
}

const provincias = PROVINCIAS_ORDER.map((prov) => {
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

const warnings = [];
if (unmatched > 0) {
  warnings.push(
    `${unmatched} orden(es) con cantón no reconocido — revisar limpieza de \`ciudad\` en CRM.`,
  );
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  rangeFrom,
  rangeTo,
  totals,
  cobertura,
  provincias,
  focusZones,
  estadoBreakdown,
  daily,
  revenueConfirmadas,
  warnings,
};

const outDir = join(projectRoot, 'data');
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'snapshot.json');
writeFileSync(outFile, JSON.stringify(snapshot, null, 2));

console.log(
  `[snapshot] OK · ${all.length} filas · ${provincias.length} provincias · revenue confirmado: ${revenueConfirmadas.toFixed(0)}`,
);
console.log(`[snapshot] escrito: ${outFile}`);
