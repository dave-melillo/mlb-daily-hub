# ⚾ MLB Daily Hub

A mobile-first, auto-refreshing dashboard for daily MLB games, lineups, stats, and betting insights.

## Features

- **Live Game Tracking** - Real-time scores and game status
- **Expandable Lineups** - On-demand batting orders for each game
- **Betting Odds** - Moneyline, spreads, and totals from major sportsbooks
- **Auto-Refresh** - Updates every 60 seconds
- **Mobile-First Design** - Responsive Tailwind CSS interface
- **Aggressive Caching** - Optimized for free tier API limits
- **Responsible Gambling** - NCPG disclaimers and resources

## Tech Stack

- **React 18** + **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **SWR** (data fetching with auto-revalidation)
- **Supabase** (PostgreSQL database for caching and analytics)
- **MLB Stats API** (free, comprehensive)
- **The Odds API** (free tier: 500 req/month)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/mlb-daily-hub.git
cd mlb-daily-hub

# Install dependencies
npm install

# Copy environment variables (optional - odds API)
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase (required for caching)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# The Odds API (optional - for betting odds)
ODDS_API_KEY=your_odds_api_key

# Vercel Cron Secret (required for scheduled data fetching)
CRON_SECRET=your_cron_secret
```

**Supabase Setup:**
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings → API** to get your URL and keys
4. Apply the database schema (see Database Setup below)

**Odds API Setup:**
- Get a free API key from [The Odds API](https://the-odds-api.com/)
- Free tier: 500 requests/month (~16/day)
- Odds are cached in Supabase for 24 hours to stay within limits

## Database Setup

The app uses Supabase (PostgreSQL) to cache betting odds, player stats, and park factors.

### Apply Database Schema

**Option 1: Manual (Recommended)**
1. Open [Supabase SQL Editor](https://supabase.com/dashboard)
2. Go to your project → **SQL Editor** → **New query**
3. Copy the contents of `lib/supabase/schema.sql`
4. Paste and click **Run**

**Option 2: Using psql** (if installed)
```bash
psql postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres < lib/supabase/schema.sql
```

### Verify Setup

Run the connection test:

```bash
npx tsx lib/supabase/test-connection.ts
```

Expected output:
```
✅ Read access OK (0 rows in odds_snapshots)
✅ Write access OK
✅ Test data cleaned up
✅ Table 'odds_snapshots' exists and is accessible
✅ Table 'bvp_cache' exists and is accessible
✅ Table 'park_factors' exists and is accessible
```

### Database Tables

| Table | Purpose | Retention |
|-------|---------|-----------|
| `odds_snapshots` | 24-hour betting line movement tracking | 7 days (auto-cleanup) |
| `bvp_cache` | Batter vs Pitcher matchup stats | 7 days (manual refresh) |
| `park_factors` | Stadium HR/run factors by season | Updated monthly |

## API Routes

- `GET /api/mlb/schedule?date=YYYY-MM-DD` - Fetch games for a specific date
- `GET /api/mlb/lineups?gamePk=12345` - Fetch lineups for a specific game
- `GET /api/odds` - Fetch betting odds for today's MLB games (cached in Supabase)
- `GET /api/cron/fetch-odds` - Vercel Cron job (runs every 6 hours)
- `GET /api/cron/scrape-parks` - Vercel Cron job (runs monthly)

## Caching Strategy

| Data Source | Cache Location | Cache Duration | Rationale |
|-------------|----------------|----------------|-----------|
| MLB Schedule | SWR (client) | 5 minutes | Games update frequently during live play |
| Lineups | SWR (client) | 10 minutes | Lineups change infrequently once set |
| Betting Odds | Supabase DB | 6 hours (refreshed via cron) | Free tier limit (500 req/month) |
| BvP Stats | Supabase DB | 7 days | Expensive to compute, rarely changes |
| Park Factors | Supabase DB | 30 days | Static per season |

## Deployment

Deploy to [Vercel](https://vercel.com) with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mlb-daily-hub)

Or manually:

```bash
npm run build
npm run start
```

## Responsible Gambling

This app displays betting odds for informational purposes only. It includes:
- NCPG (National Council on Problem Gambling) disclaimers
- 1-800-GAMBLER hotline
- Link to [ncpgambling.org](https://www.ncpgambling.org)

## Data Sources

- **MLB Stats API** - Official MLB data (free, no key required)
- **The Odds API** - Betting odds from major sportsbooks (free tier available)

## License

MIT

## Contributing

Pull requests welcome! Please open an issue first to discuss proposed changes.

## Roadmap

- [ ] Player stats integration
- [ ] Weather conditions
- [ ] Historical matchup data
- [ ] Push notifications for game starts
- [ ] Custom team watchlists
