'use client'

import useSWR from 'swr'

interface BettingOddsProps {
  gamePk: number
  awayTeam: string
  homeTeam: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

/**
 * Match team names between MLB API and Odds API
 * The Odds API uses full team names (e.g., "New York Yankees")
 * while MLB API also uses full names, but we need fuzzy matching
 * to handle potential variations
 */
function matchTeamNames(oddsTeam: string, mlbTeam: string): boolean {
  const normalize = (name: string) => 
    name.toLowerCase().replace(/[^a-z]/g, '')
  
  const oddsNorm = normalize(oddsTeam)
  const mlbNorm = normalize(mlbTeam)
  
  // Exact match after normalization
  if (oddsNorm === mlbNorm) return true
  
  // Check if one contains the other (handles "New York Yankees" vs "Yankees")
  if (oddsNorm.includes(mlbNorm) || mlbNorm.includes(oddsNorm)) return true
  
  return false
}

export default function BettingOdds({ gamePk, awayTeam, homeTeam }: BettingOddsProps) {
  const { data, error, isLoading } = useSWR<any[]>(
    `/api/odds`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading odds...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded">
        <p className="text-sm text-yellow-600 dark:text-yellow-500">
          Betting odds unavailable or API limit reached
        </p>
      </div>
    )
  }

  // Find game by matching team names
  const gameOdds = data.find(game => {
    // The Odds API structure has home_team and away_team fields
    const hasHomeMatch = game.home_team && matchTeamNames(game.home_team, homeTeam)
    const hasAwayMatch = game.away_team && matchTeamNames(game.away_team, awayTeam)
    return hasHomeMatch && hasAwayMatch
  })

  if (!gameOdds) {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded">
        <p className="text-sm text-gray-500 dark:text-gray-400">No odds available for this game</p>
      </div>
    )
  }

  return (
    <div className="mt-4 bg-gray-50 dark:bg-slate-700 rounded p-3">
      <h4 className="font-semibold text-sm mb-3">Betting Odds</h4>
      
      {gameOdds.bookmakers?.map((bookmaker: any) => (
        <div key={bookmaker.key} className="mb-3">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {bookmaker.title}
          </p>
          {bookmaker.markets?.map((market: any) => (
            <div key={market.key} className="mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {market.key === 'h2h' ? 'Moneyline' : 
                 market.key === 'spreads' ? 'Spread' : 
                 'Total'}
              </p>
              <div className="flex gap-2 text-sm">
                {market.outcomes?.map((outcome: any) => (
                  <div key={outcome.name} className="flex-1 bg-white dark:bg-slate-800 p-2 rounded">
                    <p className="font-medium">{outcome.name}</p>
                    <p className="text-mlb-blue dark:text-blue-400 font-bold">
                      {outcome.price > 0 ? '+' : ''}{outcome.price}
                    </p>
                    {outcome.point && (
                      <p className="text-xs text-gray-500">{outcome.point}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Responsible Gambling Disclaimer */}
      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ⚠️ For informational purposes only. If you or someone you know has a gambling problem, 
          call 1-800-GAMBLER or visit <a href="https://www.ncpgambling.org" className="underline" target="_blank" rel="noopener">ncpgambling.org</a>
        </p>
      </div>
    </div>
  )
}
