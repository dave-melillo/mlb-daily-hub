'use client'

import { useState } from 'react'
import { Game } from '@/types'
import { format } from 'date-fns'
import Lineups from './Lineups'
import BettingOdds from './BettingOdds'

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  const [showLineups, setShowLineups] = useState(false)
  const [showOdds, setShowOdds] = useState(false)

  const isLive = game.status.abstractGameState === 'Live'
  const isFinal = game.status.abstractGameState === 'Final'
  const isPreview = game.status.abstractGameState === 'Preview'

  const gameTime = new Date(game.gameDate)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-4">
      {/* Game Status */}
      <div className="flex justify-between items-center mb-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded ${
          isLive ? 'bg-red-500 text-white' :
          isFinal ? 'bg-gray-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {isLive ? 'LIVE' : isFinal ? 'FINAL' : format(gameTime, 'h:mm a')}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {game.status.detailedState}
        </span>
      </div>

      {/* Teams & Scores */}
      <div className="space-y-2">
        {/* Away Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">AWAY</span>
            <span className="font-semibold">{game.teams.away.team.name}</span>
          </div>
          {game.teams.away.score !== undefined && (
            <span className="text-2xl font-bold">{game.teams.away.score}</span>
          )}
        </div>

        {/* Home Team */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">HOME</span>
            <span className="font-semibold">{game.teams.home.team.name}</span>
          </div>
          {game.teams.home.score !== undefined && (
            <span className="text-2xl font-bold">{game.teams.home.score}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setShowLineups(!showLineups)}
          className="flex-1 bg-mlb-blue hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition"
        >
          {showLineups ? 'Hide' : 'Show'} Lineups
        </button>
        <button
          onClick={() => setShowOdds(!showOdds)}
          className="flex-1 bg-mlb-red hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition"
        >
          {showOdds ? 'Hide' : 'Show'} Odds
        </button>
      </div>

      {/* Expandable Lineups */}
      {showLineups && <Lineups gamePk={game.gamePk} />}

      {/* Expandable Odds */}
      {showOdds && (
        <BettingOdds 
          gamePk={game.gamePk}
          homeTeam={game.teams.home.team.name}
          awayTeam={game.teams.away.team.name}
        />
      )}
    </div>
  )
}
