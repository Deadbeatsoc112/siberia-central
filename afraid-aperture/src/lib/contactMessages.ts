import type { D1Database } from '@cloudflare/workers-types';
import { dbGet, dbAll, dbRun } from './db';

export type ContactMessageInput = {
	fullName: string;
	email: string;
	phone?: string;
	message: string;
	ipAddress?: string;
	imagePath?: string;
};

export const messagesRepo = {
	async listAll(db: D1Database) {
		return await dbAll<{
			id: number;
			full_name: string;
			email: string;
			phone: string | null;
			message: string;
			status: string;
			notes: string | null;
			ip_address: string | null;
			image_path: string | null;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM contact_messages ORDER BY created_at DESC');
	},

	async listByStatus(db: D1Database, status: string) {
		return await dbAll<{
			id: number;
			full_name: string;
			email: string;
			phone: string | null;
			message: string;
			status: string;
			notes: string | null;
			ip_address: string | null;
			image_path: string | null;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC', [status]);
	},

	async countByStatus(db: D1Database, status: string) {
		const result = await dbGet<{ cnt: number }>(
			db,
			'SELECT COUNT(*) as cnt FROM contact_messages WHERE status = ?',
			[status],
		);
		return result?.cnt ?? 0;
	},

	async getById(db: D1Database, id: number) {
		return await dbGet<{
			id: number;
			full_name: string;
			email: string;
			phone: string | null;
			message: string;
			status: string;
			notes: string | null;
			ip_address: string | null;
			image_path: string | null;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM contact_messages WHERE id = ?', [id]);
	},

	async create(db: D1Database, input: ContactMessageInput) {
		const result = await dbRun(
			db,
			`INSERT INTO contact_messages (full_name, email, phone, message, status, ip_address, image_path)
			 VALUES (?, ?, ?, ?, 'unread', ?, ?)`,
			[
				input.fullName,
				input.email,
				input.phone ?? null,
				input.message,
				input.ipAddress ?? null,
				input.imagePath ?? null,
			],
		);
		return result.meta.last_row_id as number;
	},

	async updateStatus(db: D1Database, id: number, status: string) {
		await dbRun(
			db,
			'UPDATE contact_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
			[status, id],
		);
	},

	async addNote(db: D1Database, id: number, notes: string) {
		await dbRun(
			db,
			'UPDATE contact_messages SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
			[notes, id],
		);
	},

	async remove(db: D1Database, id: number) {
		await dbRun(db, 'DELETE FROM contact_messages WHERE id = ?', [id]);
	},
};
