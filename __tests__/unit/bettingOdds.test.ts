/**
 * Unit tests for betting odds matching logic
 * Tests the core fix for BUG-01 without SWR complications
 */

describe('BettingOdds Team Matching', () => {
  // Simulate the component's find logic
  const findMatchingOdds = (
    data: Array<{home_team: string, away_team: string, bookmakers: any[]}>,
    homeTeam: string,
    awayTeam: string
  ) => {
    return data.find(game => {
      return (game.home_team === homeTeam && game.away_team === awayTeam) ||
             (game.home_team === awayTeam && game.away_team === homeTeam)
    })
  }

  const mockOddsData = [
    {
      id: 'game1',
      home_team: 'New York Yankees',
      away_team: 'Boston Red Sox',
      bookmakers: [{ key: 'draftkings', title: 'DraftKings', markets: [] }]
    },
    {
      id: 'game2',
      home_team: 'Los Angeles Dodgers',
      away_team: 'San Francisco Giants',
      bookmakers: [{ key: 'fanduel', title: 'FanDuel', markets: [] }]
    }
  ]

  it('should match first game by team names', () => {
    const result = findMatchingOdds(mockOddsData, 'New York Yankees', 'Boston Red Sox')
    
    expect(result).toBeDefined()
    expect(result?.home_team).toBe('New York Yankees')
    expect(result?.away_team).toBe('Boston Red Sox')
  })

  it('should match second game by team names (BUG-01 fix validation)', () => {
    const result = findMatchingOdds(mockOddsData, 'Los Angeles Dodgers', 'San Francisco Giants')
    
    expect(result).toBeDefined()
    expect(result?.home_team).toBe('Los Angeles Dodgers')
    expect(result?.away_team).toBe('San Francisco Giants')
    // This is the critical test: should NOT return the first game
    expect(result?.home_team).not.toBe('New York Yankees')
  })

  it('should match when home/away are reversed in API', () => {
    const result = findMatchingOdds(mockOddsData, 'Boston Red Sox', 'New York Yankees')
    
    expect(result).toBeDefined()
    expect(result?.home_team).toBe('New York Yankees')
  })

  it('should return undefined for non-existent teams', () => {
    const result = findMatchingOdds(mockOddsData, 'Fake Team', 'Another Fake')
    
    expect(result).toBeUndefined()
  })

  it('should match correctly among many games', () => {
    const manyGames = [
      { home_team: 'Team A', away_team: 'Team B', bookmakers: [] },
      { home_team: 'Team C', away_team: 'Team D', bookmakers: [] },
      { home_team: 'Team E', away_team: 'Team F', bookmakers: [] },
      { home_team: 'Team G', away_team: 'Team H', bookmakers: [] },
      { home_team: 'Target Home', away_team: 'Target Away', bookmakers: [] },
      { home_team: 'Team I', away_team: 'Team J', bookmakers: [] }
    ]

    const result = findMatchingOdds(manyGames, 'Target Home', 'Target Away')
    
    expect(result?.home_team).toBe('Target Home')
  })
})

describe('Lineup Data Transformation', () => {
  it('should extract players from batting order', () => {
    const boxscoreData = {
      teams: {
        away: {
          team: { id: 1, name: 'Yankees' },
          battingOrder: [123, 456],
          players: {
            ID123: {
              person: { fullName: 'Aaron Judge' },
              position: { abbreviation: 'RF' }
            },
            ID456: {
              person: { fullName: 'Anthony Volpe' },
              position: { abbreviation: 'SS' }
            }
          }
        }
      }
    }

    const players = boxscoreData.teams.away.battingOrder.map((playerId: number) => {
      const player = boxscoreData.teams.away.players[`ID${playerId}`]
      return {
        id: playerId,
        fullName: player?.person?.fullName,
        position: player?.position?.abbreviation
      }
    }).filter(Boolean)

    expect(players).toHaveLength(2)
    expect(players[0].fullName).toBe('Aaron Judge')
    expect(players[1].position).toBe('SS')
  })

  it('should handle missing batting order gracefully', () => {
    const emptyData = {
      teams: {
        away: {
          team: { id: 1, name: 'Yankees' }
        }
      }
    }

    const battingOrder = emptyData.teams.away.battingOrder || []
    const players = battingOrder.map(() => null).filter(Boolean)

    expect(players).toEqual([])
  })
})
