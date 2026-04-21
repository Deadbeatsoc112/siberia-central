import type { D1Database } from '@cloudflare/workers-types';
import { dbAll, dbGet, dbRun } from './db';

export type ExperienceImage = {
	id: number;
	image_url: string;
	storage_path: string | null;
	title: string | null;
	display_order: number;
	created_at: string;
};

export type ExperienceImageInput = {
	imageUrl: string;
	storagePath?: string | null;
	title?: string | null;
	displayOrder?: number;
};

let schemaChecked = false;

const ensureTable = async (db: D1Database) => {
	if (schemaChecked) return;
	await dbRun(
		db,
		`CREATE TABLE IF NOT EXISTS experience_images (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			image_url TEXT NOT NULL,
			storage_path TEXT,
			title TEXT,
			display_order INTEGER DEFAULT 0,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		)`,
	);
	schemaChecked = true;
};

export const experienceImagesRepo = {
	async listAll(db: D1Database) {
		await ensureTable(db);
		return await dbAll<ExperienceImage>(
			db,
			'SELECT id, image_url, storage_path, title, display_order, created_at FROM experience_images ORDER BY display_order DESC, created_at DESC',
		);
	},

	async getById(db: D1Database, id: number) {
		await ensureTable(db);
		return await dbGet<ExperienceImage>(
			db,
			'SELECT id, image_url, storage_path, title, display_order, created_at FROM experience_images WHERE id = ?',
			[id],
		);
	},

	async create(db: D1Database, input: ExperienceImageInput) {
		await ensureTable(db);
		const result = await dbRun(
			db,
			`INSERT INTO experience_images (image_url, storage_path, title, display_order)
			 VALUES (?, ?, ?, ?)`,
			[
				input.imageUrl,
				input.storagePath ?? null,
				input.title ?? null,
				input.displayOrder ?? 0,
			],
		);
		return result.meta.last_row_id as number;
	},

	async remove(db: D1Database, id: number) {
		await ensureTable(db);
		await dbRun(db, 'DELETE FROM experience_images WHERE id = ?', [id]);
	},
};
