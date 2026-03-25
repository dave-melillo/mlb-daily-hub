import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1'

// Cache for 5 minutes
const CACHE_DURATION = 300

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')

  try {
    const url = `${MLB_API_BASE}/schedule?sportId=1&date=${date}&hydrate=team,linescore`
    
    const response = await fetch(url, {
      next: { revalidate: CACHE_DURATION }
    })

    if (!response.ok) {
      throw new Error(`MLB API error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
      }
    })
  } catch (error) {
    console.error('Error fetching MLB schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MLB schedule' },
      { status: 500 }
    )
  }
}
