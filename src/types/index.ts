// ============================================================
// MLB API shapes (subset of the endpoints we touch)
// ============================================================

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
}

export interface RawGame {
  gamePk: number;
  gameDate: string;
  status: {
    abstractGameState: string;
    detailedState: string;
  };
  teams: {
    away: { team: Team; score?: number };
    home: { team: Team; score?: number };
  };
  venue?: { id: number; name: string };
}

export interface MLBScheduleResponse {
  dates: { date: string; games: RawGame[] }[];
}

export interface Player {
  id: number;
  fullName: string;
  position: string;
}

export interface Lineup {
  teamId: number;
  teamName: string;
  players: Player[];
}

// ============================================================
// Computed / enriched types served from KV
// ============================================================

export type PitchHand = 'L' | 'R';

export interface PitcherStats {
  id: number;
  name: string;
  throws: PitchHand;
  era: number | null;
  whip: number | null;
  k9: number | null;
  bb9: number | null;
  ip: number;
  gamesStarted: number;
}

export interface TeamForm {
  teamId: number;
  last10WinPct: number;
  last10OPS: number | null;
  homeWinPct: number | null;
  roadWinPct: number | null;
  vsLHP_OPS: number | null;
  vsRHP_OPS: number | null;
  bullpenIPLast3Days: number;
  closerRested: boolean;
  lastGameLocalEndTime: string | null;
  homeTimeZone: string | null;
}

export interface VenueInfo {
  id: number;
  name: string;
  parkFactor: number;
  outdoor: boolean;
  windMph?: number;
  windDir?: string;
}

export interface OddsLine {
  bookmaker: string;
  homeMoneyline: number;
  awayMoneyline: number;
  total: number;
  totalOver: number;
  totalUnder: number;
  homeRunline: number;
  homeRunlinePrice: number;
  awayRunlinePrice: number;
}

export type BadgeId =
  | 'ACE_EDGE'
  | 'STRIKEOUT_SPEC'
  | 'BULLPEN_BURNOUT'
  | 'HOT_BATS'
  | 'SPLITS_MISMATCH'
  | 'POWER_PARK'
  | 'HOME_COOKIN'
  | 'TRAVEL_SPOT'
  | 'UNDERDOG_VALUE'
  | 'HEAVY_CHALK'
  | 'PLUS_MONEY_DOG'
  | 'OVER_VALUE'
  | 'UNDER_VALUE'
  | 'ELITE_ARM';

export type BadgeConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type BadgeSide = 'home' | 'away';

export interface BadgeMeta {
  id: BadgeId;
  emoji: string;
  name: string;
  short: string;
  description: string;
}

export interface BadgeResult {
  id: BadgeId;
  triggered: boolean;
  side?: BadgeSide;
  confidence: BadgeConfidence;
  reason: string;
  /** Short magnitude shown inline on the chip — e.g. "1.47", "+153", "12.2 K/9". */
  value?: string;
}

export interface EnrichedGame {
  gamePk: number;
  gameDate: string;
  status: {
    abstract: 'Preview' | 'Live' | 'Final' | string;
    detail: string;
  };
  home: {
    team: Team;
    score?: number;
    pitcher?: PitcherStats;
    form?: TeamForm;
  };
  away: {
    team: Team;
    score?: number;
    pitcher?: PitcherStats;
    form?: TeamForm;
  };
  venue?: VenueInfo;
  odds?: OddsLine;
  badges: BadgeResult[];
  computedAt: string;
}

export interface DailyEnvelope {
  date: string;
  games: EnrichedGame[];
  computedAt: string;
}

// ============================================================
// Legacy front-end Game type kept for backward-compat
// ============================================================

export type Game = RawGame;

export interface BettingOdds {
  gamePk: number;
  bookmaker: string;
  markets: {
    key: string;
    outcomes: {
      name: string;
      price: number;
    }[];
  }[];
  lastUpdate: string;
}
