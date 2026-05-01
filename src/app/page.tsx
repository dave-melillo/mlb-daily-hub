'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { format, addDays, subDays } from 'date-fns';
import GameCard from '@/components/GameCard';
import type { DailyEnvelope } from '@/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const { data, error, isLoading } = useSWR<DailyEnvelope>(
    `/api/games?date=${dateStr}`,
    fetcher,
    { refreshInterval: 60000 },
  );

  const games = data?.games ?? [];
  const totalBadges = games.reduce((sum, g) => sum + g.badges.length, 0);
  const lit = games.filter((g) => g.badges.length >= 3).length;

  const goToPrevDay = () => setSelectedDate((d) => subDays(d, 1));
  const goToNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const goToToday = () => setSelectedDate(new Date());
  const isToday =
    format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <p className="font-display tracking-[0.18em] text-xs text-primary mb-1">MLB</p>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Daily Slate</h1>
        <p className="text-muted-foreground mt-2">
          Live games, lineups, and system badges. Refreshes every 60s.
        </p>

        {/* Date navigator */}
        <div className="flex items-center justify-between mt-6 bg-card border border-border rounded-lg p-3">
          <button
            onClick={goToPrevDay}
            className="px-3 py-1.5 rounded-md bg-background/40 hover:bg-background/70 border border-border text-sm transition-colors"
          >
            ← Prev
          </button>

          <div className="text-center">
            <p className="font-medium text-foreground">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
            {!isToday && (
              <button
                onClick={goToToday}
                className="text-xs text-primary hover:underline mt-0.5"
              >
                Go to today
              </button>
            )}
          </div>

          <button
            onClick={goToNextDay}
            className="px-3 py-1.5 rounded-md bg-background/40 hover:bg-background/70 border border-border text-sm transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Stats strip */}
        {games.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{games.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Games</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary">{totalBadges}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Badges</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-300">{lit}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">3+ Badge Games</div>
            </div>
          </div>
        )}
      </header>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading slate…
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-destructive">
          Failed to load games. Try again in a sec.
        </div>
      )}

      {!isLoading && !error && games.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No games scheduled for this day.</p>
          {isToday && <p className="text-sm mt-2">Check back during the season.</p>}
        </div>
      )}

      <div className="grid gap-4">
        {games.map((g) => (
          <GameCard key={g.gamePk} game={g} />
        ))}
      </div>

      {data?.computedAt && (
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Last refreshed {format(new Date(data.computedAt), 'h:mm:ss a')} ·
          <span className="ml-1">data via MLB Stats API + The Odds API</span>
        </footer>
      )}
    </main>
  );
}
