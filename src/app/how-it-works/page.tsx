import Link from 'next/link';
import { BADGE_META } from '@/lib/badges';
import type { BadgeId } from '@/types';

const PITCHING: BadgeId[] = ['ACE_EDGE', 'STRIKEOUT_SPEC', 'ELITE_ARM', 'BULLPEN_BURNOUT'];
const HITTING: BadgeId[] = ['HOT_BATS', 'SPLITS_MISMATCH'];
const ENVIRONMENT: BadgeId[] = ['POWER_PARK', 'OVER_VALUE', 'UNDER_VALUE', 'HOME_COOKIN', 'TRAVEL_SPOT'];
const MARKET: BadgeId[] = ['HEAVY_CHALK', 'PLUS_MONEY_DOG', 'UNDERDOG_VALUE'];

interface SectionProps {
  title: string;
  ids: BadgeId[];
  blurb: string;
}

function Section({ title, ids, blurb }: SectionProps) {
  return (
    <div className="mb-10">
      <h2 className="font-display tracking-[0.18em] text-2xl text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-5 leading-relaxed">{blurb}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {ids.map((id) => {
          const m = BADGE_META[id];
          return (
            <div
              key={id}
              className="badge-fx rounded-xl border border-border bg-card/60 p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-display tracking-[0.05em] text-lg text-foreground">
                    {m.name.toUpperCase()}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {id}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-primary hover:underline mb-4 inline-block">
        ← Back to slate
      </Link>
      <p className="font-display tracking-[0.22em] text-xs text-primary mb-1">MLB</p>
      <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">How It Works</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        We pull every game on the slate, match it against fourteen analysis systems,
        and light up a badge when a system triggers. The more badges stacked on a
        side, the louder the signal. The gold ones are the strongest.
      </p>

      {/* The Math */}
      <section className="my-12 p-6 rounded-2xl border border-border bg-card/40">
        <h2 className="font-display tracking-[0.18em] text-xl text-primary mb-3">/// THE MATH</h2>
        <p className="text-foreground/85 leading-relaxed">
          We take the schedule from the MLB Stats API, pull season pitching stats
          for each probable starter, season hitting splits for each lineup
          (including vs LHP / vs RHP), the standings (home/road/last-10 records),
          park factors for the 30 venues, current wind from Open-Meteo, and odds
          from The Odds API. That feeds a deterministic engine that returns a
          set of triggered badges per game.
        </p>
        <p className="text-muted-foreground text-sm mt-3">
          Refreshes every 60 seconds during games via a launchd worker on a Mac
          mini, with a Vercel cron fallback every 5 minutes. Results cache in
          Upstash Redis so the page loads in under 100 ms.
        </p>
      </section>

      <Section
        title="PITCHING"
        ids={PITCHING}
        blurb="Run prevention is the single biggest predictor of a baseball outcome. These four reward starters who are demonstrably better than their counterpart, or whose bullpen has the rest advantage."
      />
      <Section
        title="HITTING"
        ids={HITTING}
        blurb="Lineup form and platoon advantage. We use season OPS as a proxy for 'hot' and the team's vs-LHP / vs-RHP splits to spot the platoon edge against the opposing starter."
      />
      <Section
        title="ENVIRONMENT"
        ids={ENVIRONMENT}
        blurb="Where the game is played and who flew in for it. Park factor + wind direction explains a huge chunk of total runs, and travel/late-game fatigue shows up most in early-window games."
      />
      <Section
        title="MARKET"
        ids={MARKET}
        blurb="What the line is doing. Heavy chalks suggest runline value; plus-money dogs with a real arm are mispriced; and when the underdog stacks 3+ system badges, the line itself is the signal."
      />

      {/* Confidence levels */}
      <section className="my-12 p-6 rounded-2xl border border-border bg-card/40">
        <h2 className="font-display tracking-[0.18em] text-xl text-primary mb-3">/// CONFIDENCE LEVELS</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { tier: 'HIGH', desc: 'Clean, high-confidence trigger. The badge gets a gold glow on hover.', styles: 'bg-primary/15 text-primary border-primary/40' },
            { tier: 'MEDIUM', desc: 'Trigger met, signal present, edge moderate.', styles: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
            { tier: 'LOW', desc: 'Threshold barely cleared. Use as supporting context only.', styles: 'bg-muted text-muted-foreground border-border' },
          ].map((b) => (
            <div key={b.tier} className={`rounded-xl border ${b.styles} p-4`}>
              <div className="font-display tracking-[0.18em] text-base mb-2">{b.tier}</div>
              <p className="text-sm leading-relaxed opacity-85">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reading the card */}
      <section className="my-12 p-6 rounded-2xl border border-border bg-card/40">
        <h2 className="font-display tracking-[0.18em] text-xl text-primary mb-3">/// HOW TO READ THE SLATE</h2>
        <ul className="space-y-3 text-foreground/85">
          <li className="flex gap-3">
            <span className="font-display tracking-[0.18em] text-primary shrink-0">01.</span>
            <span>Open <Link href="/" className="text-primary underline">today&apos;s slate</Link>. Each game shows pitcher matchup, line, and any triggered badges.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-display tracking-[0.18em] text-primary shrink-0">02.</span>
            <span>Scan for games with 3+ badges stacking on one side — that&apos;s where the math is loudest.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-display tracking-[0.18em] text-primary shrink-0">03.</span>
            <span>Hover any badge for the full reason (numerical context). Click <em>Show details</em> on a card for park, pitchers, lines, and per-badge explanations.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-display tracking-[0.18em] text-primary shrink-0">04.</span>
            <span>For entertainment only. Badges are signal, not certainty.</span>
          </li>
        </ul>
      </section>

      <p className="text-center text-xs text-muted-foreground py-6">
        For entertainment purposes only.
      </p>
    </main>
  );
}
