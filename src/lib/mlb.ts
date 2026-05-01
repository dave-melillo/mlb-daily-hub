import type {
  EnrichedGame,
  PitcherStats,
  TeamForm,
  PitchHand,
} from '@/types';

const BASE = 'https://statsapi.mlb.com/api/v1';

// MLB Stats API has no auth and very generous rate limits, but we still
// dedupe identical fetches within a single refresh pass.
const inflight = new Map<string, Promise<unknown>>();

async function fetchJson<T>(url: string): Promise<T> {
  if (inflight.has(url)) {
    return inflight.get(url) as Promise<T>;
  }
  const p = fetch(url, { cache: 'no-store' }).then(async (r) => {
    if (!r.ok) throw new Error(`MLB API ${r.status} for ${url}`);
    return r.json() as Promise<T>;
  });
  inflight.set(url, p);
  try {
    return await p;
  } finally {
    inflight.delete(url);
  }
}

// ============================================================
// Schedule with probable starters + linescore
// ============================================================

interface RawScheduleResponse {
  dates: Array<{
    date: string;
    games: Array<{
      gamePk: number;
      gameDate: string;
      status: { abstractGameState: string; detailedState: string };
      teams: {
        away: { team: { id: number; name: string; abbreviation: string }; score?: number; probablePitcher?: { id: number; fullName: string } };
        home: { team: { id: number; name: string; abbreviation: string }; score?: number; probablePitcher?: { id: number; fullName: string } };
      };
      venue?: { id: number; name: string };
    }>;
  }>;
}

export async function fetchScheduleWithProbables(date: string) {
  const url = `${BASE}/schedule?sportId=1&date=${date}&hydrate=team,linescore,probablePitcher`;
  return fetchJson<RawScheduleResponse>(url);
}

// ============================================================
// Pitcher season stats
// ============================================================

interface RawPitcherResponse {
  people: Array<{
    id: number;
    fullName: string;
    pitchHand?: { code: PitchHand };
    stats?: Array<{
      group: { displayName: string };
      splits: Array<{
        season: string;
        stat: {
          era?: string | number;
          whip?: string | number;
          strikeoutsPer9Inn?: string | number;
          baseOnBallsPer9?: string | number;
          inningsPitched?: string | number;
          gamesStarted?: number;
        };
      }>;
    }>;
  }>;
}

export async function fetchPitcherStats(playerId: number, season: number): Promise<PitcherStats | undefined> {
  const url = `${BASE}/people/${playerId}?hydrate=stats(group=[pitching],type=[season],season=${season})`;
  try {
    const data = await fetchJson<RawPitcherResponse>(url);
    const person = data.people?.[0];
    if (!person) return undefined;

    const splits = person.stats?.find((s) => s.group.displayName === 'pitching')?.splits ?? [];
    const split = splits.find((s) => s.season === String(season));
    const stat = split?.stat;
    const num = (v: string | number | undefined) =>
      v == null ? null : typeof v === 'number' ? v : Number(v);

    return {
      id: person.id,
      name: person.fullName,
      throws: person.pitchHand?.code ?? 'R',
      era: num(stat?.era),
      whip: num(stat?.whip),
      k9: num(stat?.strikeoutsPer9Inn),
      bb9: num(stat?.baseOnBallsPer9),
      ip: Number(stat?.inningsPitched ?? 0),
      gamesStarted: stat?.gamesStarted ?? 0,
    };
  } catch {
    return undefined;
  }
}

// ============================================================
// Team form (last10, home/road records)
// ============================================================

interface RawTeamResponse {
  teams: Array<{
    id: number;
    record?: {
      records?: {
        splitRecords?: Array<{ type: string; wins: number; losses: number; pct: string }>;
      };
      wins?: number;
      losses?: number;
    };
  }>;
}

export async function fetchTeamForm(teamId: number, season: number): Promise<Partial<TeamForm>> {
  const url = `${BASE}/teams/${teamId}?hydrate=record(currentSeason=${season},type=splits)`;
  try {
    const data = await fetchJson<RawTeamResponse>(url);
    const splits = data.teams?.[0]?.record?.records?.splitRecords ?? [];
    const lookup = (type: string) => splits.find((s) => s.type === type);
    const last10 = lookup('lastTen');
    const home = lookup('home');
    const away = lookup('away');
    const lastTenPct = last10 && last10.wins + last10.losses > 0
      ? last10.wins / (last10.wins + last10.losses)
      : 0;
    const pct = (rec?: { wins: number; losses: number }) =>
      rec && rec.wins + rec.losses > 0 ? rec.wins / (rec.wins + rec.losses) : null;
    return {
      teamId,
      last10WinPct: lastTenPct,
      homeWinPct: pct(home),
      roadWinPct: pct(away),
      // Stats below need game-log aggregation — left null in Phase 1.
      last10OPS: null,
      vsLHP_OPS: null,
      vsRHP_OPS: null,
      bullpenIPLast3Days: 0,
      closerRested: false,
      lastGameLocalEndTime: null,
      homeTimeZone: null,
    };
  } catch {
    return { teamId };
  }
}

// ============================================================
// Helpers
// ============================================================

export function statusFor(abstract: string): EnrichedGame['status']['abstract'] {
  if (abstract === 'Live') return 'Live';
  if (abstract === 'Final') return 'Final';
  return 'Preview';
}

export const CURRENT_SEASON = (() => {
  const now = new Date();
  // MLB season typically runs Mar–Oct; assume current calendar year.
  return now.getUTCFullYear();
})();
