import { db } from './db';

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

const nowEpoch = () => Math.floor(Date.now() / 1000);

export const resumesRepo = {
	listAll: () =>
		db.prepare('SELECT * FROM resumes ORDER BY created_at DESC').all() as Array<{
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
			created_at: number;
			updated_at: number;
		}>,

	listByStatus: (status: string) =>
		db.prepare('SELECT * FROM resumes WHERE status = ? ORDER BY created_at DESC').all(status) as Array<{
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
			created_at: number;
			updated_at: number;
		}>,

	countByStatus: (status: string) =>
		(db.prepare('SELECT COUNT(*) as cnt FROM resumes WHERE status = ?').get(status) as { cnt: number })
			.cnt,

	getById: (id: number) =>
		db.prepare('SELECT * FROM resumes WHERE id = ?').get(id) as
			| {
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
					created_at: number;
					updated_at: number;
			  }
			| undefined,

	create: (input: ResumeInput) => {
		const ts = nowEpoch();
		const result = db
			.prepare(
				`INSERT INTO resumes (job_id, full_name, email, phone, file_path, file_name, file_size, position_applied, status, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.run(
				input.jobId ?? null,
				input.fullName,
				input.email,
				input.phone,
				input.filePath,
				input.fileName,
				input.fileSize,
				input.positionApplied ?? null,
				input.status ?? 'pending',
				ts,
				ts,
			);
		return Number(result.lastInsertRowid);
	},

	updateStatus: (id: number, status: string) => {
		const ts = nowEpoch();
		db.prepare('UPDATE resumes SET status = ?, updated_at = ? WHERE id = ?').run(status, ts, id);
	},

	addNote: (id: number, notes: string) => {
		const ts = nowEpoch();
		db.prepare('UPDATE resumes SET notes = ?, updated_at = ? WHERE id = ?').run(notes, ts, id);
	},

	remove: (id: number) => {
		db.prepare('DELETE FROM resumes WHERE id = ?').run(id);
	},
};
