// Cliente Supabase de solo lectura para el CRM existente.
// El dashboard NUNCA escribe — solo SELECT.

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // No tirar el build si faltan envs en preview; loggeamos y dejamos que
  // las queries fallen con un mensaje claro.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL o key no configurada — las queries devolverán vacío.'
  );
}

export const supabase = createClient(url ?? 'https://invalid.supabase.co', key ?? 'invalid', {
  auth: { persistSession: false },
  db: { schema: 'public' },
});
