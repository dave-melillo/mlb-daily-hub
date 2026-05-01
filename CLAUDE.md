# CLAUDE.md — MLB Daily Hub

A Next.js 16 + React 19 + Tailwind v4 daily slate for MLB betting badges.
Part of Badger.

---

## Stack

- Next.js 16 (Turbopack), React 19, TypeScript
- Tailwind v4 (CSS-first theme — see `src/app/globals.css`)
- npm
- Upstash Redis for envelope caching
- The Odds API (paid plan, key in Vercel env)
- Open-Meteo (free) for venue wind
- MLB Stats API (free, unlimited)

---

## Why this app is different from FIGHT/TRAX

**No hand-curated data.** Everything refreshes automatically:

```
                ┌─ MLB Stats API (free)  → schedule, pitchers, team form, hitting splits
   /api/refresh ┼─ Open-Meteo            → game-time wind for outdoor parks
                └─ The Odds API          → moneyline / spread / total per game
                       │
                       ▼
              evaluateAllBadges(game)
                       │
                       ▼
                Upstash KV  ─────────►  /api/games  ─────────►  Browser SWR (60s)
```

Adding new events = nothing. New games appear in the slate as soon as
MLB schedules them.

---

## Refresh pipeline

`src/lib/refresh.ts` runs the full ingest:
1. Fetch schedule with probable starters
2. For each starter: season ERA / WHIP / K/9 / IP
3. For each team: standings record + season hitting OPS + LHP/RHP splits
4. Yesterday's schedule (for travel-spot heuristic)
5. The Odds API for the slate (cached in KV for 10 min — see `src/lib/odds.ts`)
6. Open-Meteo wind for each outdoor venue
7. `evaluateAllBadges()` per game
8. `setEnvelope()` writes the result to Upstash

`src/lib/badges.ts` contains the 14 system evaluators as pure functions.

### Refresh cadence

Two pingers, one endpoint:

| Source | Cadence | Purpose |
|---|---|---|
| Mac mini launchd (`~/badger/refresh.sh`) | every 60s | Heartbeat — keeps live game state fresh during games |
| Vercel cron (`vercel.json`) | every 5 min | Fallback if mini's offline |

Both call `POST /api/refresh` with `Authorization: Bearer ${CRON_SECRET}`.

---

## Adding a new badge system

Five touch-points (~15 min):

1. **Type union** — add to `BadgeId` in `src/types/index.ts`
2. **Metadata** — emoji + name + short + description in `BADGE_META` (top of `src/lib/badges.ts`)
3. **Evaluator function** — `function evaluateXxx(g: EnrichedGame): BadgeResult` in `badges.ts`
4. **Wire it in** — add to the array in `evaluateAllBadges()`
5. **Recommendation** — one-liner in `RECS` in `src/app/api/badges/route.ts` (used by BadgeLab)

Optional: add to the `SystemBadgeShowcase` MLB list on the badger-site landing.

If the evaluator needs new data, plumb it through:
- New API call → `src/lib/mlb.ts`
- Result wired into `EnrichedGame` (`src/types/index.ts`)
- Populated in `runRefresh()` (`src/lib/refresh.ts`)

---

## Environment variables

| Var | Source | Purpose |
|---|---|---|
| `KV_REST_API_URL` | Upstash | Redis cache |
| `KV_REST_API_TOKEN` | Upstash | Redis auth |
| `ODDS_API_KEY` | the-odds-api.com | Live odds |
| `CRON_SECRET` | random 48-byte hex | Auth for /api/refresh from mini + Vercel cron |

All set in Vercel project env. Pull locally with `vercel env pull` if needed.

---

## Common pitfalls

- **Don't `cache: 'no-store'` everywhere** — `runRefresh` hits ~70 APIs per refresh. Lean on Next's fetch cache + KV.
- **Odds API counts each market** as a separate request (`h2h`, `spreads`, `totals` = 3 requests per fetch). KV caches the result for 10 min so the per-minute mini doesn't burn the 20K/mo budget.
- **MLB Stats API uses different endpoints for different stats** — see `lib/mlb.ts`. The standings endpoint is the right call for team records (the team detail endpoint returns empty hydrate envelopes).
- **Probable pitchers post late** — early-morning refreshes may show TBA for both starters. Pitcher-based badges won't fire until lineups confirm (~3 hr before first pitch).

---

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run test` — Jest

No data validator (no hand-curated data to validate). The pipeline itself is the contract.

---

## Useful curls

```bash
# Today's enriched envelope
curl -s https://mlb.badger-sports.com/api/games | jq

# All triggered badges as BadgeLab rows
curl -s https://mlb.badger-sports.com/api/badges | jq '.rows | length'

# Manual refresh trigger (need CRON_SECRET)
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://mlb.badger-sports.com/api/refresh
```

On the Mac mini: `tail -f ~/badger/refresh.log` shows the heartbeat.
