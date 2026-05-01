import type { PitcherStats, PitchHand, TeamForm } from '@/types';
import { format, subDays } from 'date-fns';

const BASE = 'https://statsapi.mlb.com/api/v1';

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
      officialDate?: string;
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

export async function fetchSchedule(date: string) {
  const url = `${BASE}/schedule?sportId=1&date=${date}&hydrate=team`;
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
// Team records via standings (one call, all teams)
// ============================================================

interface RawStandingsResponse {
  records: Array<{
    teamRecords: Array<{
      team: { id: number };
      records?: {
        splitRecords?: Array<{ type: string; wins: number; losses: number; pct: string }>;
      };
    }>;
  }>;
}

export interface TeamRecord {
  homeWinPct: number | null;
  roadWinPct: number | null;
  last10WinPct: number;
}

export async function fetchAllTeamRecords(season: number): Promise<Map<number, TeamRecord>> {
  const url = `${BASE}/standings?leagueId=103,104&season=${season}`;
  const map = new Map<number, TeamRecord>();
  try {
    const data = await fetchJson<RawStandingsResponse>(url);
    for (const div of data.records ?? []) {
      for (const tr of div.teamRecords ?? []) {
        const splits = tr.records?.splitRecords ?? [];
        const lookup = (type: string) => splits.find((s) => s.type === type);
        const home = lookup('home');
        const away = lookup('away');
        const last10 = lookup('lastTen');
        const pct = (rec?: { wins: number; losses: number }) =>
          rec && rec.wins + rec.losses > 0 ? rec.wins / (rec.wins + rec.losses) : null;
        map.set(tr.team.id, {
          homeWinPct: pct(home),
          roadWinPct: pct(away),
          last10WinPct: pct(last10) ?? 0,
        });
      }
    }
  } catch (err) {
    console.error('[mlb] standings fetch failed', err);
  }
  return map;
}

// ============================================================
// Team hitting (season OPS + vs LHP/RHP splits)
// ============================================================

interface RawHittingResponse {
  stats?: Array<{
    splits: Array<{
      split?: { description?: string };
      stat: { ops?: string | number };
    }>;
  }>;
}

export interface TeamHitting {
  seasonOPS: number | null;
  vsLHP_OPS: number | null;
  vsRHP_OPS: number | null;
}

const num = (v: string | number | undefined): number | null =>
  v == null ? null : typeof v === 'number' ? v : Number(v);

export async function fetchTeamHitting(teamId: number, season: number): Promise<TeamHitting> {
  const seasonUrl = `${BASE}/teams/${teamId}/stats?season=${season}&group=hitting&stats=season`;
  const splitsUrl = `${BASE}/teams/${teamId}/stats?season=${season}&group=hitting&stats=statSplits&sitCodes=vl,vr`;
  try {
    const [seasonResp, splitsResp] = await Promise.all([
      fetchJson<RawHittingResponse>(seasonUrl),
      fetchJson<RawHittingResponse>(splitsUrl),
    ]);
    const seasonOPS = num(seasonResp.stats?.[0]?.splits?.[0]?.stat?.ops);
    const splits = splitsResp.stats?.[0]?.splits ?? [];
    const vsL = splits.find((s) => s.split?.description?.startsWith('vs Left'));
    const vsR = splits.find((s) => s.split?.description?.startsWith('vs Right'));
    return {
      seasonOPS,
      vsLHP_OPS: num(vsL?.stat?.ops),
      vsRHP_OPS: num(vsR?.stat?.ops),
    };
  } catch {
    return { seasonOPS: null, vsLHP_OPS: null, vsRHP_OPS: null };
  }
}

// ============================================================
// Yesterday's schedule (for travel-spot signal)
// ============================================================

export interface YesterdayGame {
  teamId: number;
  startTimeIso: string;
  venueId?: number;
  venueName?: string;
}

export async function fetchYesterdayPlayMap(forDate: string): Promise<Map<number, YesterdayGame>> {
  const yesterday = format(subDays(new Date(forDate), 1), 'yyyy-MM-dd');
  const map = new Map<number, YesterdayGame>();
  try {
    const data = await fetchSchedule(yesterday);
    const games = data.dates?.[0]?.games ?? [];
    for (const g of games) {
      const entry = (teamId: number) => ({
        teamId,
        startTimeIso: g.gameDate,
        venueId: g.venue?.id,
        venueName: g.venue?.name,
      });
      map.set(g.teams.home.team.id, entry(g.teams.home.team.id));
      map.set(g.teams.away.team.id, entry(g.teams.away.team.id));
    }
  } catch (err) {
    console.error('[mlb] yesterday schedule fetch failed', err);
  }
  return map;
}

// ============================================================
// Helpers
// ============================================================

export function statusFor(abstract: string) {
  if (abstract === 'Live') return 'Live' as const;
  if (abstract === 'Final') return 'Final' as const;
  return 'Preview' as const;
}

// Season heuristic — MLB plays Mar–Oct. If we're in Jan–Feb,
// the meaningful "current season" is last calendar year (offseason).
export const CURRENT_SEASON = (() => {
  const now = new Date();
  const month = now.getUTCMonth() + 1; // 1..12
  if (month < 3) return now.getUTCFullYear() - 1;
  return now.getUTCFullYear();
})();

// Pulled in for back-compat.
export async function fetchTeamForm(_teamId: number, _season: number): Promise<Partial<TeamForm>> {
  return {};
}
