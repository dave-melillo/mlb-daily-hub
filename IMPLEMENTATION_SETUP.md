# MLB Daily Hub - Implementation Setup Complete

**Date:** 2026-03-25  
**Status:** ✅ Q1 (Supabase) + Q2 (Vercel Cron) RESOLVED

---

## ✅ Supabase Setup (Q1)

### Credentials
- **Project URL:** https://jnaheqpnidqhyarpymbs.supabase.co
- **Anon Key:** `sb_publishable_rgA_zW_79zFdKEWZ3fM7UQ_qdmCj8J9`
- **Password:** `HakeemNicks88!`

### Database Schema
**Location:** `/tmp/mlb-daily-hub-schema.sql`

**Manual Setup Required:**
1. Go to: https://jnaheqpnidqhyarpymbs.supabase.co/project/default/sql
2. Copy contents of `/tmp/mlb-daily-hub-schema.sql`
3. Paste into SQL Editor
4. Click **RUN**

**Tables Created:**
- `odds_snapshots` (line movement tracking)
- `bvp_cache` (batter vs pitcher stats)
- `park_factors` (stadium HR/run factors)

**Indexes:**
- `idx_odds_game_id`, `idx_odds_snapshot_time`, `idx_odds_game_sportsbook`
- `idx_bvp_batter_pitcher`
- `idx_park_stadium_year`

**Features:**
- Auto-cleanup function (deletes odds older than 7 days)
- Row Level Security (public read, service role write)
- Unique constraints (prevent duplicate BvP/park factor entries)

---

## ✅ Vercel Cron Setup (Q2)

### Configuration
**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-odds",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/scrape-parks",
      "schedule": "0 4 1 * *"
    }
  ]
}
```

**Schedules:**
- **Daily Odds Fetch:** 3:00 AM ET (every day)
- **Park Factors Scraper:** 4:00 AM ET (1st of each month)

### API Routes Created
**Stub endpoints (full logic in PRs 2-3):**
- `app/api/cron/fetch-odds/route.ts`
- `app/api/cron/scrape-parks/route.ts`

**Security:** Both routes verify `CRON_SECRET` header (production only)

---

## Environment Variables

### Added to `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
BALLDONTLIE_API_KEY=
```

### Vercel Environment Variables (Required for Production):
1. Go to: https://vercel.com/dave-melillo/mlb-daily-hub/settings/environment-variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jnaheqpnidqhyarpymbs.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_rgA_zW_79zFdKEWZ3fM7UQ_qdmCj8J9`
   - `SUPABASE_SERVICE_ROLE_KEY` = (get from Supabase dashboard)
   - `CRON_SECRET` = (generate random string, e.g., `openssl rand -hex 32`)
   - `ODDS_API_KEY` = (existing, already set)

---

## Next Steps (Implementation)

### PR 1: Supabase Schema Setup (Wolverine)
- Install `@supabase/supabase-js` package
- Create Supabase client (`lib/supabase/client.ts`)
- Write schema migration (manual SQL execution documented above)
- Test connection (read/write to `odds_snapshots` table)

### PR 2: Daily Odds Cron (Wolverine)
- Implement `app/api/cron/fetch-odds/route.ts` full logic
- Fetch tomorrow's games from MLB Stats API
- Fetch historical odds from The Odds API
- Store snapshots in Supabase
- Handle rate limits (500 req/month)
- Retry logic (3 attempts, exponential backoff)

### PR 3: Monthly Park Scraper (Wolverine)
- Implement `app/api/cron/scrape-parks/route.ts` full logic
- Scrape Baseball Savant HTML (Cheerio)
- Parse park factors table
- Upsert to Supabase
- Email alert on failure (HTML structure change)

### PR 4: Line Movement Chart Component (Wolverine)
- Recharts line chart
- Fetch data via `/api/odds?game_id=X`
- Sportsbook toggle (DK, FD, MGM, Caesars)
- Sharp move badge (⚡)
- Responsive (mobile/desktop)

### PR 5: BvP Matchup Display (Wolverine)
- Fetch BALLDONTLIE API via `/api/bvp`
- Display BvP stats
- Advantage categorization (🔥 Strong / ✓ Moderate / - Weak)
- Expandable sections (top 3 hitters on mobile)

### PR 6: Park Factors Display (Wolverine)
- Fetch from Supabase via `/api/parks`
- Display HR/run factors
- Hitter-Friendly / Pitcher-Friendly / Neutral labels
- Park-adjusted over/under calculation

### PR 7: Sportsbook Toggle + Preference Persistence (Wolverine)
- Sportsbook button group
- Update odds on click
- Save preference to LocalStorage
- Auto-load on return visit

### PR 8: Final Integration + E2E Tests (Wolverine)
- Integrate all features on game detail page
- Responsible gambling disclaimer (footer)
- E2E tests (Playwright)
- Performance audit (< 2s load time on 4G)

---

## Revised Timeline (AI Coding Agent Speed)

**Original PRD estimate:** 4 weeks ❌ (human coding assumption)

**Corrected estimate:**
- **Aggressive (same-day reviews):** 1-2 days
- **Realistic (next-day reviews):** 3-5 days
- **Conservative (async reviews):** 5-7 days

**Critical Path:** PR 1 → PR 2 → PR 4 → PR 7 → PR 8 (5 serial PRs)

**Parallelizable:** PR 3, PR 5, PR 6 (can run concurrently after PR 1)

---

## Verification Checklist

### Supabase
- [ ] Schema applied via SQL Editor (3 tables created)
- [ ] Indexes verified (`SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`)
- [ ] RLS policies active (`SELECT * FROM pg_policies`)
- [ ] Service role key added to Vercel env vars

### Vercel Cron
- [ ] `vercel.json` deployed to production
- [ ] Crons visible in Vercel dashboard (Settings → Cron Jobs)
- [ ] Test cron manually: `curl -X GET https://mlb-daily-hub.vercel.app/api/cron/fetch-odds -H "Authorization: Bearer $CRON_SECRET"`
- [ ] Check logs: Vercel Dashboard → Deployments → Functions → Logs

### Environment Variables
- [ ] All 5 variables added to Vercel (production + preview)
- [ ] `.env.local` exists for local development
- [ ] `.env.local` NOT committed to Git (in `.gitignore`)

---

## Ready for Implementation ✅

**Status:** Q1 (Supabase) + Q2 (Vercel Cron) resolved. PRD card updated. Wolverine can begin PR 1.

**Estimated Completion:** 1-7 days (depending on review cadence)
