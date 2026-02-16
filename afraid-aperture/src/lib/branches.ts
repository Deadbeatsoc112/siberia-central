import type { D1Database } from '@cloudflare/workers-types';
import { dbGet, dbAll, dbRun } from './db';

export type BranchInput = {
	name: string;
	address: string;
	displayAddress?: string;
	latitude?: number;
	longitude?: number;
	phones?: string[];
	contactEmail?: string;
	isActive?: boolean;
	displayOrder?: number;
};

const slugify = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');

export const branchesRepo = {
	async listAll(db: D1Database) {
		return await dbAll<{
			id: number;
			name: string;
			slug: string;
			address: string;
			display_address: string | null;
			latitude: number | null;
			longitude: number | null;
			phones: string;
			contact_email: string | null;
			is_active: number;
			display_order: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM branches ORDER BY display_order, name');
	},

	async listActive(db: D1Database) {
		return await dbAll<{
			id: number;
			name: string;
			slug: string;
			address: string;
			display_address: string | null;
			latitude: number | null;
			longitude: number | null;
			phones: string;
			contact_email: string | null;
			is_active: number;
			display_order: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM branches WHERE is_active = 1 ORDER BY display_order');
	},

	async getById(db: D1Database, id: number) {
		return await dbGet<{
			id: number;
			name: string;
			slug: string;
			address: string;
			display_address: string | null;
			latitude: number | null;
			longitude: number | null;
			phones: string;
			contact_email: string | null;
			is_active: number;
			display_order: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM branches WHERE id = ?', [id]);
	},

	async getBySlug(db: D1Database, slug: string) {
		return await dbGet<{
			id: number;
			name: string;
			slug: string;
			address: string;
			display_address: string | null;
			latitude: number | null;
			longitude: number | null;
			phones: string;
			contact_email: string | null;
			is_active: number;
			display_order: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM branches WHERE slug = ?', [slug]);
	},

	async create(db: D1Database, input: BranchInput) {
		const slug = slugify(input.name);
		const result = await dbRun(
			db,
			`INSERT INTO branches (name, slug, address, display_address, latitude, longitude, phones, contact_email, is_active, display_order)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				input.name,
				slug,
				input.address,
				input.displayAddress ?? null,
				input.latitude ?? null,
				input.longitude ?? null,
				JSON.stringify(input.phones || []),
				input.contactEmail ?? null,
				input.isActive === false ? 0 : 1,
				input.displayOrder ?? 0,
			],
		);
		return result.meta.last_row_id as number;
	},

	async update(db: D1Database, id: number, input: BranchInput) {
		const current = await branchesRepo.getById(db, id);
		if (!current) return false;

		const slug = slugify(input.name || current.name);
		await dbRun(
			db,
			`UPDATE branches
			 SET name = ?, slug = ?, address = ?, display_address = ?, latitude = ?, longitude = ?,
			     phones = ?, contact_email = ?, is_active = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
			 WHERE id = ?`,
			[
				input.name || current.name,
				slug,
				input.address || current.address,
				input.displayAddress ?? current.display_address,
				input.latitude ?? current.latitude,
				input.longitude ?? current.longitude,
				JSON.stringify(input.phones || JSON.parse(current.phones)),
				input.contactEmail ?? current.contact_email,
				input.isActive === false ? 0 : 1,
				input.displayOrder ?? current.display_order,
				id,
			],
		);
		return true;
	},

	async remove(db: D1Database, id: number) {
		await dbRun(db, 'DELETE FROM branches WHERE id = ?', [id]);
	},
};
