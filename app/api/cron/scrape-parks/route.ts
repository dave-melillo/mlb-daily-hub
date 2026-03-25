// Vercel Cron: Scrape park factors monthly on 1st of month at 4 AM ET
// Schedule: 0 4 1 * * (1st day of month at 4:00 AM)
// TODO: PR #3 - Implement full logic (scrape Baseball Savant, store in Supabase)

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify cron secret (production only)
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[CRON] scrape-parks triggered at:', new Date().toISOString());

  try {
    // TODO (PR #3): Implement park factors scraping logic
    // 1. Fetch Baseball Savant park factors page (HTML)
    // 2. Parse HTML table with Cheerio
    // 3. Extract HR factor, run factor, stadium name, year
    // 4. Upsert to Supabase park_factors table
    // 5. Email alert on scraper failure (HTML structure change)
    // 6. Fallback to previous season's data if scrape fails

    return NextResponse.json({
      success: true,
      message: 'Park factors scraper stub - implementation pending PR #3',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] scrape-parks error:', error);
    return NextResponse.json(
      { error: 'Cron execution failed', details: error },
      { status: 500 }
    );
  }
}
