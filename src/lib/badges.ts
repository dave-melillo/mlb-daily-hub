import type {
  BadgeId,
  BadgeMeta,
  BadgeResult,
  EnrichedGame,
  PitcherStats,
} from '@/types';

export const BADGE_META: Record<BadgeId, BadgeMeta> = {
  ACE_EDGE: {
    id: 'ACE_EDGE',
    emoji: '⚡',
    name: 'Ace Edge',
    short: 'Pitching mismatch',
    description:
      "Starting pitcher's season ERA is 1.0+ runs better than the opponent's (50+ IP min). The team with the ace has the run-prevention edge.",
  },
  STRIKEOUT_SPEC: {
    id: 'STRIKEOUT_SPEC',
    emoji: '🔥',
    name: 'Strikeout Specialist',
    short: 'K/9 ≥ 10',
    description:
      "Starter strikes out at least 10 batters per 9 innings. Suppresses contact, limits BABIP variance, and boosts strikeout-prop equity.",
  },
  BULLPEN_BURNOUT: {
    id: 'BULLPEN_BURNOUT',
    emoji: '😴',
    name: 'Bullpen Burnout',
    short: 'Tired arms',
    description:
      "Opposing bullpen has thrown 12+ innings in the last 3 days. Late-game arms are gassed, tipping leverage to the other side.",
  },
  HOT_BATS: {
    id: 'HOT_BATS',
    emoji: '💪',
    name: 'Hot Bats',
    short: '.800+ OPS L10',
    description:
      'Team OPS over the last 10 games is .800 or better. Lineup is locked in and run output is trending up.',
  },
  SPLITS_MISMATCH: {
    id: 'SPLITS_MISMATCH',
    emoji: '🎯',
    name: 'Splits Mismatch',
    short: 'Lineup vs hand',
    description:
      "Lineup's OPS against the starter's pitching hand is 80+ points better than against the other hand. The platoon advantage is real.",
  },
  POWER_PARK: {
    id: 'POWER_PARK',
    emoji: '🏟️',
    name: 'Power Park',
    short: 'Wind out + hitter park',
    description:
      'Hitter-friendly venue (park factor 105+) with wind blowing out 8+ mph. Carry-the-ball weather lights up totals.',
  },
  HOME_COOKIN: {
    id: 'HOME_COOKIN',
    emoji: '🏠',
    name: "Home Cookin'",
    short: 'Home/road gap',
    description:
      'Home team wins 60%+ at home, road team wins under 45% on the road. The split between the two is significant.',
  },
  TRAVEL_SPOT: {
    id: 'TRAVEL_SPOT',
    emoji: '✈️',
    name: 'Travel Spot',
    short: 'Jet-lag fade',
    description:
      'Team played a 9pm+ ET game last night and traveled 2+ time zones for an early start today. Bodies are still on yesterday.',
  },
  UNDERDOG_VALUE: {
    id: 'UNDERDOG_VALUE',
    emoji: '💰',
    name: 'Underdog Value',
    short: 'Mispriced dog',
    description:
      "Underdog has 3+ system badges in their favor — the line may be mispriced relative to where the math actually points.",
  },
};

const NEUTRAL: BadgeResult = {
  id: 'ACE_EDGE',
  triggered: false,
  confidence: 'LOW',
  reason: '',
};

function decorate(id: BadgeId, partial: Omit<BadgeResult, 'id'>): BadgeResult {
  return { id, ...partial };
}

// ------------------------------------------------------------
// Per-system evaluators — pure functions over EnrichedGame
// ------------------------------------------------------------

function evaluateAceEdge(g: EnrichedGame): BadgeResult {
  const h = g.home.pitcher;
  const a = g.away.pitcher;
  if (!h?.era || !a?.era || h.ip < 30 || a.ip < 30) {
    return decorate('ACE_EDGE', { triggered: false, confidence: 'LOW', reason: 'Insufficient IP' });
  }
  const diff = a.era - h.era;
  const absDiff = Math.abs(diff);
  if (absDiff < 0.85) {
    return decorate('ACE_EDGE', { triggered: false, confidence: 'LOW', reason: 'ERA gap too small' });
  }
  const side: 'home' | 'away' = diff > 0 ? 'home' : 'away';
  const better = side === 'home' ? h : a;
  const worse = side === 'home' ? a : h;
  const confidence = absDiff >= 1.75 ? 'HIGH' : absDiff >= 1.25 ? 'MEDIUM' : 'LOW';
  return decorate('ACE_EDGE', {
    triggered: true,
    side,
    confidence,
    reason: `${better.name} (${better.era?.toFixed(2)} ERA) vs ${worse.name} (${worse.era?.toFixed(2)})`,
  });
}

