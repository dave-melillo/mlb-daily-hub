// One-shot refresh pipeline.

import { format } from 'date-fns';
import { evaluateAllBadges } from './badges';
import { fetchAllOdds, matchOddsToGame } from './odds';
import {
  CURRENT_SEASON,
  fetchAllTeamRecords,
  fetchPitcherStats,
  fetchScheduleWithProbables,
  fetchTeamHitting,
  fetchYesterdayPlayMap,
  statusFor,
  type TeamRecord,
  type TeamHitting,
} from './mlb';
import { setEnvelope } from './kv';
import { getParkInfoByTeam } from './parks';
import { fetchWindForGame } from './weather';
import type {
  DailyEnvelope,
  EnrichedGame,
  PitcherStats,
  TeamForm,
  VenueInfo,
} from '@/types';

function isLatePmStart(iso: string): boolean {
  // Anything starting at 9pm ET or later we consider a "late game".
  const date = new Date(iso);
  const utcHours = date.getUTCHours();
  // ET = UTC-4 (EDT) most of MLB season; ET hour = utcHours - 4 (mod 24).
  const etHour = (utcHours + 24 - 4) % 24;
  return etHour >= 21 || etHour <= 1;
}

function buildForm(args: {
  teamId: number;
  rec?: TeamRecord;
  hit?: TeamHitting;
  yesterdayStartIso?: string | null;
  pitcherHand?: 'L' | 'R';
}): TeamForm {
  return {
    teamId: args.teamId,
    last10WinPct: args.rec?.last10WinPct ?? 0,
    // We stash season OPS into last10OPS — Phase 1 simplification documented
    // in lib/badges.ts (Hot Bats threshold tuned to season OPS).
    last10OPS: args.hit?.seasonOPS ?? null,
    homeWinPct: args.rec?.homeWinPct ?? null,
    roadWinPct: args.rec?.roadWinPct ?? null,
    vsLHP_OPS: args.hit?.vsLHP_OPS ?? null,
    vsRHP_OPS: args.hit?.vsRHP_OPS ?? null,
    bullpenIPLast3Days: 0, // wired in Phase 2 (game-log aggregation)
    closerRested: false,
    lastGameLocalEndTime: args.yesterdayStartIso ?? null,
    homeTimeZone: null,
  };
}

export async function runRefresh(date?: string): Promise<DailyEnvelope> {
  const targetDate = date ?? format(new Date(), 'yyyy-MM-dd');

  const schedule = await fetchScheduleWithProbables(targetDate);
  const rawGames = schedule.dates?.[0]?.games ?? [];

  // Get team records (one call) + yesterday play map (one call) up front.
  const [recordsMap, yesterdayMap, oddsEvents] = await Promise.all([
    fetchAllTeamRecords(CURRENT_SEASON),
    fetchYesterdayPlayMap(targetDate),
    fetchAllOdds(),
  ]);

  // Per-game enrichment
  const enriched: EnrichedGame[] = await Promise.all(
    rawGames.map(async (g) => {
      const homeProb = (g.teams.home as { probablePitcher?: { id: number } }).probablePitcher;
      const awayProb = (g.teams.away as { probablePitcher?: { id: number } }).probablePitcher;

      const [
        homePitcher,
        awayPitcher,
        homeHit,
        awayHit,
      ] = await Promise.all([
        homeProb ? fetchPitcherStats(homeProb.id, CURRENT_SEASON) : Promise.resolve(undefined),
        awayProb ? fetchPitcherStats(awayProb.id, CURRENT_SEASON) : Promise.resolve(undefined),
        fetchTeamHitting(g.teams.home.team.id, CURRENT_SEASON),
        fetchTeamHitting(g.teams.away.team.id, CURRENT_SEASON),
      ]);

      const homeYest = yesterdayMap.get(g.teams.home.team.id);
      const awayYest = yesterdayMap.get(g.teams.away.team.id);

      // Park + weather
      let venue: VenueInfo | undefined;
      const park = getParkInfoByTeam(g.teams.home.team.abbreviation);
      if (park) {
        venue = {
          id: park.id,
          name: park.name,
          parkFactor: park.parkFactor,
          outdoor: park.outdoor,
        };
        if (park.outdoor) {
          const wind = await fetchWindForGame(park.lat, park.lon, g.gameDate, park.homePlateBearing);
          if (wind) {
            venue.windMph = wind.windMph;
            venue.windDir = wind.windDir;
          }
        }
      }

      // Odds — try strict match, then loosen to abbreviation/last-name fallback.
      const odds = matchOddsToGame(oddsEvents, g.teams.home.team.name, g.teams.away.team.name);

      // For Travel Spot we treat "the team played a late road game last night"
      // as the trigger. Use the start time as a proxy for end time.
      const homeWasLateLastNight = !!homeYest && isLatePmStart(homeYest.startTimeIso);
      const awayWasLateLastNight = !!awayYest && isLatePmStart(awayYest.startTimeIso);

      const enrichedGame: EnrichedGame = {
        gamePk: g.gamePk,
        gameDate: g.gameDate,
        status: {
          abstract: statusFor(g.status.abstractGameState),
          detail: g.status.detailedState,
        },
        home: {
          team: g.teams.home.team,
          score: g.teams.home.score,
          pitcher: homePitcher as PitcherStats | undefined,
          form: buildForm({
            teamId: g.teams.home.team.id,
            rec: recordsMap.get(g.teams.home.team.id),
            hit: homeHit,
            yesterdayStartIso: homeWasLateLastNight ? homeYest!.startTimeIso : null,
          }),
        },
        away: {
          team: g.teams.away.team,
          score: g.teams.away.score,
          pitcher: awayPitcher as PitcherStats | undefined,
          form: buildForm({
            teamId: g.teams.away.team.id,
            rec: recordsMap.get(g.teams.away.team.id),
            hit: awayHit,
            yesterdayStartIso: awayWasLateLastNight ? awayYest!.startTimeIso : null,
          }),
        },
        venue,
        odds,
        badges: [],
        computedAt: new Date().toISOString(),
      };

      enrichedGame.badges = evaluateAllBadges(enrichedGame);
      return enrichedGame;
    }),
  );

  const envelope: DailyEnvelope = {
    date: targetDate,
    games: enriched,
    computedAt: new Date().toISOString(),
  };

  await setEnvelope(envelope);
  return envelope;
}
