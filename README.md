# expancion-ordenex

Dashboard web público mobile-first para visualizar la operación COD de **Costa Rica** de Nuform/Danyel. Lectura directa del CRM existente, refresh diario a las 6 AM hora CR.

> ⚠️ El nombre exacto del proyecto es **`expancion-ordenex`** — así lo quiere el dueño. No "corregir" a `expansion-ordenes`.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (read-only sobre el CRM existente: `kyyfrongihtaasbzgyfm` / Director Ecommerce)
- Vercel hosting + Vercel Cron (1 ejecución/día)

## Decisión de storage: Opción A (ISR + Cron)

**Elegida**: cache estático con ISR + Vercel Cron diario que llama `/api/refresh`.

- `app/page.tsx` exporta `revalidate = 86400` (24h) y `dynamic = 'force-static'`
- `vercel.json` programa `/api/refresh` a las **12:00 UTC = 6:00 AM CR** (`0 12 * * *`)
- `/api/refresh` valida `Bearer ${CRON_SECRET}` y llama `revalidatePath('/')`
- Resultado: HTML servido instantáneamente desde edge cache, regenerado 1 vez/día

**Por qué A y no B (tabla agregada en Supabase)**: el dashboard hoy solo necesita la foto de los últimos 7 días, no histórico día-a-día. Cero tablas nuevas, cero costo de mantenimiento. Si más adelante el dueño quiere ver evolución diaria, se migra a Opción B agregando una tabla `cr_daily_snapshot` y guardando el output del cron.

## Reglas de filtrado del CRM

Todo está en `lib/gam-config.ts` y `lib/queries.ts`:

- **País**: `pais = 'CR'` (exacto)
- **Estados confirmados** (cualquier canal):
  - `CONFIRMADO EFFICHAT`
  - `CONFIRMADO LLAMADA`
  - `CONFIRMADO WHATSAPP`
  - `CARRITO CONFIRMADO`
- **Sin stock**: `PRODUCTO SIN STOCK`
- **Ventana**: últimos 7 días (`created_at`)

## Mapeo CRM → dashboard

Tabla origen: `orders` en Supabase del CRM.

| Columna CRM | Uso en dashboard |
|---|---|
| `id` | key interno |
| `pais` | filtro `'CR'` |
| `pedido` | id de orden visible (#XXXX) |
| `fecha` | fecha del pedido |
| `estado` | filtro confirmadas / sin stock |
| `ciudad` | cantón → mapeo a provincia (`lib/cantones-cr.ts`) |
| `precio` | reservado (no usado todavía en el UI) |
| `hora_confirmacion` | reservado |
| `created_at` | bucket diario para chart de volumen |

**Importante**: el CRM **NO tiene columna `provincia`**, solo `ciudad` (cantón). El mapeo se hace con `lib/cantones-cr.ts` sobre los 7 provincias × 84 cantones de CR. Cantones no reconocidos caen en `Sin clasificar` y se loggean en `data.warnings`.

El campo `ciudad` viene sucio en algunos casos (incluye números pegados, ej. teléfonos). `cleanCantonName()` y `normalizeCanton()` lo limpian.

## Variables de entorno

Copiar `.env.example` → `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://kyyfrongihtaasbzgyfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public>
CRON_SECRET=<openssl rand -hex 32>
```

`SUPABASE_SERVICE_ROLE_KEY` es opcional — solo si las RLS bloquean lectura con anon (no debería).

## Desarrollo local

```bash
npm install
npm run dev
# abrir http://localhost:3000
```

## Deploy en Vercel

1. Crear proyecto en Vercel apuntando al repo `nuformecuador-lgtm/expancion-ordenex`
2. Settings → Environment Variables: pegar las 3 variables de `.env.example`
3. Deploy
4. Verificar `/api/health` — debe responder `{ ok: true, ... }`
5. El cron se ejecuta automáticamente desde `vercel.json` — no requiere config extra

> Vercel Cron **solo corre en producción**, no en preview. En dev local no se dispara.

## Cambiar la hora del cron

Editar `vercel.json` → `crons[0].schedule`. Formato cron UTC.

- Hoy: `0 12 * * *` = 12:00 UTC = 6:00 AM Costa Rica (UTC-6, sin DST)
- Si cambia a 5 AM: `0 11 * * *`

## Endpoints

- `GET /` — Dashboard (HTML cacheado)
- `GET /api/refresh` — Revalida el HTML (requiere `Authorization: Bearer <CRON_SECRET>`)
- `GET /api/health` — Health check (envs presentes + ping a Supabase). Sin secretos en la respuesta.

## Cómo agregar más métricas

1. Si la métrica sale de las **mismas filas** (confirmadas + sin stock CR): editar `lib/aggregations.ts` y extender `DashboardData` en `lib/types.ts`.
2. Si necesita **otros estados** (ej. PEDIDO ANULADO): agregar a `ESTADOS_RELEVANTES` en `lib/queries.ts` y al filtro en `aggregations.ts`.
3. Crear el componente nuevo en `components/dashboard/`. **Nunca modificar componentes que ya funcionan** — crear `_v2` si hay que iterar.
4. Renderizarlo en `app/page.tsx` dentro de un `<section>` con `animate-fade-up delay-N`.

## Reglas de arquitectura (no negociables)

- Una responsabilidad por archivo
- Nunca modificar código que ya funciona — `_v2` para iterar
- Mobile-first: probar en DevTools 375px ANTES de considerar terminado
- TypeScript estricto
- El proyecto **solo lee** del CRM. Nunca escribe.
