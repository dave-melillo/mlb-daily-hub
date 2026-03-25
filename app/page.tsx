'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { format, addDays, subDays } from 'date-fns'
import { MLBScheduleResponse } from '@/types'
import GameCard from '@/components/GameCard'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  // Auto-refresh every 60 seconds
  const { data, error, isLoading } = useSWR<MLBScheduleResponse>(
    `/api/mlb/schedule?date=${dateStr}`,
    fetcher,
    { refreshInterval: 60000 }
  )

  const games = data?.dates?.[0]?.games || []

  const goToPrevDay = () => setSelectedDate(subDays(selectedDate, 1))
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1))
  const goToToday = () => setSelectedDate(new Date())

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-mlb-blue text-white py-6 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">⚾ MLB Daily Hub</h1>
          <p className="text-blue-200">Live games, lineups, stats & betting insights</p>
        </div>
      </header>

      {/* Date Navigator */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 shadow">
          <button
            onClick={goToPrevDay}
            className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 px-4 py-2 rounded transition"
          >
            ← Prev
          </button>
          
          <div className="text-center">
            <p className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
            {format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
              <button
                onClick={goToToday}
                className="text-sm text-mlb-blue hover:underline mt-1"
              >
                Go to Today
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 px-4 py-2 rounded transition"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Games List */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Loading games...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load games. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && games.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No games scheduled for this date</p>
          </div>
        )}

        {!isLoading && !error && games.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {games.length} {games.length === 1 ? 'Game' : 'Games'}
              </h2>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Auto-refreshes every 60s
              </div>
            </div>
            
            {games.map((game) => (
              <GameCard key={game.gamePk} game={game} />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="max-w-2xl mx-auto px-4 text-center text-sm">
          <p>Data provided by MLB Stats API</p>
          <p className="text-gray-400 mt-1">
            Built with Next.js 14, React 18, Tailwind CSS & SWR
          </p>
        </div>
      </footer>
    </main>
  )
}
