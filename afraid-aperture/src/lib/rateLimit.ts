import type { D1Database } from '@cloudflare/workers-types';
import { dbGet } from './db';

export async function checkRateLimit(
  db: D1Database,
  ip: string,
  windowMinutes: number,
  maxAttempts: number
): Promise<boolean> {
  const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const result = await dbGet<{ cnt: number }>(
    db,
    'SELECT COUNT(*) as cnt FROM contact_messages WHERE ip_address = ? AND created_at > ?',
    [ip, cutoffTime]
  );

  return (result?.cnt ?? 0) < maxAttempts;
}
