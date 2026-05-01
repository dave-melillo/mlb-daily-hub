// One-shot refresh pipeline:
//  1) Pull today's MLB schedule with probable starters
//  2) For each starter, pull season stats
//  3) For each team, pull form (last10/home/road)
//  4) Pull odds for the slate (one Odds API call)
//  5) Pull weather for outdoor venues
//  6) Run badge engine
//  7) Stuff the result into Upstash KV
//
// Designed to be cheap on the upstream APIs: ~2 + (4 * games) calls.

import { format } from 'date-fns';
import { evaluateAllBadges } from './badges';
import { fetchAllOdds, matchOddsToGame } from './odds';
import {
  CURRENT_SEASON,
  fetchPitcherStats,
  fetchScheduleWithProbables,
  fetchTeamForm,
  statusFor,
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

export async function runRefresh(date?: string): Promise<DailyEnvelope> {
  const targetDate = date ?? format(new Date(), 'yyyy-MM-dd');

  const schedule = await fetchScheduleWithProbables(targetDate);
  const rawGames = schedule.dates?.[0]?.games ?? [];

  // Batch the odds for the slate (one API call).
  const oddsEvents = await fetchAllOdds();

  const enriched: EnrichedGame[] = await Promise.all(
    rawGames.map(async (g) => {
      // Type-narrow probable pitchers (they may be undefined).
      const homeProb = (g.teams.home as { probablePitcher?: { id: number } }).probablePitcher;
      const awayProb = (g.teams.away as { probablePitcher?: { id: number } }).probablePitcher;

      const [
        homePitcher,
        awayPitcher,
        homeFormPartial,
        awayFormPartial,
      ] = await Promise.all([
        homeProb ? fetchPitcherStats(homeProb.id, CURRENT_SEASON) : Promise.resolve(undefined),
        awayProb ? fetchPitcherStats(awayProb.id, CURRENT_SEASON) : Promise.resolve(undefined),
        fetchTeamForm(g.teams.home.team.id, CURRENT_SEASON),
        fetchTeamForm(g.teams.away.team.id, CURRENT_SEASON),
      ]);

      const fillForm = (teamId: number, partial: Partial<TeamForm>): TeamForm => ({
        teamId,
        last10WinPct: partial.last10WinPct ?? 0,
        last10OPS: partial.last10OPS ?? null,
        homeWinPct: partial.homeWinPct ?? null,
        roadWinPct: partial.roadWinPct ?? null,
        vsLHP_OPS: partial.vsLHP_OPS ?? null,
        vsRHP_OPS: partial.vsRHP_OPS ?? null,
        bullpenIPLast3Days: partial.bullpenIPLast3Days ?? 0,
        closerRested: partial.closerRested ?? false,
        lastGameLocalEndTime: partial.lastGameLocalEndTime ?? null,
        homeTimeZone: partial.homeTimeZone ?? null,
      });

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

      // Odds
      const odds = matchOddsToGame(oddsEvents, g.teams.home.team.name, g.teams.away.team.name);

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
          form: fillForm(g.teams.home.team.id, homeFormPartial),
        },
        away: {
          team: g.teams.away.team,
          score: g.teams.away.score,
          pitcher: awayPitcher as PitcherStats | undefined,
          form: fillForm(g.teams.away.team.id, awayFormPartial),
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
