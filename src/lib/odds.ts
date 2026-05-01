import type { OddsLine } from '@/types';

const BASE = 'https://api.the-odds-api.com/v4';
const SPORT = 'baseball_mlb';
const REGION = 'us';
const MARKETS = 'h2h,spreads,totals';
const PREFERRED_BOOK = 'draftkings';

interface OddsApiEvent {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      outcomes: Array<{ name: string; price: number; point?: number }>;
    }>;
  }>;
}

export async function fetchAllOdds(): Promise<OddsApiEvent[]> {
  const key = process.env.ODDS_API_KEY;
  if (!key) return [];
  const url = `${BASE}/sports/${SPORT}/odds?apiKey=${key}&regions=${REGION}&markets=${MARKETS}&oddsFormat=american`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as OddsApiEvent[];
  } catch {
    return [];
  }
}

function americanFromOutcome(o?: { price: number }): number | null {
  return o ? o.price : null;
}

export function matchOddsToGame(
  events: OddsApiEvent[],
  homeTeamName: string,
  awayTeamName: string,
): OddsLine | undefined {
  // Match by the team's last word (mascot). MLB sends "New York Yankees",
  // Odds API sends the same; the last token (Yankees) is unique league-wide.
  const lastWord = (s: string) =>
    s.toLowerCase().trim().split(/\s+/).pop() ?? '';
  const homeLast = lastWord(homeTeamName);
  const awayLast = lastWord(awayTeamName);

  const target = events.find((e) => {
    const eHomeLast = lastWord(e.home_team);
    const eAwayLast = lastWord(e.away_team);
    return eHomeLast === homeLast && eAwayLast === awayLast;
  });
  if (!target) return undefined;

  const book =
    target.bookmakers.find((b) => b.key === PREFERRED_BOOK) ?? target.bookmakers[0];
  if (!book) return undefined;

  const h2h = book.markets.find((m) => m.key === 'h2h');
  const spreads = book.markets.find((m) => m.key === 'spreads');
  const totals = book.markets.find((m) => m.key === 'totals');

  const homeML = americanFromOutcome(h2h?.outcomes.find((o) => o.name === target.home_team));
  const awayML = americanFromOutcome(h2h?.outcomes.find((o) => o.name === target.away_team));

  const homeRl = spreads?.outcomes.find((o) => o.name === target.home_team);
  const awayRl = spreads?.outcomes.find((o) => o.name === target.away_team);

  const overOutcome = totals?.outcomes.find((o) => o.name === 'Over');
  const underOutcome = totals?.outcomes.find((o) => o.name === 'Under');

  if (homeML == null || awayML == null) return undefined;

  return {
    bookmaker: book.title,
    homeMoneyline: homeML,
    awayMoneyline: awayML,
    total: overOutcome?.point ?? 0,
    totalOver: overOutcome?.price ?? 0,
    totalUnder: underOutcome?.price ?? 0,
    homeRunline: homeRl?.point ?? 0,
    homeRunlinePrice: homeRl?.price ?? 0,
    awayRunlinePrice: awayRl?.price ?? 0,
  };
}
