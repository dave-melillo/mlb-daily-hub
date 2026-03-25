import { render, screen, waitFor } from '@testing-library/react'
import Lineups from '../Lineups'
import useSWR from 'swr'
import React from 'react'

// Mock SWR
jest.mock('swr')
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

// Mock fetch for fetcher function tests
global.fetch = jest.fn()

describe('Lineups', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockLineupsData = {
    away: {
      teamId: 147,
      teamName: 'New York Yankees',
      players: [
        { id: 1, fullName: 'Aaron Judge', position: 'RF' },
        { id: 2, fullName: 'Anthony Volpe', position: 'SS' },
        { id: 3, fullName: 'Juan Soto', position: 'LF' },
        { id: 4, fullName: 'Giancarlo Stanton', position: 'DH' },
        { id: 5, fullName: 'Gleyber Torres', position: '2B' },
        { id: 6, fullName: 'Anthony Rizzo', position: '1B' },
        { id: 7, fullName: 'DJ LeMahieu', position: '3B' },
        { id: 8, fullName: 'Jose Trevino', position: 'C' },
        { id: 9, fullName: 'Harrison Bader', position: 'CF' },
      ],
    },
    home: {
      teamId: 111,
      teamName: 'Boston Red Sox',
      players: [
        { id: 10, fullName: 'Rafael Devers', position: '3B' },
        { id: 11, fullName: 'Trevor Story', position: 'SS' },
        { id: 12, fullName: 'Masataka Yoshida', position: 'LF' },
        { id: 13, fullName: 'Justin Turner', position: 'DH' },
        { id: 14, fullName: 'Jarren Duran', position: 'CF' },
        { id: 15, fullName: 'Triston Casas', position: '1B' },
        { id: 16, fullName: 'Enrique Hernandez', position: '2B' },
        { id: 17, fullName: 'Connor Wong', position: 'C' },
        { id: 18, fullName: 'Wilyer Abreu', position: 'RF' },
      ],
    },
  }

  it('shows loading state initially', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    expect(screen.getByText('Loading lineups...')).toBeInTheDocument()
  })

  it('shows error state when API fails', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('API Error'),
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    expect(screen.getByText('Failed to load lineups')).toBeInTheDocument()
  })

  it('renders both team lineups correctly', async () => {
    mockUseSWR.mockReturnValue({
      data: mockLineupsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    await waitFor(() => {
      expect(screen.getByText('New York Yankees Lineup')).toBeInTheDocument()
      expect(screen.getByText('Boston Red Sox Lineup')).toBeInTheDocument()
    })
  })

  it('displays all away team players in correct order', async () => {
    mockUseSWR.mockReturnValue({
      data: mockLineupsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    await waitFor(() => {
      expect(screen.getByText(/1\. Aaron Judge/)).toBeInTheDocument()
      expect(screen.getByText(/2\. Anthony Volpe/)).toBeInTheDocument()
      expect(screen.getByText(/3\. Juan Soto/)).toBeInTheDocument()
      expect(screen.getByText(/9\. Harrison Bader/)).toBeInTheDocument()
    })
  })

  it('displays all home team players in correct order', async () => {
    mockUseSWR.mockReturnValue({
      data: mockLineupsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    await waitFor(() => {
      expect(screen.getByText(/1\. Rafael Devers/)).toBeInTheDocument()
      expect(screen.getByText(/2\. Trevor Story/)).toBeInTheDocument()
      expect(screen.getByText(/9\. Wilyer Abreu/)).toBeInTheDocument()
    })
  })

  it('displays player positions', async () => {
    mockUseSWR.mockReturnValue({
      data: mockLineupsData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    await waitFor(() => {
      expect(screen.getAllByText('RF')).toHaveLength(2) // Judge and Abreu
      expect(screen.getAllByText('SS')).toHaveLength(2) // Volpe and Story
      expect(screen.getAllByText('DH')).toHaveLength(2) // Stanton and Turner
    })
  })

  it('shows message when away lineup is not available', async () => {
    const emptyAwayData = {
      away: {
        teamId: 147,
        teamName: 'New York Yankees',
        players: [],
      },
      home: mockLineupsData.home,
    }

    mockUseSWR.mockReturnValue({
      data: emptyAwayData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    await waitFor(() => {
      const messages = screen.getAllByText('Lineup not yet available')
      expect(messages.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows message when home lineup is not available', async () => {
    const emptyHomeData = {
      away: mockLineupsData.away,
      home: {
        teamId: 111,
        teamName: 'Boston Red Sox',
        players: [],
      },
    }

    mockUseSWR.mockReturnValue({
      data: emptyHomeData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    await waitFor(() => {
      const messages = screen.getAllByText('Lineup not yet available')
      expect(messages.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows message when both lineups are not available', async () => {
    const emptyData = {
      away: {
        teamId: 147,
        teamName: 'New York Yankees',
        players: [],
      },
      home: {
        teamId: 111,
        teamName: 'Boston Red Sox',
        players: [],
      },
    }

    mockUseSWR.mockReturnValue({
      data: emptyData,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    await waitFor(() => {
      const messages = screen.getAllByText('Lineup not yet available')
      expect(messages).toHaveLength(2)
    })
  })

  it('makes correct API call with gamePk', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={67890} />)

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/mlb/lineups?gamePk=67890',
      expect.any(Function)
    )
  })

  it('handles data with no error state', async () => {
    // Test the specific case where we have valid data (not loading, no error)
    const mockData = {
      away: {
        teamId: 147,
        teamName: 'Yankees',
        players: [{ id: 1, fullName: 'Player 1', position: 'SS' }],
      },
      home: {
        teamId: 111,
        teamName: 'Red Sox',
        players: [{ id: 2, fullName: 'Player 2', position: '3B' }],
      },
    }

    mockUseSWR.mockReturnValue({
      data: mockData,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any)

    render(<Lineups gamePk={12345} />)

    await waitFor(() => {
      expect(screen.getByText('Yankees Lineup')).toBeInTheDocument()
      expect(screen.getByText('Red Sox Lineup')).toBeInTheDocument()
    })
  })
})
