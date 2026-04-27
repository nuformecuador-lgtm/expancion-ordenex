// Health check liviano: verifica que las envs críticas estén presentes
// y que Supabase responda. NO expone valores sensibles.

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envs = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: !!process.env.CRON_SECRET,
  };

  let supabaseOk = false;
  let supabaseError: string | null = null;
  try {
    const { error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    supabaseOk = !error;
    supabaseError = error?.message ?? null;
  } catch (e) {
    supabaseError = e instanceof Error ? e.message : 'unknown';
  }

  return NextResponse.json({
    ok: supabaseOk,
    timestamp: new Date().toISOString(),
    envs,
    supabase: { ok: supabaseOk, error: supabaseError },
  });
}