function evaluateStrikeoutSpec(g: EnrichedGame): BadgeResult {
  const h = g.home.pitcher;
  const a = g.away.pitcher;
  const high = (p?: PitcherStats) => p && p.k9 != null && p.k9 >= 10.0 ? p : null;
  const homeAce = high(h);
  const awayAce = high(a);
  if (!homeAce && !awayAce) {
    return decorate('STRIKEOUT_SPEC', { triggered: false, confidence: 'LOW', reason: 'No 10+ K/9 starter' });
  }
  // If both, favor the higher K/9.
  const winner = (homeAce && awayAce)
    ? (homeAce.k9! >= awayAce.k9! ? homeAce : awayAce)
    : (homeAce ?? awayAce!);
  const side: 'home' | 'away' = winner === h ? 'home' : 'away';
  const confidence = winner.k9! >= 12 ? 'HIGH' : winner.k9! >= 11 ? 'MEDIUM' : 'LOW';
  return decorate('STRIKEOUT_SPEC', {
    triggered: true,
    side,
    confidence,
    reason: `${winner.name} K/9 ${winner.k9!.toFixed(1)}`,
  });
}

function evaluateBullpenBurnout(g: EnrichedGame): BadgeResult {
  const h = g.home.form?.bullpenIPLast3Days ?? 0;
  const a = g.away.form?.bullpenIPLast3Days ?? 0;
  if (h < 12 && a < 12) {
    return decorate('BULLPEN_BURNOUT', { triggered: false, confidence: 'LOW', reason: 'Both pens fresh' });
  }
  // Burnout disadvantages the team with the tired pen → favors the opposite side.
  const moreTired = h >= a ? 'home' : 'away';
  const benefits: 'home' | 'away' = moreTired === 'home' ? 'away' : 'home';
  const tiredIP = Math.max(h, a);
  const confidence = tiredIP >= 16 ? 'HIGH' : tiredIP >= 13 ? 'MEDIUM' : 'LOW';
  return decorate('BULLPEN_BURNOUT', {
    triggered: true,
    side: benefits,
    confidence,
    reason: `Opposing pen threw ${tiredIP.toFixed(1)} IP last 3 days`,
  });
}

function evaluateHotBats(g: EnrichedGame): BadgeResult {
  // Phase 1: use season OPS (last10OPS reserved for the day we wire game logs).
  const h = g.home.form?.last10OPS;
  const a = g.away.form?.last10OPS;
  const THRESH = 0.770; // top-third of MLB
  const hotHome = h != null && h >= THRESH;
  const hotAway = a != null && a >= THRESH;
  if (!hotHome && !hotAway) {
    return decorate('HOT_BATS', { triggered: false, confidence: 'LOW', reason: 'No hot lineup' });
  }
  const side: 'home' | 'away' = (hotHome && hotAway)
    ? (h! >= a! ? 'home' : 'away')
    : (hotHome ? 'home' : 'away');
  const ops = side === 'home' ? h! : a!;
  const confidence = ops >= 0.85 ? 'HIGH' : ops >= 0.81 ? 'MEDIUM' : 'LOW';
  return decorate('HOT_BATS', {
    triggered: true,
    side,
    confidence,
    reason: `Team OPS ${ops.toFixed(3)}`,
  });
}

function evaluateSplitsMismatch(g: EnrichedGame): BadgeResult {
  // For each side, compare their lineup OPS vs OPPONENT pitcher's hand.
  function mismatchFor(side: 'home' | 'away'): { gap: number; ops: number } | null {
    const lineup = side === 'home' ? g.home.form : g.away.form;
    const opp = side === 'home' ? g.away.pitcher : g.home.pitcher;
    if (!lineup || !opp) return null;
    const vsHand = opp.throws === 'L' ? lineup.vsLHP_OPS : lineup.vsRHP_OPS;
    const vsOther = opp.throws === 'L' ? lineup.vsRHP_OPS : lineup.vsLHP_OPS;
    if (vsHand == null || vsOther == null) return null;
    return { gap: vsHand - vsOther, ops: vsHand };
  }
  const homeMM = mismatchFor('home');
  const awayMM = mismatchFor('away');
  const candidates: Array<{ side: 'home' | 'away'; gap: number; ops: number }> = [];
  if (homeMM && homeMM.gap >= 0.08) candidates.push({ side: 'home', ...homeMM });
  if (awayMM && awayMM.gap >= 0.08) candidates.push({ side: 'away', ...awayMM });
  if (!candidates.length) {
    return decorate('SPLITS_MISMATCH', { triggered: false, confidence: 'LOW', reason: 'No 80+ pt split gap' });
  }
  candidates.sort((x, y) => y.gap - x.gap);
  const winner = candidates[0];
  const confidence = winner.gap >= 0.13 ? 'HIGH' : winner.gap >= 0.1 ? 'MEDIUM' : 'LOW';
  return decorate('SPLITS_MISMATCH', {
    triggered: true,
    side: winner.side,
    confidence,
    reason: `Lineup ${(winner.ops).toFixed(3)} OPS vs hand (+${(winner.gap * 1000).toFixed(0)} pts)`,
  });
}

