import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import { getSunsetSummary } from '../sunset-service';

// Disable cache during tests to keep scenarios isolated.
process.env.SUN_CACHE_TTL_MS = '0';

type SunTimes = { sunrise: string; sunset: string };

function buildMockFetch(options: {
  openMeteo?: Record<string, SunTimes | null>;
  fallback?: Record<string, SunTimes>;
}) {
  const openMeteo = options.openMeteo ?? {};
  const fallback = options.fallback ?? {};

  return async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (url.includes('open-meteo')) {
      const parsed = new URL(url);
      const dateKey = parsed.searchParams.get('start_date') ?? '';
      const record = openMeteo[dateKey];

      if (!record) {
        return { ok: false, json: async () => ({}) } as Response;
      }

      return {
        ok: true,
        json: async () => ({
          daily: {
            time: [dateKey],
            sunrise: [record.sunrise],
            sunset: [record.sunset]
          }
        })
      } as Response;
    }

    if (url.includes('sunrise-sunset.org')) {
      const parsed = new URL(url);
      const dateKey = parsed.searchParams.get('date') ?? '';
      const record = fallback[dateKey];

      if (!record) {
        return { ok: false, json: async () => ({ status: 'INVALID' }) } as Response;
      }

      return {
        ok: true,
        json: async () => ({
          status: 'OK',
          results: {
            sunrise: record.sunrise,
            sunset: record.sunset
          }
        })
      } as Response;
    }

    throw new Error(`Unexpected fetch URL in test: ${url}`);
  };
}

function resetCache() {
  const cache = (globalThis as any).__sunCache as Map<string, unknown> | undefined;
  cache?.clear?.();
}

describe('getSunsetSummary daylight phases', () => {
  const lat = 51.5074;
  const lng = -0.1278; // London for predictable TZ

  beforeEach(() => {
    resetCache();
  });

  test('mid-afternoon shows plenty of sun', async () => {
    global.fetch = buildMockFetch({
      openMeteo: {
        '2026-06-01': { sunrise: '2026-06-01T06:00', sunset: '2026-06-01T18:00' }
      }
    }) as any;

    const now = new Date(Date.UTC(2026, 5, 1, 11, 0, 0)); // 12:00 local (BST)
    const summary = await getSunsetSummary(lat, lng, now);

    assert(summary);
    assert.equal(summary.label, 'Plenty of sun left');
    assert.equal(summary.isDaylight, true);
    assert(summary.minutesLeft > 340 && summary.minutesLeft < 380);
  });

  test('70 minutes before sunset', async () => {
    global.fetch = buildMockFetch({
      openMeteo: {
        '2026-06-01': { sunrise: '2026-06-01T06:00', sunset: '2026-06-01T18:00' }
      }
    }) as any;

    const now = new Date(Date.UTC(2026, 5, 1, 15, 50, 0)); // 16:50 local
    const summary = await getSunsetSummary(lat, lng, now);

    assert(summary);
    assert.equal(summary.label, 'Good beer garden time');
    assert.equal(summary.isDaylight, true);
    assert(summary.minutesLeft >= 69 && summary.minutesLeft <= 71);
  });

  test('10 minutes before sunset', async () => {
    global.fetch = buildMockFetch({
      openMeteo: {
        '2026-06-01': { sunrise: '2026-06-01T06:00', sunset: '2026-06-01T18:00' }
      }
    }) as any;

    const now = new Date(Date.UTC(2026, 5, 1, 16, 50, 0)); // 17:50 local
    const summary = await getSunsetSummary(lat, lng, now);

    assert(summary);
    assert.equal(summary.label, 'Last of the sun');
    assert.equal(summary.isDaylight, true);
    assert(summary.minutesLeft >= 9 && summary.minutesLeft <= 11);
  });

  test('after sunset counts down to next sunrise', async () => {
    global.fetch = buildMockFetch({
      openMeteo: {
        '2026-06-01': { sunrise: '2026-06-01T06:00', sunset: '2026-06-01T18:00' },
        '2026-06-02': { sunrise: '2026-06-02T06:00', sunset: '2026-06-02T18:00' }
      }
    }) as any;

    const now = new Date(Date.UTC(2026, 5, 1, 17, 30, 0)); // 18:30 local
    const summary = await getSunsetSummary(lat, lng, now);

    assert(summary);
    assert.equal(summary.isDaylight, false);
    assert.equal(summary.label, 'Sun’s gone');
    assert(summary.minutesUntilNextSunrise && summary.minutesUntilNextSunrise > 600);
  });

  test('before sunrise counts up to sunrise', async () => {
    global.fetch = buildMockFetch({
      openMeteo: {
        '2026-06-01': { sunrise: '2026-06-01T06:00', sunset: '2026-06-01T18:00' }
      }
    }) as any;

    const now = new Date(Date.UTC(2026, 5, 1, 4, 30, 0)); // 05:30 local
    const summary = await getSunsetSummary(lat, lng, now);

    assert(summary);
    assert.equal(summary.isDaylight, false);
    assert.equal(summary.label, 'Sun’s gone');
    assert(summary.minutesUntilNextSunrise && summary.minutesUntilNextSunrise <= 60);
  });

  test('falls back when Open-Meteo fails', async () => {
    global.fetch = buildMockFetch({
      openMeteo: {
        '2026-06-01': null
      },
      fallback: {
        '2026-06-01': {
          sunrise: '2026-06-01T06:00:00+00:00',
          sunset: '2026-06-01T18:00:00+00:00'
        }
      }
    }) as any;

    const now = new Date(Date.UTC(2026, 5, 1, 12, 0, 0));
    const summary = await getSunsetSummary(lat, lng, now);

    assert(summary);
    assert.equal(summary.isDaylight, true);
    assert.equal(summary.label, 'Plenty of sun left');
  });

  test('DST-aware (day after clocks change)', async () => {
    global.fetch = buildMockFetch({
      openMeteo: {
        '2026-03-30': { sunrise: '2026-03-30T06:40', sunset: '2026-03-30T19:30' }
      }
    }) as any;

    const now = new Date(Date.UTC(2026, 2, 30, 5, 50, 0)); // 06:50 BST
    const summary = await getSunsetSummary(lat, lng, now);

    assert(summary);
    assert.equal(summary.isDaylight, true);
    assert(summary.minutesLeft > 700);
  });
});
