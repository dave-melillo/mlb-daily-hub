'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { BadgeResult, EnrichedGame, PitcherStats } from '@/types';
import { BadgeChip } from './BadgeChip';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: EnrichedGame;
}

function fmtRecord(p?: PitcherStats): string {
  if (!p) return 'TBA';
  const era = p.era != null ? p.era.toFixed(2) : '-.--';
  const k9 = p.k9 != null ? p.k9.toFixed(1) : '-.-';
  return `${era} ERA · ${k9} K/9`;
}

function fmtML(ml?: number): string {
  if (ml == null) return '';
  return ml > 0 ? `+${ml}` : String(ml);
}

function pct(v?: number | null): string {
  if (v == null) return '—';
  return `${(v * 100).toFixed(0)}%`;
}

export default function GameCard({ game }: GameCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isLive = game.status.abstract === 'Live';
  const isFinal = game.status.abstract === 'Final';
  const gameTime = new Date(game.gameDate);
  const status = isLive ? 'LIVE' : isFinal ? 'FINAL' : format(gameTime, 'h:mm a');
  const homeFav = game.odds && game.odds.homeMoneyline < game.odds.awayMoneyline;

  return (
    <div className="rounded-xl border border-border bg-card hover:border-primary/30 transition-colors overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4">
        <span
          className={cn(
            'badge-fx inline-flex items-center gap-1.5 text-[10px] font-display tracking-[0.18em] px-2 py-1 rounded-full border',
            isLive && 'bg-destructive/20 text-destructive border-destructive/40 badge-fx-gold',
            isFinal && 'bg-muted text-muted-foreground border-border',
            !isLive && !isFinal && 'bg-primary/10 text-primary border-primary/30',
          )}
        >
          {isLive && <span className="size-1.5 rounded-full bg-destructive animate-pulse" />}
          {status}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {game.status.detail}
        </span>
      </div>

      <div className="px-4 pt-3 pb-2 space-y-1.5">
        <TeamRow
          label="AWAY"
          name={game.away.team.name}
          abbr={game.away.team.abbreviation}
          score={game.away.score}
          pitcher={game.away.pitcher}
          ml={game.odds?.awayMoneyline}
          isFav={!homeFav && game.odds != null}
        />
        <TeamRow
          label="HOME"
          name={game.home.team.name}
          abbr={game.home.team.abbreviation}
          score={game.home.score}
          pitcher={game.home.pitcher}
          ml={game.odds?.homeMoneyline}
          isFav={!!homeFav}
        />
      </div>

      {game.badges.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {game.badges.map((b) => (
            <BadgeChip
              key={b.id}
              badge={b}
              homeAbbr={game.home.team.abbreviation}
              awayAbbr={game.away.team.abbreviation}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setShowDetails((s) => !s)}
        className="w-full px-4 py-2.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors border-t border-border flex items-center justify-between"
      >
        <span>{showDetails ? 'Hide details' : 'Show details'}</span>
        <span className="font-display tracking-[0.18em] text-primary">
          {game.badges.length > 0
            ? `${game.badges.length} BADGE${game.badges.length === 1 ? '' : 'S'}`
            : 'NO BADGES'}
        </span>
      </button>

      {showDetails && (
        <div className="px-4 pb-4 pt-2 space-y-2 border-t border-border">
          <DetailRow
            label="Park"
            value={game.venue?.name ?? '—'}
            sub={
              game.venue
                ? `PF ${game.venue.parkFactor}${game.venue.windMph ? ` · wind ${game.venue.windMph} mph ${game.venue.windDir}` : ''}`
                : undefined
            }
          />
          <DetailRow
            label="Pitchers"
            value={`${game.away.pitcher?.name ?? 'TBA'} (${fmtRecord(game.away.pitcher)})`}
            sub={`vs ${game.home.pitcher?.name ?? 'TBA'} (${fmtRecord(game.home.pitcher)})`}
          />
          {game.odds && (
            <DetailRow
              label="Lines"
              value={`${game.away.team.abbreviation} ${fmtML(game.odds.awayMoneyline)}  ·  ${game.home.team.abbreviation} ${fmtML(game.odds.homeMoneyline)}`}
              sub={`${game.odds.bookmaker} · O/U ${game.odds.total}`}
            />
          )}
          {(game.home.form?.last10WinPct != null || game.away.form?.last10WinPct != null) && (
            <DetailRow
              label="Form (L10)"
              value={`${game.away.team.abbreviation} ${pct(game.away.form?.last10WinPct)}  ·  ${game.home.team.abbreviation} ${pct(game.home.form?.last10WinPct)}`}
            />
          )}
          {game.badges.map((b) => (
            <BadgeWhy key={b.id} badge={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamRow({
  label,
  name,
  abbr,
  score,
  pitcher,
  ml,
  isFav,
}: {
  label: string;
  name: string;
  abbr: string;
  score?: number;
  pitcher?: PitcherStats;
  ml?: number;
  isFav: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widest text-muted-foreground">{label}</span>
          <span className="font-semibold text-foreground truncate">{name}</span>
          <span className="text-xs font-display tracking-[0.1em] text-muted-foreground">{abbr}</span>
        </div>
        {pitcher && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {pitcher.name} · {fmtRecord(pitcher)}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {ml != null && (
          <span
            className={cn(
              'text-xs font-mono font-bold',
              isFav ? 'text-primary' : 'text-emerald-300',
            )}
          >
            {fmtML(ml)}
          </span>
        )}
        {score != null ? (
          <span className="text-2xl font-display tracking-[0.05em] text-foreground tabular-nums">
            {score}
          </span>
        ) : (
          <span className="text-2xl font-display tracking-[0.05em] text-muted-foreground/40 tabular-nums">
            —
          </span>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
          {label}
        </span>
        <span className="text-sm text-foreground/90 text-right truncate">{value}</span>
      </div>
      {sub && (
        <div className="text-xs text-muted-foreground text-right mt-0.5">{sub}</div>
      )}
    </div>
  );
}

function BadgeWhy({ badge }: { badge: BadgeResult }) {
  return (
    <div className="bg-background/40 rounded p-2 text-xs">
      <span className="text-primary font-medium mr-2">·</span>
      <span className="text-foreground/80">{badge.reason}</span>
    </div>
  );
}
