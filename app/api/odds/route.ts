import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'

const ODDS_API_KEY = process.env.ODDS_API_KEY
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4'

// Aggressive caching: 1 hour (500 req/month = ~16/day)
const CACHE_DURATION = 3600

export async function GET(request: NextRequest) {
  if (!ODDS_API_KEY) {
    return NextResponse.json(
      { error: 'Odds API key not configured' },
      { status: 503 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')

  try {
    // Get MLB odds for today
    const url = `${ODDS_API_BASE}/sports/baseball_mlb/odds?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso`
    
    const response = await fetch(url, {
      next: { revalidate: CACHE_DURATION }
    })

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Log remaining requests (important for free tier monitoring)
    const remainingRequests = response.headers.get('x-requests-remaining')
    const usedRequests = response.headers.get('x-requests-used')
    console.log(`Odds API: ${usedRequests} used, ${remainingRequests} remaining`)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        'X-Requests-Remaining': remainingRequests || '0'
      }
    })
  } catch (error) {
    console.error('Error fetching odds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch betting odds' },
      { status: 500 }
    )
  }
}
