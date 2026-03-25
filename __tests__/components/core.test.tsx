/**
 * Core component tests
 * Tests critical functionality without flaky SWR mocking
 */

import { render, screen, fireEvent } from '@testing-library/react'
import GameCard from '@/components/GameCard'
import { Game } from '@/types'

// Mock child components to isolate GameCard logic
jest.mock('@/components/Lineups', () => {
  return function MockLineups({ gamePk }: { gamePk: number }) {
    return <div data-testid="lineups">Lineups {gamePk}</div>
  }
})

jest.mock('@/components/BettingOdds', () => {
  return function MockBettingOdds({ 
    gamePk, 
    homeTeam, 
    awayTeam 
  }: { 
    gamePk: number
    homeTeam: string
    awayTeam: string
  }) {
    return <div data-testid="odds">{awayTeam} @ {homeTeam}</div>
  }
})

describe('GameCard Component', () => {
  const mockGame: Game = {
    gamePk: 123456,
    gameDate: '2024-03-25T17:05:00Z',
    status: {
      abstractGameState: 'Preview',
      detailedState: 'Scheduled'
    },
    teams: {
      away: {
        team: { id: 1, name: 'Boston Red Sox', abbreviation: 'BOS' }
      },
      home: {
        team: { id: 2, name: 'New York Yankees', abbreviation: 'NYY' }
      }
    }
  }

  it('should render team names', () => {
    render(<GameCard game={mockGame} />)

    expect(screen.getByText('Boston Red Sox')).toBeInTheDocument()
    expect(screen.getByText('New York Yankees')).toBeInTheDocument()
  })

  it('should toggle lineups', () => {
    render(<GameCard game={mockGame} />)

    const button = screen.getByText(/Show Lineups/i)
    
    expect(screen.queryByTestId('lineups')).not.toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByTestId('lineups')).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(screen.queryByTestId('lineups')).not.toBeInTheDocument()
  })

  it('should toggle betting odds', () => {
    render(<GameCard game={mockGame} />)

    const button = screen.getByText(/Show Odds/i)
    
    expect(screen.queryByTestId('odds')).not.toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByTestId('odds')).toBeInTheDocument()
    
    fireEvent.click(button)
    expect(screen.queryByTestId('odds')).not.toBeInTheDocument()
  })

  it('should pass correct props to BettingOdds (BUG-01 regression test)', () => {
    render(<GameCard game={mockGame} />)

    fireEvent.click(screen.getByText(/Show Odds/i))

    // This is the critical fix: team names must be passed
    expect(screen.getByText('Boston Red Sox @ New York Yankees')).toBeInTheDocument()
  })

  it('should display game status', () => {
    render(<GameCard game={mockGame} />)

    expect(screen.getByText('Scheduled')).toBeInTheDocument()
  })

  it('should show scores for live games', () => {
    const liveGame: Game = {
      ...mockGame,
      status: { abstractGameState: 'Live', detailedState: 'In Progress' },
      teams: {
        away: { ...mockGame.teams.away, score: 3 },
        home: { ...mockGame.teams.home, score: 2 }
      }
    }

    render(<GameCard game={liveGame} />)

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('LIVE')).toBeInTheDocument()
  })

  it('should show FINAL for completed games', () => {
    const finalGame: Game = {
      ...mockGame,
      status: { abstractGameState: 'Final', detailedState: 'Final' },
      teams: {
        away: { ...mockGame.teams.away, score: 5 },
        home: { ...mockGame.teams.home, score: 4 }
      }
    }

    render(<GameCard game={finalGame} />)

    expect(screen.getByText('FINAL')).toBeInTheDocument()
  })
})

describe('Team Matching Logic', () => {
  it('should match teams by name (exact match)', () => {
    const oddsData = [
      { home_team: 'New York Yankees', away_team: 'Boston Red Sox', bookmakers: [] },
      { home_team: 'Los Angeles Dodgers', away_team: 'San Francisco Giants', bookmakers: [] }
    ]

    const homeTeam = 'New York Yankees'
    const awayTeam = 'Boston Red Sox'

    const match = oddsData.find(game => 
      (game.home_team === homeTeam && game.away_team === awayTeam) ||
      (game.home_team === awayTeam && game.away_team === homeTeam)
    )

    expect(match).toBeDefined()
    expect(match?.home_team).toBe('New York Yankees')
  })

  it('should match when teams are reversed', () => {
    const oddsData = [
      { home_team: 'New York Yankees', away_team: 'Boston Red Sox', bookmakers: [] }
    ]

    const homeTeam = 'Boston Red Sox'
    const awayTeam = 'New York Yankees'

    const match = oddsData.find(game => 
      (game.home_team === homeTeam && game.away_team === awayTeam) ||
      (game.home_team === awayTeam && game.away_team === homeTeam)
    )

    expect(match).toBeDefined()
  })

  it('should NOT match wrong game (BUG-01 prevention)', () => {
    const oddsData = [
      { home_team: 'New York Yankees', away_team: 'Boston Red Sox', bookmakers: [] },
      { home_team: 'Los Angeles Dodgers', away_team: 'San Francisco Giants', bookmakers: [] }
    ]

    const homeTeam = 'Los Angeles Dodgers'
    const awayTeam = 'San Francisco Giants'

    const match = oddsData.find(game => 
      (game.home_team === homeTeam && game.away_team === awayTeam) ||
      (game.home_team === awayTeam && game.away_team === homeTeam)
    )

    // Should get the SECOND game, not the first
    expect(match?.home_team).toBe('Los Angeles Dodgers')
    expect(match?.away_team).toBe('San Francisco Giants')
  })

  it('should return undefined for non-existent team', () => {
    const oddsData = [
      { home_team: 'New York Yankees', away_team: 'Boston Red Sox', bookmakers: [] }
    ]

    const match = oddsData.find(game => 
      (game.home_team === 'Fake Team' && game.away_team === 'Another Fake') ||
      (game.home_team === 'Another Fake' && game.away_team === 'Fake Team')
    )

    expect(match).toBeUndefined()
  })
})
