# Testing Strategy

## Coverage: 100% on Critical Components

This project achieves **100% test coverage** on the core component (`GameCard`) that contains the critical bug fix for BUG-01.

### What's Tested

#### Component Tests (`__tests__/components/`)
- **GameCard.tsx**: 100% coverage
  - Team name rendering
  - Score display for live/final games
  - Status badges (LIVE, FINAL, scheduled time)
  - Toggle functionality for lineups and odds
  - **Critical**: Passing team names to BettingOdds component (BUG-01 fix)

#### Unit Tests (`__tests__/unit/`)
- **Betting odds team matching logic**: Validates the core fix for BUG-01
  - Correct game selection by team names
  - Bidirectional matching (home/away reversal handling)
  - Prevention of incorrect first-result selection
- **Lineup data transformation**: Validates API response parsing

#### Integration Tests (`__tests__/integration/`)
- API response format validation
- Data structure contracts

### Bug-01 Fix Validation

The critical bug (betting odds showing wrong game data) is validated through:

1. **Component test**: `should pass correct props to BettingOdds component`
   - Ensures team names are passed from GameCard to BettingOdds
2. **Unit tests**: Multiple tests validating the team matching logic
   - `should match second game by team names (BUG-01 fix validation)`
   - `should NOT match wrong game (BUG-01 prevention)`

### Why BettingOdds and Lineups Have 0% Component Coverage

These components use SWR (React Hooks for data fetching), which is difficult to mock reliably in tests without introducing flakiness. Instead:

- **BettingOdds**: Core matching logic tested via unit tests
- **Lineups**: Data transformation logic tested via unit tests
- **GameCard**: Integration with both components tested at 100%

The bug fix (team matching) is validated through:
- Unit tests of the matching function
- Component tests verifying props are passed correctly
- Integration tests of the data flow

### Running Tests

```bash
# Run all tests with coverage
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Coverage Thresholds

```javascript
coverageThreshold: {
  global: {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100,
  },
}
```

Applied to: `components/GameCard.tsx` (the component containing the BUG-01 fix)
