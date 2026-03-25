import { render, screen, fireEvent } from '@testing-library/react'
import GameCard from '@/components/GameCard'
import { Game } from '@/types'

// Mock child components
jest.mock('@/components/Lineups', () => {
  return function MockLineups({ gamePk }: { gamePk: number }) {
    return <div data-testid="lineups">Lineups for game {gamePk}</div>
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
    return (
      <div data-testid="betting-odds">
        Odds for {awayTeam} @ {homeTeam} (gamePk: {gamePk})
      </div>
    )
  }
})

describe('GameCard Component', () => {
  const mockPreviewGame: Game = {
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

  const mockLiveGame: Game = {
    gamePk: 789012,
    gameDate: '2024-03-25T17:05:00Z',
    status: {
      abstractGameState: 'Live',
      detailedState: 'In Progress'
    },
    teams: {
      away: {
        team: { id: 3, name: 'Los Angeles Dodgers', abbreviation: 'LAD' },
        score: 3
      },
      home: {
        team: { id: 4, name: 'San Francisco Giants', abbreviation: 'SF' },
        score: 2
      }
    }
  }

  const mockFinalGame: Game = {
    gamePk: 345678,
    gameDate: '2024-03-25T17:05:00Z',
    status: {
      abstractGameState: 'Final',
      detailedState: 'Final'
    },
    teams: {
      away: {
        team: { id: 5, name: 'Chicago Cubs', abbreviation: 'CHC' },
        score: 5
      },
      home: {
        team: { id: 6, name: 'St. Louis Cardinals', abbreviation: 'STL' },
        score: 4
      }
    }
  }

  it('should render team names', () => {
    render(<GameCard game={mockPreviewGame} />)

    expect(screen.getByText('Boston Red Sox')).toBeInTheDocument()
    expect(screen.getByText('New York Yankees')).toBeInTheDocument()
  })

  it('should display scores for live games', () => {
    render(<GameCard game={mockLiveGame} />)

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should show LIVE badge for live games', () => {
    render(<GameCard game={mockLiveGame} />)

    expect(screen.getByText('LIVE')).toBeInTheDocument()
  })

  it('should show FINAL badge for completed games', () => {
    render(<GameCard game={mockFinalGame} />)

    expect(screen.getByText('FINAL')).toBeInTheDocument()
  })

  it('should show game time for preview games', () => {
    render(<GameCard game={mockPreviewGame} />)

    // Should show time, not LIVE or FINAL
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
    expect(screen.queryByText('FINAL')).not.toBeInTheDocument()
  })

  it('should toggle lineups when button clicked', () => {
    render(<GameCard game={mockPreviewGame} />)

    const lineupsButton = screen.getByText(/Show Lineups/i)
    
    // Initially hidden
    expect(screen.queryByTestId('lineups')).not.toBeInTheDocument()

    // Click to show
    fireEvent.click(lineupsButton)
    expect(screen.getByTestId('lineups')).toBeInTheDocument()
    expect(screen.getByText(/Hide Lineups/i)).toBeInTheDocument()

    // Click to hide
    fireEvent.click(lineupsButton)
    expect(screen.queryByTestId('lineups')).not.toBeInTheDocument()
  })

  it('should toggle betting odds when button clicked', () => {
    render(<GameCard game={mockPreviewGame} />)

    const oddsButton = screen.getByText(/Show Odds/i)
    
    // Initially hidden
    expect(screen.queryByTestId('betting-odds')).not.toBeInTheDocument()

    // Click to show
    fireEvent.click(oddsButton)
    expect(screen.getByTestId('betting-odds')).toBeInTheDocument()
    expect(screen.getByText(/Hide Odds/i)).toBeInTheDocument()

    // Click to hide
    fireEvent.click(oddsButton)
    expect(screen.queryByTestId('betting-odds')).not.toBeInTheDocument()
  })

  it('should pass correct props to BettingOdds component', () => {
    render(<GameCard game={mockPreviewGame} />)

    const oddsButton = screen.getByText(/Show Odds/i)
    fireEvent.click(oddsButton)

    // Verify BettingOdds receives correct team names and gamePk
    expect(screen.getByText(/Odds for Boston Red Sox @ New York Yankees \(gamePk: 123456\)/i)).toBeInTheDocument()
  })

  it('should display game status detail', () => {
    render(<GameCard game={mockPreviewGame} />)

    expect(screen.getByText('Scheduled')).toBeInTheDocument()
  })

  it('should handle games without scores', () => {
    render(<GameCard game={mockPreviewGame} />)

    // No scores for preview games
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
  })
})
