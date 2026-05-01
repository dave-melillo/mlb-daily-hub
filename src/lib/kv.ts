// Upstash Redis client. Reads pull from cache; writes only happen
// from /api/refresh (cron-protected) and the optional Mac mini worker.

import { Redis } from '@upstash/redis';
import type { DailyEnvelope } from '@/types';

let client: Redis | null = null;

function getClient(): Redis | null {
  if (client) return client;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

export function isKvAvailable(): boolean {
  return getClient() !== null;
}

const KEY_DAILY = (date: string) => `mlb:envelope:${date}`;
const KEY_LAST_REFRESH = 'mlb:last-refresh';
const KEY_ODDS_CACHE = 'mlb:odds:cache';

export async function getEnvelope(date: string): Promise<DailyEnvelope | null> {
  const c = getClient();
  if (!c) return null;
  return (await c.get<DailyEnvelope>(KEY_DAILY(date))) ?? null;
}

export async function setEnvelope(envelope: DailyEnvelope): Promise<void> {
  const c = getClient();
  if (!c) return;
  // Keep daily envelopes for 7 days.
  await c.set(KEY_DAILY(envelope.date), envelope, { ex: 60 * 60 * 24 * 7 });
  await c.set(KEY_LAST_REFRESH, envelope.computedAt);
}

export async function getLastRefresh(): Promise<string | null> {
  const c = getClient();
  if (!c) return null;
  return (await c.get<string>(KEY_LAST_REFRESH)) ?? null;
}

// ---- Odds cache (10-min TTL) ---------------------------------
// The Odds API has a small monthly request budget (~20K). We cache
// the raw event list and reuse it across refreshes within a 10-min
// window so the mini's every-60s heartbeat doesn't blow the budget.

const ODDS_TTL_SECONDS = 10 * 60;

export async function getCachedOdds<T>(): Promise<T | null> {
  const c = getClient();
  if (!c) return null;
  return (await c.get<T>(KEY_ODDS_CACHE)) ?? null;
}

export async function setCachedOdds<T>(payload: T): Promise<void> {
  const c = getClient();
  if (!c) return;
  await c.set(KEY_ODDS_CACHE, payload, { ex: ODDS_TTL_SECONDS });
}
