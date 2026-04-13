# ✅ MLB Daily Hub - Setup 95% Complete

**Date:** 2026-03-25 16:58 EDT  
**Status:** Autonomous setup complete. One manual step remaining.

---

## ✅ What Beast Completed Automatically:

### 1. Vercel Environment Variables (5/5) ✅
All environment variables added to Vercel production + preview:

| Variable | Status | Environment |
|----------|--------|-------------|
| `ODDS_API_KEY` | ✅ Already existed | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Auto-added | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Auto-added | Production + Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Auto-added | Production |
| `CRON_SECRET` | ✅ Auto-generated | Production |

**Verify:** https://vercel.com/dave-melillo/mlb-daily-hub/settings/environment-variables

### 2. Local Development Environment ✅
Created `.env.local` with all credentials for local testing.

### 3. Database Schema Prepared ✅
SQL schema ready at: `/tmp/mlb-daily-hub-schema.sql`

**Tables:**
- `odds_snapshots` (line movement tracking)
- `bvp_cache` (batter vs pitcher stats)
- `park_factors` (stadium HR/run factors)

---

## ⚠️ One Manual Step Remaining:

**Apply SQL Schema to Supabase (5 minutes)**

### Option A: Web UI (Easiest)
1. Go to: https://supabase.com/dashboard/project/jnaheqpnidqhyarpymbs/sql-editor
2. Click **"New query"**
3. Copy entire contents of `/tmp/mlb-daily-hub-schema.sql`
4. Paste into editor
5. Click **"RUN"** (or press Cmd+Enter)
6. Verify success: Should see "Success. No rows returned"

### Option B: Command Line (If psql installed)
```bash
PGPASSWORD='HakeemNicks88!' psql \
  "postgresql://postgres:HakeemNicks88!@db.jnaheqpnidqhyarpymbs.supabase.co:5432/postgres" \
  -f /tmp/mlb-daily-hub-schema.sql
```

### Option C: Let Wolverine Do It (PR #1)
The schema SQL is already in the repo. Wolverine can apply it as part of PR #1.

---

## 🚀 What Happens Next:

### Immediate (After SQL Applied):
1. ✅ Q1 (Supabase) fully resolved
2. ✅ Q2 (Vercel Cron) fully resolved  
3. ✅ Ready for Wolverine to start PR #1

### PR Implementation (Wolverine):

**PR 1: Supabase Setup** (1-2 hours)
- Install `@supabase/supabase-js`
- Create client library (`lib/supabase/client.ts`)
- Apply schema (if not already done manually)
- Test connection

**PR 2: Daily Odds Cron** (1-2 hours)
- Implement `/api/cron/fetch-odds` full logic
- Handle The Odds API rate limits
- Store snapshots in Supabase

**PR 3: Monthly Park Scraper** (1-2 hours)
- Implement `/api/cron/scrape-parks` full logic
- Scrape Baseball Savant HTML
- Upsert to Supabase

**PRs 4-8: UI Components** (6-10 hours)
- Line movement chart
- BvP matchup display
- Park factors card
- Sportsbook toggle
- Final integration + tests

**Total Calendar Time:** 1-7 days (10-16 hours AI coding, depends on review speed)

---

## 🎯 Autonomy Achieved:

**Before (Manual):**
- ❌ Beast writes PRD → **You** apply SQL schema → **You** add env vars → Wolverine codes → **You** review

**Now (Autonomous):**
- ✅ Beast writes PRD
- ✅ Beast adds Vercel env vars automatically
- ✅ Beast prepares SQL schema (one manual paste OR Wolverine applies in PR #1)
- ✅ Wolverine codes
- ✅ You review only when tests fail or high-risk changes

**Next Project:** Beast will handle Vercel + Supabase setup with zero manual steps (can apply SQL via Wolverine in PR #1).

---

## 📊 Verification Checklist:

### Vercel (Complete) ✅
- [x] All 5 env vars added to production
- [x] `NEXT_PUBLIC_` vars added to preview (for testing)
- [x] `CRON_SECRET` generated securely
- [x] `vercel.json` deployed with cron schedules

### Supabase (1 step remaining) ⚠️
- [ ] **SQL schema applied** (Option A, B, or C above)
- [ ] Verify tables: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
- [ ] Verify indexes: `SELECT indexname FROM pg_indexes WHERE schemaname = 'public';`

### Local Development (Complete) ✅
- [x] `.env.local` exists with all credentials
- [x] `.env.local` NOT committed to Git (in `.gitignore`)

---

## 🔗 Quick Links:

- **GitHub Repo:** https://github.com/dave-melillo/mlb-daily-hub
- **Vercel Dashboard:** https://vercel.com/dave-melillo/mlb-daily-hub
- **Supabase Dashboard:** https://supabase.com/dashboard/project/jnaheqpnidqhyarpymbs
- **Supabase SQL Editor:** https://supabase.com/dashboard/project/jnaheqpnidqhyarpymbs/sql-editor
- **Trello PRD Card:** https://trello.com/c/sHAjxUeD
- **PRD Document:** `/Users/dave/.xforce/projects/idea-20260325-002/artifacts/PRD-IDEA-20260325-002.md`
- **Setup Guide:** `~/clawd/projects/mlb-daily-hub/IMPLEMENTATION_SETUP.md`

---

## 🎉 Ready to Ship!

**Once SQL schema is applied (5 minutes), tag Wolverine:**

```
@wolverine Start PR #1 for PRD-20260325-002 (MLB Daily Hub Supabase setup).
Repo: https://github.com/dave-melillo/mlb-daily-hub
All env vars ready. Schema at /tmp/mlb-daily-hub-schema.sql (apply manually or in PR #1).
```

**Estimated delivery:** 1-7 days (depending on review cadence)

---

**Questions? Check:** `~/clawd/projects/mlb-daily-hub/IMPLEMENTATION_SETUP.md`
