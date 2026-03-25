'use client'

import useSWR from 'swr'
import { Lineup } from '@/types'

interface LineupsProps {
  gamePk: number
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Lineups({ gamePk }: LineupsProps) {
  const { data, error, isLoading } = useSWR<{ away: Lineup, home: Lineup }>(
    `/api/mlb/lineups?gamePk=${gamePk}`,
    fetcher
  )

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading lineups...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded">
        <p className="text-sm text-red-500">Failed to load lineups</p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Away Lineup */}
      <div className="bg-gray-50 dark:bg-slate-700 rounded p-3">
        <h4 className="font-semibold text-sm mb-2">{data.away.teamName} Lineup</h4>
        {data.away.players.length > 0 ? (
          <ol className="text-sm space-y-1">
            {data.away.players.map((player, idx) => (
              <li key={player.id} className="flex justify-between">
                <span>{idx + 1}. {player.fullName}</span>
                <span className="text-gray-500 dark:text-gray-400">{player.position}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Lineup not yet available</p>
        )}
      </div>

      {/* Home Lineup */}
      <div className="bg-gray-50 dark:bg-slate-700 rounded p-3">
        <h4 className="font-semibold text-sm mb-2">{data.home.teamName} Lineup</h4>
        {data.home.players.length > 0 ? (
          <ol className="text-sm space-y-1">
            {data.home.players.map((player, idx) => (
              <li key={player.id} className="flex justify-between">
                <span>{idx + 1}. {player.fullName}</span>
                <span className="text-gray-500 dark:text-gray-400">{player.position}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Lineup not yet available</p>
        )}
      </div>
    </div>
  )
}
