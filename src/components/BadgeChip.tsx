import { BADGE_META } from '@/lib/badges';
import type { BadgeResult } from '@/types';
import { cn } from '@/lib/utils';
import { BadgeIcon } from './BadgeIcon';
import { ConfidenceDots } from './ConfidenceDots';

const TIER_STYLES: Record<BadgeResult['confidence'], string> = {
  HIGH: 'bg-primary/15 text-primary border-primary/40',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  LOW: 'bg-muted text-muted-foreground border-border',
};

interface BadgeChipProps {
  badge: BadgeResult;
  homeAbbr?: string;
  awayAbbr?: string;
  className?: string;
}

export function BadgeChip({ badge, homeAbbr, awayAbbr, className }: BadgeChipProps) {
  const meta = BADGE_META[badge.id];
  if (!meta) return null;

  const sideLabel = badge.side === 'home' ? homeAbbr : badge.side === 'away' ? awayAbbr : null;

  return (
    <span
      title={`${meta.short} — ${badge.reason}`}
      className={cn(
        'badge-fx inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
        TIER_STYLES[badge.confidence],
        badge.confidence === 'HIGH' && 'badge-fx-gold',
        className,
      )}
    >
      <BadgeIcon code={badge.id} fallback={meta.emoji} />
      <span>{meta.name}</span>
      {badge.value && (
        <>
          <span className="text-current/40">·</span>
          <span className="font-mono text-[11px] tabular-nums opacity-90">{badge.value}</span>
        </>
      )}
      <ConfidenceDots level={badge.confidence} className="ml-0.5" />
      {sideLabel && (
        <span className="text-[10px] uppercase tracking-wider opacity-70 border-l border-current/20 pl-1.5 ml-0.5">
          {sideLabel}
        </span>
      )}
    </span>
  );
}
