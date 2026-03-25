-- MLB Daily Hub - Supabase Database Schema
-- Project: jnaheqpnidqhyarpymbs.supabase.co
-- Created: 2026-03-25

-- Table: odds_snapshots
-- Stores historical betting odds (24-hour snapshots for line movement tracking)
CREATE TABLE IF NOT EXISTS odds_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id VARCHAR(50) NOT NULL,
  sportsbook VARCHAR(50) NOT NULL,
  snapshot_time TIMESTAMPTZ NOT NULL,
  moneyline_home INTEGER NOT NULL,
  moneyline_away INTEGER NOT NULL,
  spread_home DECIMAL(3,1) NOT NULL,
  spread_odds_home INTEGER NOT NULL,
  total DECIMAL(3,1) NOT NULL,
  total_over_odds INTEGER NOT NULL,
  total_under_odds INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_odds_game_id ON odds_snapshots(game_id);
CREATE INDEX idx_odds_snapshot_time ON odds_snapshots(snapshot_time);
CREATE INDEX idx_odds_game_sportsbook ON odds_snapshots(game_id, sportsbook);

-- Table: bvp_cache
-- Stores Batter vs Pitcher matchup stats (7-day cache)
CREATE TABLE IF NOT EXISTS bvp_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batter_id VARCHAR(50) NOT NULL,
  pitcher_id VARCHAR(50) NOT NULL,
  at_bats INTEGER NOT NULL,
  hits INTEGER NOT NULL,
  home_runs INTEGER NOT NULL,
  avg DECIMAL(4,3) NOT NULL,
  ops DECIMAL(4,3) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(batter_id, pitcher_id)  -- Prevent duplicate entries
);

-- Index for fast lookups
CREATE INDEX idx_bvp_batter_pitcher ON bvp_cache(batter_id, pitcher_id);

-- Table: park_factors
-- Stores stadium HR/run factors (updated monthly)
CREATE TABLE IF NOT EXISTS park_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stadium_name VARCHAR(100) NOT NULL,
  mlb_team VARCHAR(10) NOT NULL,
  year INTEGER NOT NULL,
  hr_factor DECIMAL(5,1) NOT NULL,
  run_factor DECIMAL(5,1) NOT NULL,
  hr_left DECIMAL(5,1),
  hr_right DECIMAL(5,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stadium_name, year)  -- Prevent duplicate seasons
);

-- Index for fast lookups
CREATE INDEX idx_park_stadium_year ON park_factors(stadium_name, year);

-- Auto-cleanup function: Delete odds snapshots older than 7 days
CREATE OR REPLACE FUNCTION cleanup_old_odds_snapshots()
RETURNS void AS $$
BEGIN
  DELETE FROM odds_snapshots 
  WHERE snapshot_time < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Set up Row Level Security (RLS) for public read access
ALTER TABLE odds_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bvp_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE park_factors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous reads (for Next.js app)
CREATE POLICY "Allow public read access" ON odds_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON bvp_cache FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON park_factors FOR SELECT USING (true);

-- Policy: Restrict writes to service role only (backend API routes)
CREATE POLICY "Service role only for writes" ON odds_snapshots FOR INSERT USING (auth.role() = 'service_role');
CREATE POLICY "Service role only for writes" ON bvp_cache FOR INSERT USING (auth.role() = 'service_role');
CREATE POLICY "Service role only for writes" ON park_factors FOR INSERT USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON odds_snapshots TO anon, authenticated;
GRANT SELECT ON bvp_cache TO anon, authenticated;
GRANT SELECT ON park_factors TO anon, authenticated;

-- Verification queries (run after schema creation)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
