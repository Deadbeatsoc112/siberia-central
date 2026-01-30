import type { D1Database } from '@cloudflare/workers-types';
import { dbGet, dbAll, dbRun } from './db';

export type ResumeInput = {
	jobId?: number | null;
	fullName: string;
	email: string;
	phone: string;
	filePath: string;
	fileName: string;
	fileSize: number;
	positionApplied?: string;
	status?: string;
};

export const resumesRepo = {
	async listAll(db: D1Database) {
		return await dbAll<{
			id: number;
			job_id: number | null;
			full_name: string;
			email: string;
			phone: string;
			file_path: string;
			file_name: string;
			file_size: number;
			position_applied: string | null;
			status: string;
			notes: string | null;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM resumes ORDER BY created_at DESC');
	},

	async listByStatus(db: D1Database, status: string) {
		return await dbAll<{
			id: number;
			job_id: number | null;
			full_name: string;
			email: string;
			phone: string;
			file_path: string;
			file_name: string;
			file_size: number;
			position_applied: string | null;
			status: string;
			notes: string | null;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM resumes WHERE status = ? ORDER BY created_at DESC', [status]);
	},

	async countByStatus(db: D1Database, status: string) {
		const result = await dbGet<{ cnt: number }>(
			db,
			'SELECT COUNT(*) as cnt FROM resumes WHERE status = ?',
			[status],
		);
		return result?.cnt ?? 0;
	},

	async getById(db: D1Database, id: number) {
		return await dbGet<{
			id: number;
			job_id: number | null;
			full_name: string;
			email: string;
			phone: string;
			file_path: string;
			file_name: string;
			file_size: number;
			position_applied: string | null;
			status: string;
			notes: string | null;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM resumes WHERE id = ?', [id]);
	},

	async create(db: D1Database, input: ResumeInput) {
		const result = await dbRun(
			db,
			`INSERT INTO resumes (job_id, full_name, email, phone, file_path, file_name, file_size, position_applied, status)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				input.jobId ?? null,
				input.fullName,
				input.email,
				input.phone,
				input.filePath,
				input.fileName,
				input.fileSize,
				input.positionApplied ?? null,
				input.status ?? 'pending',
			],
		);
		return result.meta.last_row_id as number;
	},

	async updateStatus(db: D1Database, id: number, status: string) {
		await dbRun(
			db,
			'UPDATE resumes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
			[status, id],
		);
	},

	async addNote(db: D1Database, id: number, notes: string) {
		await dbRun(
			db,
			'UPDATE resumes SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
			[notes, id],
		);
	},

	async remove(db: D1Database, id: number) {
		await dbRun(db, 'DELETE FROM resumes WHERE id = ?', [id]);
	},
};
