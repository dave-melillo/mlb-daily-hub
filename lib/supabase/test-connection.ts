import { supabase, supabaseAdmin } from './client';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  // Test 1: Read access (anon key)
  console.log('Test 1: Read access (anon key)');
  const { count: oddsCount, error: oddsError } = await supabase
    .from('odds_snapshots')
    .select('*', { count: 'exact', head: true });

  if (oddsError) {
    console.error('❌ Read test failed:', oddsError.message);
    if (oddsError.message.includes('relation') || oddsError.message.includes('does not exist')) {
      console.log('⚠️  Tables not created yet. Run schema manually first.');
    }
  } else {
    console.log(`✅ Read access OK (${oddsCount ?? 0} rows in odds_snapshots)`);
  }

  // Test 2: Write access (service role)
  console.log('\nTest 2: Write access (service role)');
  const testData = {
    game_id: 'test-' + Date.now(),
    sportsbook: 'draftkings',
    snapshot_time: new Date().toISOString(),
    moneyline_home: -110,
    moneyline_away: 100,
    spread_home: -1.5,
    spread_odds_home: -110,
    total: 8.5,
    total_over_odds: -110,
    total_under_odds: -110,
  };

  const { error: writeError } = await supabaseAdmin
    .from('odds_snapshots')
    .insert(testData);

  if (writeError) {
    console.error('❌ Write test failed:', writeError.message);
  } else {
    console.log('✅ Write access OK');
    // Clean up test data
    await supabaseAdmin
      .from('odds_snapshots')
      .delete()
      .eq('game_id', testData.game_id);
    console.log('✅ Test data cleaned up');
  }

  // Test 3: Check all tables exist
  console.log('\nTest 3: Verify tables');
  const tables = ['odds_snapshots', 'bvp_cache', 'park_factors'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.error(`❌ Table '${table}' not accessible:`, error.message);
    } else {
      console.log(`✅ Table '${table}' exists and is accessible`);
    }
  }

  console.log('\n✅ Connection tests complete');
}

testConnection().catch(console.error);
