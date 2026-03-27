import { DateTime } from 'luxon';
import tzLookup from 'tz-lookup';

type SunsetLabel = 'Plenty of sun left' | 'Good beer garden time' | 'Last of the sun' | 'Sun’s gone';

export interface SunsetSummary {
  sunsetTime: string;
  sunriseTime: string;
  minutesLeft: number;
  minutesUntilNextSunrise?: number;
  isDaylight: boolean;
  label: SunsetLabel;
}

type CachedSunTimes = {
  sunrise: string;
  sunset: string;
  dateKey: string;
  cachedAt: number;
};

// Simple in-memory cache keyed by lat/lng/date to avoid hammering the public API.
// Set SUN_CACHE_TTL_MS=0 to disable caching (useful for testing).
const cacheTtlMs = Number(process.env.SUN_CACHE_TTL_MS ?? 0);
const sunCache: Map<string, CachedSunTimes> = (globalThis as any).__sunCache ?? new Map();
(globalThis as any).__sunCache = sunCache;

function buildCacheKey(lat: number, lng: number, dateKey: string) {
  // Reduce key fan-out a little by rounding coordinates.
  return `${lat.toFixed(4)}:${lng.toFixed(4)}:${dateKey}`;
}

async function fetchOpenMeteoSunTimes(lat: number, lng: number, dateKey: string) {
  const cacheKey = buildCacheKey(lat, lng, dateKey);
  if (cacheTtlMs > 0) {
    const cached = sunCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < cacheTtlMs) {
      return cached;
    }
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lng.toString());
  url.searchParams.set('daily', 'sunrise,sunset');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('start_date', dateKey);
  url.searchParams.set('end_date', dateKey);
  url.searchParams.set('past_days', '0');
  url.searchParams.set('forecast_days', '2');

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;

    const payload = await res.json();
    const times = payload?.daily?.time as string[] | undefined;
    const sunrises = payload?.daily?.sunrise as string[] | undefined;
    const sunsets = payload?.daily?.sunset as string[] | undefined;

    if (!times || !sunrises || !sunsets) return null;

    const index = times.findIndex((day) => day === dateKey);
    if (index === -1 || !sunrises[index] || !sunsets[index]) return null;

    const sunTimes: CachedSunTimes = {
      sunrise: sunrises[index],
      sunset: sunsets[index],
      dateKey,
      cachedAt: Date.now()
    };

    if (cacheTtlMs > 0) {
      sunCache.set(cacheKey, sunTimes);
    }

    return sunTimes;
  } catch {
    return null;
  }
}

async function fetchSunriseSunsetOrg(lat: number, lng: number, dateKey: string) {
  const cacheKey = buildCacheKey(lat, lng, dateKey);
  if (cacheTtlMs > 0) {
    const cached = sunCache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < cacheTtlMs) {
      return cached;
    }
  }

  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${dateKey}&formatted=0`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }

    const payload = await res.json();
    if (payload.status !== 'OK' || !payload.results?.sunrise || !payload.results?.sunset) {
      return null;
    }

    const sunTimes: CachedSunTimes = {
      sunrise: payload.results.sunrise,
      sunset: payload.results.sunset,
      dateKey,
      cachedAt: Date.now()
    };

    if (cacheTtlMs > 0) {
      sunCache.set(cacheKey, sunTimes);
    }
    return sunTimes;
  } catch {
    return null;
  }
}

async function fetchSunTimes(lat: number, lng: number, dateKey: string) {
  const primary = await fetchOpenMeteoSunTimes(lat, lng, dateKey);
  if (primary) return primary;
  return fetchSunriseSunsetOrg(lat, lng, dateKey);
}

function pickLabel(minutesLeft: number): SunsetLabel {
  if (minutesLeft > 120) return 'Plenty of sun left';
  if (minutesLeft > 60) return 'Good beer garden time';
  if (minutesLeft > 0) return 'Last of the sun';
  return 'Sun’s gone';
}

export async function getSunsetSummary(
  lat?: number,
  lng?: number,
  now = new Date()
): Promise<SunsetSummary | null> {
  if (lat === undefined || lng === undefined || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  let timeZone: string;
  try {
    timeZone = tzLookup(lat, lng);
  } catch {
    return null;
  }

  const nowZoned = DateTime.fromJSDate(now).setZone(timeZone);
  const todayKey = nowZoned.toISODate();
  const tomorrowKey = nowZoned.plus({ days: 1 }).toISODate();

  if (!todayKey) {
    return null;
  }

  const todayTimes = await fetchSunTimes(lat, lng, todayKey);
  if (!todayTimes) {
    return null;
  }

  const sunsetDate = DateTime.fromISO(todayTimes.sunset, { zone: timeZone });
  const sunriseDate = DateTime.fromISO(todayTimes.sunrise, { zone: timeZone });
  const isDaylight = nowZoned >= sunriseDate && nowZoned < sunsetDate;
  const minutesLeft = Math.round(sunsetDate.diff(nowZoned, 'minutes').minutes);

  let minutesUntilNextSunrise: number | undefined;
  if (!isDaylight && tomorrowKey) {
    const tomorrowTimes = await fetchSunTimes(lat, lng, tomorrowKey);
    const nextSunriseIso = nowZoned < sunriseDate ? todayTimes.sunrise : tomorrowTimes?.sunrise;
    if (nextSunriseIso) {
      const nextSunrise = DateTime.fromISO(nextSunriseIso, { zone: timeZone });
      minutesUntilNextSunrise = Math.round(nextSunrise.diff(nowZoned, 'minutes').minutes);
    }
  }

  const sunsetTime = sunsetDate.toISO();
  const sunriseTime = sunriseDate.toISO();

  if (!sunsetTime || !sunriseTime) {
    return null;
  }

  const label = isDaylight ? pickLabel(minutesLeft) : 'Sun’s gone';

  return {
    sunsetTime,
    sunriseTime,
    minutesLeft,
    minutesUntilNextSunrise,
    isDaylight,
    label
  };
}
