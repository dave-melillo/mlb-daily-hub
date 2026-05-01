// Open-Meteo is free, keyless, and gives forecast hourly winds.
// We pull the wind speed + direction at the venue's lat/lon for the
// scheduled game time and translate it to "OUT", "IN", or "CROSS"
// relative to the park's home plate bearing.

const BASE = 'https://api.open-meteo.com/v1/forecast';

interface ForecastResponse {
  hourly?: {
    time: string[];
    wind_speed_10m: number[];     // mph
    wind_direction_10m: number[]; // degrees, 0=N, blowing FROM
  };
}

function relativeWindCategory(windFromDeg: number, homePlateBearing: number): 'IN' | 'OUT' | 'CROSS' {
  // homePlateBearing = direction the wind would be coming FROM if it were
  // blowing OUT of the park (toward outfield).
  let diff = Math.abs(windFromDeg - homePlateBearing) % 360;
  if (diff > 180) diff = 360 - diff;
  if (diff <= 45) return 'OUT';
  if (diff >= 135) return 'IN';
  return 'CROSS';
}

export async function fetchWindForGame(
  lat: number,
  lon: number,
  gameTimeIso: string,
  homePlateBearing: number,
): Promise<{ windMph: number; windDir: 'IN' | 'OUT' | 'CROSS' } | undefined> {
  const url = `${BASE}?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph&forecast_days=2`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return undefined;
    const data: ForecastResponse = await res.json();
    const hourly = data.hourly;
    if (!hourly?.time?.length) return undefined;

    const target = new Date(gameTimeIso).getTime();
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < hourly.time.length; i++) {
      const t = new Date(hourly.time[i]).getTime();
      const diff = Math.abs(t - target);
      if (diff < bestDiff) {
        bestIdx = i;
        bestDiff = diff;
      }
    }
    const windMph = Math.round(hourly.wind_speed_10m[bestIdx]);
    const windFromDeg = hourly.wind_direction_10m[bestIdx];
    const windDir = relativeWindCategory(windFromDeg, homePlateBearing);
    return { windMph, windDir };
  } catch {
    return undefined;
  }
}
