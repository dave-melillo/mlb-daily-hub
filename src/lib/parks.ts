// Park factors (100 = neutral, 105+ = hitter-friendly, 95- = pitcher-friendly).
// Source: rolling 3-year averages from baseball-reference.
// Indexed by MLB venue id.

export interface ParkInfo {
  id: number;
  name: string;
  team: string;
  parkFactor: number;
  outdoor: boolean;
  lat: number;
  lon: number;
  // Direction (in degrees) the wind is blowing FROM toward home plate.
  // Used so we can interpret weather wind direction as "OUT" or "IN".
  homePlateBearing: number;
}

export const PARKS: Record<number, ParkInfo> = {
  1: { id: 1, name: 'Chase Field', team: 'ARI', parkFactor: 103, outdoor: true, lat: 33.4453, lon: -112.0667, homePlateBearing: 23 },
  2: { id: 2, name: 'Truist Park', team: 'ATL', parkFactor: 102, outdoor: true, lat: 33.8908, lon: -84.4678, homePlateBearing: 30 },
  3: { id: 3, name: 'Camden Yards', team: 'BAL', parkFactor: 105, outdoor: true, lat: 39.2839, lon: -76.6217, homePlateBearing: 32 },
  4: { id: 4, name: 'Fenway Park', team: 'BOS', parkFactor: 108, outdoor: true, lat: 42.3467, lon: -71.0972, homePlateBearing: 45 },
  5: { id: 5, name: 'Wrigley Field', team: 'CHC', parkFactor: 102, outdoor: true, lat: 41.9484, lon: -87.6553, homePlateBearing: 29 },
  6: { id: 6, name: 'Guaranteed Rate Field', team: 'CWS', parkFactor: 101, outdoor: true, lat: 41.83, lon: -87.6339, homePlateBearing: 33 },
  7: { id: 7, name: 'Great American Ball Park', team: 'CIN', parkFactor: 110, outdoor: true, lat: 39.0975, lon: -84.5066, homePlateBearing: 27 },
  8: { id: 8, name: 'Progressive Field', team: 'CLE', parkFactor: 99, outdoor: true, lat: 41.4962, lon: -81.6852, homePlateBearing: 14 },
  9: { id: 9, name: 'Coors Field', team: 'COL', parkFactor: 116, outdoor: true, lat: 39.7559, lon: -104.9942, homePlateBearing: 0 },
  10: { id: 10, name: 'Comerica Park', team: 'DET', parkFactor: 96, outdoor: true, lat: 42.339, lon: -83.0485, homePlateBearing: 150 },
  11: { id: 11, name: 'Minute Maid Park', team: 'HOU', parkFactor: 102, outdoor: false, lat: 29.7572, lon: -95.3553, homePlateBearing: 170 },
  12: { id: 12, name: 'Kauffman Stadium', team: 'KC', parkFactor: 99, outdoor: true, lat: 39.0517, lon: -94.4803, homePlateBearing: 45 },
  13: { id: 13, name: 'Angel Stadium', team: 'LAA', parkFactor: 97, outdoor: true, lat: 33.8003, lon: -117.8827, homePlateBearing: 7 },
  14: { id: 14, name: 'Dodger Stadium', team: 'LAD', parkFactor: 96, outdoor: true, lat: 34.0739, lon: -118.24, homePlateBearing: 16 },
  15: { id: 15, name: 'loanDepot park', team: 'MIA', parkFactor: 92, outdoor: false, lat: 25.7781, lon: -80.2197, homePlateBearing: 40 },
  16: { id: 16, name: 'American Family Field', team: 'MIL', parkFactor: 102, outdoor: false, lat: 43.0282, lon: -87.9712, homePlateBearing: 138 },
  17: { id: 17, name: 'Target Field', team: 'MIN', parkFactor: 100, outdoor: true, lat: 44.9817, lon: -93.2776, homePlateBearing: 90 },
  18: { id: 18, name: 'Citi Field', team: 'NYM', parkFactor: 95, outdoor: true, lat: 40.7571, lon: -73.8458, homePlateBearing: 36 },
  19: { id: 19, name: 'Yankee Stadium', team: 'NYY', parkFactor: 105, outdoor: true, lat: 40.8296, lon: -73.9262, homePlateBearing: 65 },
  20: { id: 20, name: 'Oakland Coliseum', team: 'OAK', parkFactor: 95, outdoor: true, lat: 37.7516, lon: -122.2008, homePlateBearing: 55 },
  21: { id: 21, name: 'Citizens Bank Park', team: 'PHI', parkFactor: 104, outdoor: true, lat: 39.9061, lon: -75.1665, homePlateBearing: 36 },
  22: { id: 22, name: 'PNC Park', team: 'PIT', parkFactor: 96, outdoor: true, lat: 40.4469, lon: -80.0058, homePlateBearing: 152 },
  23: { id: 23, name: 'Petco Park', team: 'SD', parkFactor: 95, outdoor: true, lat: 32.7073, lon: -117.1566, homePlateBearing: 65 },
  24: { id: 24, name: 'Oracle Park', team: 'SF', parkFactor: 92, outdoor: true, lat: 37.7786, lon: -122.3893, homePlateBearing: 110 },
  25: { id: 25, name: 'T-Mobile Park', team: 'SEA', parkFactor: 95, outdoor: false, lat: 47.5914, lon: -122.3325, homePlateBearing: 70 },
  26: { id: 26, name: 'Busch Stadium', team: 'STL', parkFactor: 99, outdoor: true, lat: 38.6226, lon: -90.1928, homePlateBearing: 38 },
  27: { id: 27, name: 'Tropicana Field', team: 'TB', parkFactor: 96, outdoor: false, lat: 27.7683, lon: -82.6534, homePlateBearing: 60 },
  28: { id: 28, name: 'Globe Life Field', team: 'TEX', parkFactor: 102, outdoor: false, lat: 32.7473, lon: -97.0826, homePlateBearing: 42 },
  29: { id: 29, name: 'Rogers Centre', team: 'TOR', parkFactor: 102, outdoor: false, lat: 43.6414, lon: -79.3894, homePlateBearing: 130 },
  30: { id: 30, name: 'Nationals Park', team: 'WSH', parkFactor: 100, outdoor: true, lat: 38.873, lon: -77.0074, homePlateBearing: 32 },
};

// Key by team abbreviation (more reliable than MLB venue ids).
const BY_TEAM: Record<string, ParkInfo> = Object.values(PARKS).reduce((acc, p) => {
  acc[p.team] = p;
  return acc;
}, {} as Record<string, ParkInfo>);

export function getParkInfoByTeam(homeAbbr?: string): ParkInfo | undefined {
  if (!homeAbbr) return undefined;
  return BY_TEAM[homeAbbr.toUpperCase()];
}
