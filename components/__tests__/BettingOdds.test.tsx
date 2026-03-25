import { render, screen, waitFor } from '@testing-library/react'
import BettingOdds from '../BettingOdds'
import useSWR from 'swr'

// Mock SWR
jest.mock('swr')
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

describe('BettingOdds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(
      <BettingOdds 
        gamePk={12345} 
        awayTeam="New York Yankees" 
        homeTeam="Boston Red Sox" 
      />
    )

    expect(screen.getByText('Loading odds...')).toBeInTheDocument()
  })

  it('shows error state when API fails', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('API Error'),
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(
      <BettingOdds 
        gamePk={12345} 
        awayTeam="New York Yankees" 
        homeTeam="Boston Red Sox" 
      />
    )

    expect(screen.getByText(/Betting odds unavailable/)).toBeInTheDocument()
  })

  it('shows no data message when no odds available', () => {
    mockUseSWR.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(
      <BettingOdds 
        gamePk={12345} 
        awayTeam="New York Yankees" 
        homeTeam="Boston Red Sox" 
      />
    )

    expect(screen.getByText('No odds available for this game')).toBeInTheDocument()
  })

  it('matches game by team names correctly', async () => {
    const mockOddsData = [
      {
        id: 'game1',
        home_team: 'Boston Red Sox',
        away_team: 'New York Yankees',
        bookmakers: [
          {
            key: 'draftkings',
            title: 'DraftKings',
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'New York Yankees', price: -150 },
                  { name: 'Boston Red Sox', price: 130 },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'game2',
        home_team: 'Los Angeles Dodgers',
        away_team: 'San Francisco Giants',
        bookmakers: [],
      },
    ]

    mockUseSWR.mockReturnValue({
      data: mockOddsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(
      <BettingOdds 
        gamePk={12345} 
        awayTeam="New York Yankees" 
        homeTeam="Boston Red Sox" 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('DraftKings')).toBeInTheDocument()
      expect(screen.getByText('Moneyline')).toBeInTheDocument()
      expect(screen.getByText('-150')).toBeInTheDocument()
      expect(screen.getByText('+130')).toBeInTheDocument()
    })
  })

  it('handles fuzzy team name matching', async () => {
    const mockOddsData = [
      {
        id: 'game1',
        home_team: 'RedSox', // Normalized form
        away_team: 'Yankees', // Shortened form
        bookmakers: [
          {
            key: 'fanduel',
            title: 'FanDuel',
            markets: [
              {
                key: 'spreads',
                outcomes: [
                  { name: 'Yankees', price: -110, point: -1.5 },
                  { name: 'RedSox', price: -110, point: 1.5 },
                ],
              },
            ],
          },
        ],
      },
    ]

    mockUseSWR.mockReturnValue({
      data: mockOddsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(
      <BettingOdds 
        gamePk={12345} 
        awayTeam="New York Yankees" 
        homeTeam="Boston Red Sox" 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('FanDuel')).toBeInTheDocument()
      expect(screen.getByText('Spread')).toBeInTheDocument()
    })
  })

  it('displays multiple bookmakers and market types', async () => {
    const mockOddsData = [
      {
        id: 'game1',
        home_team: 'Boston Red Sox',
        away_team: 'New York Yankees',
        bookmakers: [
          {
            key: 'draftkings',
            title: 'DraftKings',
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'New York Yankees', price: -150 },
                  { name: 'Boston Red Sox', price: 130 },
                ],
              },
              {
                key: 'spreads',
                outcomes: [
                  { name: 'New York Yankees', price: -110, point: -1.5 },
                  { name: 'Boston Red Sox', price: -110, point: 1.5 },
                ],
              },
              {
                key: 'totals',
                outcomes: [
                  { name: 'Over', price: -115, point: 9.5 },
                  { name: 'Under', price: -105, point: 9.5 },
                ],
              },
            ],
          },
          {
            key: 'fanduel',
            title: 'FanDuel',
            markets: [
              {
                key: 'h2h',
                outcomes: [
                  { name: 'New York Yankees', price: -145 },
                  { name: 'Boston Red Sox', price: 125 },
                ],
              },
            ],
          },
        ],
      },
    ]

    mockUseSWR.mockReturnValue({
      data: mockOddsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(
      <BettingOdds 
        gamePk={12345} 
        awayTeam="New York Yankees" 
        homeTeam="Boston Red Sox" 
      />
    )

    await waitFor(() => {
      expect(screen.getByText('DraftKings')).toBeInTheDocument()
      expect(screen.getByText('FanDuel')).toBeInTheDocument()
      expect(screen.getAllByText('Moneyline')).toHaveLength(2) // DraftKings and FanDuel
      expect(screen.getByText('Spread')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
    })
  })

  it('displays responsible gambling disclaimer', () => {
    mockUseSWR.mockReturnValue({
      data: [
        {
          home_team: 'Boston Red Sox',
          away_team: 'New York Yankees',
          bookmakers: [],
        },
      ],
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(
      <BettingOdds 
        gamePk={12345} 
        awayTeam="New York Yankees" 
        homeTeam="Boston Red Sox" 
      />
    )

    expect(screen.getByText(/For informational purposes only/)).toBeInTheDocument()
    expect(screen.getByText(/1-800-GAMBLER/)).toBeInTheDocument()
  })

  it('does not match wrong game', () => {
    const mockOddsData = [
      {
        id: 'game1',
        home_team: 'Los Angeles Dodgers',
        away_team: 'San Francisco Giants',
        bookmakers: [
          {
            key: 'draftkings',
            title: 'DraftKings',
            markets: [],
          },
        ],
      },
    ]

    mockUseSWR.mockReturnValue({
      data: mockOddsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(
      <BettingOdds 
        gamePk={12345} 
        awayTeam="New York Yankees" 
        homeTeam="Boston Red Sox" 
      />
    )

    // Should show "No odds available" because teams don't match
    expect(screen.getByText('No odds available for this game')).toBeInTheDocument()
  })
})
