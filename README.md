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

### Environment Variables (Optional)

To enable betting odds, get a free API key from [The Odds API](https://the-odds-api.com/):

```bash
ODDS_API_KEY=your_api_key_here
```

**Note:** Free tier is limited to 500 requests/month (~16/day). Odds are cached for 1 hour to stay within limits.

## API Routes

- `GET /api/mlb/schedule?date=YYYY-MM-DD` - Fetch games for a specific date
- `GET /api/mlb/lineups?gamePk=12345` - Fetch lineups for a specific game
- `GET /api/odds` - Fetch betting odds for today's MLB games

## Caching Strategy

| API | Cache Duration | Rationale |
|-----|----------------|-----------|
| MLB Schedule | 5 minutes | Games update frequently during live play |
| Lineups | 10 minutes | Lineups change infrequently once set |
| Betting Odds | 1 hour | Free tier limit (500 req/month) |

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
