// GET /api/games?date=yyyy-MM-dd
// Returns the cached enriched envelope for the date. Falls back to a
// live refresh if the cache is missing or stale.

import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getEnvelope, isKvAvailable } from '@/lib/kv';
import { runRefresh } from '@/lib/refresh';

const STALE_MS = 5 * 60 * 1000; // 5 minutes

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

  if (isKvAvailable()) {
    const cached = await getEnvelope(date);
    if (cached) {
      const age = Date.now() - new Date(cached.computedAt).getTime();
      if (age < STALE_MS) {
        return NextResponse.json(cached, {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
            'X-Source': 'kv-fresh',
          },
        });
      }
      // Stale: serve cached but kick off a refresh.
      runRefresh(date).catch(() => undefined);
      return NextResponse.json(cached, {
        headers: { 'X-Source': 'kv-stale' },
      });
    }
  }

  // No cache (or KV down): run a refresh inline.
  try {
    const fresh = await runRefresh(date);
    return NextResponse.json(fresh, {
      headers: { 'X-Source': 'live' },
    });
  } catch (err) {
    console.error('[games] live refresh failed', err);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 },
    );
  }
}
