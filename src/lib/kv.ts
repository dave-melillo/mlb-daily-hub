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
