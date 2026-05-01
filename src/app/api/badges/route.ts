// Canonical "BadgeLab" feed for MLB. Returns one row per
// (matchup × triggered badge × side).

import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getEnvelope, isKvAvailable } from '@/lib/kv';
import { runRefresh } from '@/lib/refresh';
import { BADGE_META } from '@/lib/badges';
import type { BadgeId, EnrichedGame } from '@/types';

export const dynamic = 'force-dynamic';

const RECS: Record<BadgeId, string> = {
  ACE_EDGE: 'Lean ML or runline -1.5',
  STRIKEOUT_SPEC: 'Strikeout props (over)',
  ELITE_ARM: 'Strikeout props + team Under N',
  BULLPEN_BURNOUT: 'Late-game live total Over',
  HOT_BATS: 'Team total over / first-5 Over',
  SPLITS_MISMATCH: 'Team total Over',
  POWER_PARK: 'Total Over',
  OVER_VALUE: 'Total Over',
  UNDER_VALUE: 'Total Under',
  HOME_COOKIN: 'Lean home ML',
  TRAVEL_SPOT: 'Fade tired side ML',
  HEAVY_CHALK: 'Runline -1.5 for better number',
  PLUS_MONEY_DOG: 'Underdog ML',
  UNDERDOG_VALUE: 'Underdog ML — line is mispriced',
};

function rowsFromGame(g: EnrichedGame, hubBase: string) {
  const matchup = `${g.away.team.abbreviation} @ ${g.home.team.abbreviation}`;
  const matchupName = `${g.away.team.name} @ ${g.home.team.name}`;
  const date = g.gameDate.split('T')[0];

  return g.badges.map((b) => {
    const meta = BADGE_META[b.id];
    let sideLabel: string | null = null;
    if (b.side === 'home') sideLabel = g.home.team.abbreviation;
    if (b.side === 'away') sideLabel = g.away.team.abbreviation;
    return {
      sport: 'MLB' as const,
      matchup,
      matchupName,
      matchupHref: hubBase,
      date,
      badge: { code: b.id, name: meta.name, emoji: meta.emoji },
      side: sideLabel,
      confidence: b.confidence,
      reason: b.reason,
      recommendation: RECS[b.id] ?? '',
    };
  });
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  const hubBase = `https://${request.headers.get('host')}`;

  let envelope = isKvAvailable() ? await getEnvelope(date) : null;
  if (!envelope) {
    try {
      envelope = await runRefresh(date);
    } catch {
      return NextResponse.json({ rows: [], error: 'refresh failed' }, { status: 500 });
    }
  }

  const rows = envelope.games.flatMap((g) => rowsFromGame(g, hubBase));
  return NextResponse.json({
    sport: 'MLB',
    date,
    rows,
    computedAt: envelope.computedAt,
  });
}
