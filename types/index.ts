export interface Team {
  id: number
  name: string
  abbreviation: string
}

export interface Game {
  gamePk: number
  gameDate: string
  status: {
    abstractGameState: string
    detailedState: string
  }
  teams: {
    away: {
      team: Team
      score?: number
    }
    home: {
      team: Team
      score?: number
    }
  }
}

export interface Player {
  id: number
  fullName: string
  position: string
}

export interface Lineup {
  teamId: number
  teamName: string
  players: Player[]
}

export interface BettingOdds {
  gamePk: number
  bookmaker: string
  markets: {
    key: string
    outcomes: {
      name: string
      price: number
    }[]
  }[]
  lastUpdate: string
}

export interface MLBScheduleResponse {
  dates: {
    date: string
    games: Game[]
  }[]
}