function evaluatePowerPark(g: EnrichedGame): BadgeResult {
  const v = g.venue;
  if (!v || v.parkFactor < 105) {
    return decorate('POWER_PARK', { triggered: false, confidence: 'LOW', reason: 'Neutral park' });
  }
  if (v.windMph == null || v.windDir !== 'OUT' || v.windMph < 8) {
    return decorate('POWER_PARK', { triggered: false, confidence: 'LOW', reason: 'No carry wind' });
  }
  const confidence = v.windMph >= 15 ? 'HIGH' : v.windMph >= 11 ? 'MEDIUM' : 'LOW';
  return decorate('POWER_PARK', {
    triggered: true,
    confidence,
    reason: `${v.name} (PF ${v.parkFactor}) · wind ${v.windMph} mph OUT`,
  });
}

function evaluateHomeCookin(g: EnrichedGame): BadgeResult {
  const h = g.home.form?.homeWinPct;
  const aR = g.away.form?.roadWinPct;
  if (h == null || aR == null) {
    return decorate('HOME_COOKIN', { triggered: false, confidence: 'LOW', reason: 'Insufficient form data' });
  }
  if (h < 0.6 || aR > 0.45) {
    return decorate('HOME_COOKIN', { triggered: false, confidence: 'LOW', reason: 'Gap not significant' });
  }
  const gap = h - aR;
  const confidence = gap >= 0.25 ? 'HIGH' : gap >= 0.18 ? 'MEDIUM' : 'LOW';
  return decorate('HOME_COOKIN', {
    triggered: true,
    side: 'home',
    confidence,
    reason: `Home ${(h * 100).toFixed(0)}% W%, road team ${(aR * 100).toFixed(0)}% on road`,
  });
}

function evaluateTravelSpot(g: EnrichedGame): BadgeResult {
  // Caller (refresh.ts) sets `lastGameLocalEndTime` only when the team played
  // a 9pm+ ET game last night. If exactly one side did, the badge favors the
  // other side.
  const homeTired = !!g.home.form?.lastGameLocalEndTime;
  const awayTired = !!g.away.form?.lastGameLocalEndTime;
  if (homeTired === awayTired) {
    return decorate('TRAVEL_SPOT', { triggered: false, confidence: 'LOW', reason: 'No travel mismatch' });
  }
  const benefits: 'home' | 'away' = homeTired ? 'away' : 'home';
  return decorate('TRAVEL_SPOT', {
    triggered: true,
    side: benefits,
    confidence: 'MEDIUM',
    reason: 'Opponent on short rest after a late game last night',
  });
}

// ------------------------------------------------------------
// Top-level evaluator
// ------------------------------------------------------------

export function evaluateAllBadges(game: EnrichedGame): BadgeResult[] {
  const evaluators = [
    evaluateAceEdge,
    evaluateStrikeoutSpec,
    evaluateBullpenBurnout,
    evaluateHotBats,
    evaluateSplitsMismatch,
    evaluatePowerPark,
    evaluateHomeCookin,
    evaluateTravelSpot,
  ];
  const results = evaluators.map((fn) => fn(game));

  // UNDERDOG_VALUE depends on the others — runs last.
  results.push(evaluateUnderdogValue(game, results));

  // Only return the triggered ones, sorted by confidence (high first).
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
  return results
    .filter((r) => r.triggered)
    .sort((x, y) => order[x.confidence] - order[y.confidence]);
}

function evaluateUnderdogValue(g: EnrichedGame, prior: BadgeResult[]): BadgeResult {
  if (!g.odds) {
    return decorate('UNDERDOG_VALUE', { triggered: false, confidence: 'LOW', reason: 'No odds posted' });
  }
  const dog: 'home' | 'away' =
    g.odds.homeMoneyline > g.odds.awayMoneyline ? 'home' : 'away';
  const dogBadges = prior.filter((b) => b.triggered && b.side === dog).length;
  if (dogBadges < 3) {
    return decorate('UNDERDOG_VALUE', {
      triggered: false,
      confidence: 'LOW',
      reason: `Underdog has only ${dogBadges} system badge(s)`,
    });
  }
  const confidence = dogBadges >= 5 ? 'HIGH' : dogBadges >= 4 ? 'MEDIUM' : 'LOW';
  const ml = dog === 'home' ? g.odds.homeMoneyline : g.odds.awayMoneyline;
  return decorate('UNDERDOG_VALUE', {
    triggered: true,
    side: dog,
    confidence,
    reason: `Underdog (${ml > 0 ? '+' : ''}${ml}) has ${dogBadges} systems in their favor`,
  });
}
