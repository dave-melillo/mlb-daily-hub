import { render, screen, fireEvent } from '@testing-library/react'
import GameCard from '../GameCard'
import { Game } from '@/types'

// Mock the child components
jest.mock('../Lineups', () => {
  return function MockLineups({ gamePk }: { gamePk: number }) {
    return <div data-testid="lineups">Lineups for game {gamePk}</div>
  }
})

jest.mock('../BettingOdds', () => {
  return function MockBettingOdds({ 
    gamePk, 
    awayTeam, 
    homeTeam 
  }: { 
    gamePk: number
    awayTeam: string
    homeTeam: string 
  }) {
    return (
      <div data-testid="betting-odds">
        Odds for {awayTeam} @ {homeTeam} (Game {gamePk})
      </div>
    )
  }
})

describe('GameCard', () => {
  const mockPreviewGame: Game = {
    gamePk: 12345,
    gameDate: '2026-03-25T19:05:00Z',
    status: {
      abstractGameState: 'Preview',
      detailedState: 'Scheduled',
    },
    teams: {
      away: {
        team: {
          id: 147,
          name: 'New York Yankees',
          abbreviation: 'NYY',
        },
      },
      home: {
        team: {
          id: 111,
          name: 'Boston Red Sox',
          abbreviation: 'BOS',
        },
      },
    },
  }

  const mockLiveGame: Game = {
    ...mockPreviewGame,
    gamePk: 67890,
    status: {
      abstractGameState: 'Live',
      detailedState: 'In Progress',
    },
    teams: {
      away: {
        team: mockPreviewGame.teams.away.team,
        score: 3,
      },
      home: {
        team: mockPreviewGame.teams.home.team,
        score: 2,
      },
    },
  }

  const mockFinalGame: Game = {
    ...mockPreviewGame,
    gamePk: 11111,
    status: {
      abstractGameState: 'Final',
      detailedState: 'Final',
    },
    teams: {
      away: {
        team: mockPreviewGame.teams.away.team,
        score: 5,
      },
      home: {
        team: mockPreviewGame.teams.home.team,
        score: 4,
      },
    },
  }

  it('renders game status badge for preview game', () => {
    render(<GameCard game={mockPreviewGame} />)
    
    expect(screen.getByText(/\d{1,2}:05\s?(AM|PM)/i)).toBeInTheDocument()
    expect(screen.getByText('Scheduled')).toBeInTheDocument()
  })

  it('renders LIVE badge for live game', () => {
    render(<GameCard game={mockLiveGame} />)
    
    expect(screen.getByText('LIVE')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders FINAL badge for completed game', () => {
    render(<GameCard game={mockFinalGame} />)
    
    expect(screen.getByText('FINAL')).toBeInTheDocument()
    expect(screen.getByText('Final')).toBeInTheDocument()
  })

  it('displays team names correctly', () => {
    render(<GameCard game={mockPreviewGame} />)
    
    expect(screen.getByText('New York Yankees')).toBeInTheDocument()
    expect(screen.getByText('Boston Red Sox')).toBeInTheDocument()
  })

  it('displays scores for live game', () => {
    render(<GameCard game={mockLiveGame} />)
    
    const scores = screen.getAllByText(/^[0-9]+$/)
    expect(scores).toHaveLength(2)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('displays scores for final game', () => {
    render(<GameCard game={mockFinalGame} />)
    
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('does not display scores for preview game', () => {
    render(<GameCard game={mockPreviewGame} />)
    
    // Should not have any score elements for preview games
    const numbers = screen.queryAllByText(/^[0-9]+$/)
    expect(numbers.length).toBe(0)
  })

  it('toggles lineups display when button clicked', () => {
    render(<GameCard game={mockPreviewGame} />)
    
    const lineupsButton = screen.getByText('Show Lineups')
    
    // Initially hidden
    expect(screen.queryByTestId('lineups')).not.toBeInTheDocument()
    
    // Click to show
    fireEvent.click(lineupsButton)
    expect(screen.getByTestId('lineups')).toBeInTheDocument()
    expect(screen.getByText('Hide Lineups')).toBeInTheDocument()
    
    // Click to hide
    fireEvent.click(screen.getByText('Hide Lineups'))
    expect(screen.queryByTestId('lineups')).not.toBeInTheDocument()
    expect(screen.getByText('Show Lineups')).toBeInTheDocument()
  })

  it('toggles odds display when button clicked', () => {
    render(<GameCard game={mockPreviewGame} />)
    
    const oddsButton = screen.getByText('Show Odds')
    
    // Initially hidden
    expect(screen.queryByTestId('betting-odds')).not.toBeInTheDocument()
    
    // Click to show
    fireEvent.click(oddsButton)
    expect(screen.getByTestId('betting-odds')).toBeInTheDocument()
    expect(screen.getByText('Hide Odds')).toBeInTheDocument()
    
    // Click to hide
    fireEvent.click(screen.getByText('Hide Odds'))
    expect(screen.queryByTestId('betting-odds')).not.toBeInTheDocument()
    expect(screen.getByText('Show Odds')).toBeInTheDocument()
  })

  it('passes correct props to BettingOdds component', () => {
    render(<GameCard game={mockPreviewGame} />)
    
    // Show odds
    fireEvent.click(screen.getByText('Show Odds'))
    
    // Check that the mock received correct props
    expect(screen.getByTestId('betting-odds')).toHaveTextContent(
      'Odds for New York Yankees @ Boston Red Sox (Game 12345)'
    )
  })

  it('passes correct gamePk to Lineups component', () => {
    render(<GameCard game={mockPreviewGame} />)
    
    // Show lineups
    fireEvent.click(screen.getByText('Show Lineups'))
    
    // Check that the mock received correct gamePk
    expect(screen.getByTestId('lineups')).toHaveTextContent('Lineups for game 12345')
  })

  it('displays away and home labels', () => {
    render(<GameCard game={mockPreviewGame} />)
    
    expect(screen.getByText('AWAY')).toBeInTheDocument()
    expect(screen.getByText('HOME')).toBeInTheDocument()
  })

  it('applies correct styling classes based on game state', () => {
    const { rerender } = render(<GameCard game={mockPreviewGame} />)
    
    // Preview game - blue badge
    let statusBadge = screen.getByText(/\d{1,2}:05\s?(AM|PM)/i)
    expect(statusBadge).toHaveClass('bg-blue-500')
    
    // Live game - red badge
    rerender(<GameCard game={mockLiveGame} />)
    statusBadge = screen.getByText('LIVE')
    expect(statusBadge).toHaveClass('bg-red-500')
    
    // Final game - gray badge
    rerender(<GameCard game={mockFinalGame} />)
    statusBadge = screen.getByText('FINAL')
    expect(statusBadge).toHaveClass('bg-gray-500')
  })
})
