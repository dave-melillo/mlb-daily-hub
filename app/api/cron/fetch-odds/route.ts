// Vercel Cron: Fetch historical odds snapshots daily at 3 AM ET
// Schedule: 0 3 * * * (every day at 3:00 AM)
// TODO: PR #2 - Implement full logic (fetch from The Odds API, store in Supabase)

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret (production only)
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CRON] fetch-odds triggered at:', new Date().toISOString());

  try {
    // TODO (PR #2): Implement odds fetching logic
    // 1. Get tomorrow's games from MLB Stats API
    // 2. Fetch historical odds from The Odds API
    // 3. Store snapshots in Supabase odds_snapshots table
    // 4. Handle rate limits (500 req/month)
    // 5. Retry logic (3 attempts with exponential backoff)

    return NextResponse.json({
      success: true,
      message: 'Odds fetch cron stub - implementation pending PR #2',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] fetch-odds error:', error);
    return NextResponse.json(
      { error: 'Cron execution failed', details: error },
      { status: 500 }
    );
  }
}
