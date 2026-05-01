import {
  Zap,
  Flame,
  Moon,
  TrendingUp,
  Target,
  Wind,
  Home,
  Plane,
  Mountain,
  Coins,
  ArrowUp,
  Snowflake,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeId } from '@/types';

// Map MLB badge codes to Lucide icons. Codes without an entry fall
// back to the emoji from BADGE_META (handled by the caller).
const ICONS: Partial<Record<BadgeId, LucideIcon>> = {
  ACE_EDGE: Zap,
  STRIKEOUT_SPEC: Flame,
  ELITE_ARM: Trophy,
  BULLPEN_BURNOUT: Moon,
  HOT_BATS: TrendingUp,
  SPLITS_MISMATCH: Target,
  POWER_PARK: Wind,
  HOME_COOKIN: Home,
  TRAVEL_SPOT: Plane,
  HEAVY_CHALK: Mountain,
  PLUS_MONEY_DOG: Coins,
  OVER_VALUE: ArrowUp,
  UNDER_VALUE: Snowflake,
};

export function BadgeIcon({
  code,
  fallback,
  className = 'size-3.5',
}: {
  code: BadgeId;
  fallback: string;
  className?: string;
}) {
  const Icon = ICONS[code];
  if (Icon) return <Icon className={className} strokeWidth={2.25} />;
  return <span className="text-sm leading-none">{fallback}</span>;
}
