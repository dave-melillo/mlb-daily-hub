import { NextRequest, NextResponse } from 'next/server'

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1'

// Cache lineups for 10 minutes
const CACHE_DURATION = 600

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const gamePk = searchParams.get('gamePk')

  if (!gamePk) {
    return NextResponse.json(
      { error: 'gamePk parameter required' },
      { status: 400 }
    )
  }

  try {
    const url = `${MLB_API_BASE}/game/${gamePk}/boxscore`
    
    const response = await fetch(url, {
      next: { revalidate: CACHE_DURATION }
    })

    if (!response.ok) {
      throw new Error(`MLB API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Extract batting orders
    const lineups = {
      away: {
        teamId: data.teams?.away?.team?.id,
        teamName: data.teams?.away?.team?.name,
        players: data.teams?.away?.battingOrder?.map((playerId: number) => {
          const player = data.teams.away.players[`ID${playerId}`]
          return {
            id: playerId,
            fullName: player?.person?.fullName,
            position: player?.position?.abbreviation
          }
        }).filter(Boolean) || []
      },
      home: {
        teamId: data.teams?.home?.team?.id,
        teamName: data.teams?.home?.team?.name,
        players: data.teams?.home?.battingOrder?.map((playerId: number) => {
          const player = data.teams.home.players[`ID${playerId}`]
          return {
            id: playerId,
            fullName: player?.person?.fullName,
            position: player?.position?.abbreviation
          }
        }).filter(Boolean) || []
      }
    }

    return NextResponse.json(lineups, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
      }
    })
  } catch (error) {
    console.error('Error fetching lineups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lineups' },
      { status: 500 }
    )
  }
}
