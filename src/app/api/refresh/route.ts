// POST /api/refresh — manual trigger (or for the Mac mini worker).
// Requires CRON_SECRET in the Authorization header.
// GET version is used by Vercel cron (it sets the auth header automatically).

import { NextRequest, NextResponse } from 'next/server';
import { runRefresh } from '@/lib/refresh';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  return auth === `Bearer ${secret}`;
}

async function handle(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const date = request.nextUrl.searchParams.get('date') || undefined;
  try {
    const envelope = await runRefresh(date);
    return NextResponse.json({
      ok: true,
      date: envelope.date,
      games: envelope.games.length,
      badges: envelope.games.reduce((sum, g) => sum + g.badges.length, 0),
      computedAt: envelope.computedAt,
    });
  } catch (err) {
    console.error('[refresh] failed', err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
