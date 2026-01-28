import { db } from './db';

export type ContactMessageInput = {
	fullName: string;
	email: string;
	phone?: string;
	message: string;
	ipAddress?: string;
};

const nowEpoch = () => Math.floor(Date.now() / 1000);

export const messagesRepo = {
	listAll: () =>
		db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all() as Array<{
			id: number;
			full_name: string;
			email: string;
			phone: string | null;
			message: string;
			status: string;
			notes: string | null;
			ip_address: string | null;
			created_at: number;
			updated_at: number;
		}>,

	listByStatus: (status: string) =>
		db
			.prepare('SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC')
			.all(status) as Array<{
			id: number;
			full_name: string;
			email: string;
			phone: string | null;
			message: string;
			status: string;
			notes: string | null;
			ip_address: string | null;
			created_at: number;
			updated_at: number;
		}>,

	countByStatus: (status: string) =>
		(
			db.prepare('SELECT COUNT(*) as cnt FROM contact_messages WHERE status = ?').get(status) as {
				cnt: number;
			}
		).cnt,

	getById: (id: number) =>
		db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(id) as
			| {
					id: number;
					full_name: string;
					email: string;
					phone: string | null;
					message: string;
					status: string;
					notes: string | null;
					ip_address: string | null;
					created_at: number;
					updated_at: number;
			  }
			| undefined,

	create: (input: ContactMessageInput) => {
		const ts = nowEpoch();
		const result = db
			.prepare(
				`INSERT INTO contact_messages (full_name, email, phone, message, status, ip_address, created_at, updated_at)
				 VALUES (?, ?, ?, ?, 'unread', ?, ?, ?)`,
			)
			.run(
				input.fullName,
				input.email,
				input.phone ?? null,
				input.message,
				input.ipAddress ?? null,
				ts,
				ts,
			);
		return Number(result.lastInsertRowid);
	},

	updateStatus: (id: number, status: string) => {
		const ts = nowEpoch();
		db.prepare('UPDATE contact_messages SET status = ?, updated_at = ? WHERE id = ?').run(
			status,
			ts,
			id,
		);
	},

	addNote: (id: number, notes: string) => {
		const ts = nowEpoch();
		db.prepare('UPDATE contact_messages SET notes = ?, updated_at = ? WHERE id = ?').run(notes, ts, id);
	},

	remove: (id: number) => {
		db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id);
	},
};
