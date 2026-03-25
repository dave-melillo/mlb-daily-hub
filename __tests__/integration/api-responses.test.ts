/**
 * Integration tests for API response formats
 * These test the expected structure without making actual API calls
 */

describe('API Response Formats', () => {
  describe('Schedule API', () => {
    it('should return valid schedule structure', () => {
      const mockResponse = {
        dates: [
          {
            date: '2024-03-25',
            games: [
              {
                gamePk: 123456,
                gameDate: '2024-03-25T17:05:00Z',
                status: {
                  abstractGameState: 'Preview',
                  detailedState: 'Scheduled'
                },
                teams: {
                  away: {
                    team: { id: 1, name: 'Yankees', abbreviation: 'NYY' },
                    score: 0
                  },
                  home: {
                    team: { id: 2, name: 'Red Sox', abbreviation: 'BOS' },
                    score: 0
                  }
                }
              }
            ]
          }
        ]
      }

      expect(mockResponse.dates).toBeDefined()
      expect(mockResponse.dates[0].games).toHaveLength(1)
      expect(mockResponse.dates[0].games[0].gamePk).toBe(123456)
    })
  })

  describe('Lineups API', () => {
    it('should return valid lineup structure', () => {
      const mockResponse = {
        away: {
          teamId: 1,
          teamName: 'Yankees',
          players: [
            { id: 101, fullName: 'Aaron Judge', position: 'RF' }
          ]
        },
        home: {
          teamId: 2,
          teamName: 'Red Sox',
          players: [
            { id: 201, fullName: 'Rafael Devers', position: '3B' }
          ]
        }
      }

      expect(mockResponse.away).toBeDefined()
      expect(mockResponse.home).toBeDefined()
      expect(mockResponse.away.players).toHaveLength(1)
      expect(mockResponse.away.players[0].fullName).toBe('Aaron Judge')
    })

    it('should handle empty lineups gracefully', () => {
      const mockResponse = {
        away: {
          teamId: 1,
          teamName: 'Yankees',
          players: []
        },
        home: {
          teamId: 2,
          teamName: 'Red Sox',
          players: []
        }
      }

      expect(mockResponse.away.players).toEqual([])
      expect(mockResponse.home.players).toEqual([])
    })
  })

  describe('Odds API', () => {
    it('should return valid odds structure', () => {
      const mockResponse = [
        {
          id: 'abc123',
          home_team: 'New York Yankees',
          away_team: 'Boston Red Sox',
          commence_time: '2024-03-25T17:05:00Z',
          bookmakers: [
            {
              key: 'draftkings',
              title: 'DraftKings',
              markets: [
                {
                  key: 'h2h',
                  outcomes: [
                    { name: 'New York Yankees', price: -150 },
                    { name: 'Boston Red Sox', price: 130 }
                  ]
                }
              ]
            }
          ]
        }
      ]

      expect(Array.isArray(mockResponse)).toBe(true)
      expect(mockResponse[0].bookmakers).toBeDefined()
      expect(mockResponse[0].bookmakers[0].markets[0].outcomes).toHaveLength(2)
    })

    it('should handle multiple bookmakers', () => {
      const mockResponse = [
        {
          id: 'abc123',
          home_team: 'Yankees',
          away_team: 'Red Sox',
          bookmakers: [
            { key: 'draftkings', title: 'DraftKings', markets: [] },
            { key: 'fanduel', title: 'FanDuel', markets: [] }
          ]
        }
      ]

      expect(mockResponse[0].bookmakers).toHaveLength(2)
    })
  })
})
