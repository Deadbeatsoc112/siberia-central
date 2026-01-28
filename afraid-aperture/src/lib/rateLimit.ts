import { db } from './db';

export function checkRateLimit(ip: string, windowMinutes: number, maxAttempts: number): boolean {
	const cutoff = Math.floor(Date.now() / 1000) - windowMinutes * 60;
	const count = db
		.prepare('SELECT COUNT(*) as cnt FROM contact_messages WHERE ip_address = ? AND created_at > ?')
		.get(ip, cutoff) as { cnt: number };

	return count.cnt < maxAttempts;
}
