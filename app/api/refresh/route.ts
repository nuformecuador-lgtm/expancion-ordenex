// Endpoint que dispara el Vercel Cron diario (12:00 UTC = 6 AM CR).
// Revalida la página del dashboard para que la próxima request regenere el HTML.

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;

  // Vercel Cron envía el header automáticamente cuando CRON_SECRET está seteado.
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  revalidatePath('/');

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
  });
}
