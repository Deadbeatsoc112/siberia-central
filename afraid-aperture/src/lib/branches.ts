import { db } from './db';

export type BranchInput = {
	name: string;
	address: string;
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
	listAll: () =>
		db.prepare('SELECT * FROM branches ORDER BY display_order, name').all() as Array<{
			id: number;
			name: string;
			slug: string;
			address: string;
			latitude: number | null;
			longitude: number | null;
			phones: string;
			contact_email: string | null;
			is_active: number;
			display_order: number;
			created_at: number;
			updated_at: number;
		}>,

	listActive: () =>
		db
			.prepare('SELECT * FROM branches WHERE is_active = 1 ORDER BY display_order')
			.all() as Array<{
			id: number;
			name: string;
			slug: string;
			address: string;
			latitude: number | null;
			longitude: number | null;
			phones: string;
			contact_email: string | null;
			is_active: number;
			display_order: number;
			created_at: number;
			updated_at: number;
		}>,

	getById: (id: number) =>
		db.prepare('SELECT * FROM branches WHERE id = ?').get(id) as
			| {
					id: number;
					name: string;
					slug: string;
					address: string;
					latitude: number | null;
					longitude: number | null;
					phones: string;
					contact_email: string | null;
					is_active: number;
					display_order: number;
					created_at: number;
					updated_at: number;
			  }
			| undefined,

	getBySlug: (slug: string) =>
		db.prepare('SELECT * FROM branches WHERE slug = ?').get(slug) as
			| {
					id: number;
					name: string;
					slug: string;
					address: string;
					latitude: number | null;
					longitude: number | null;
					phones: string;
					contact_email: string | null;
					is_active: number;
					display_order: number;
					created_at: number;
					updated_at: number;
			  }
			| undefined,

	create: (input: BranchInput) => {
		const slug = slugify(input.name);
		const ts = Math.floor(Date.now() / 1000);
		const result = db
			.prepare(
				`INSERT INTO branches (name, slug, address, latitude, longitude, phones, contact_email, is_active, display_order, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.run(
				input.name,
				slug,
				input.address,
				input.latitude ?? null,
				input.longitude ?? null,
				JSON.stringify(input.phones || []),
				input.contactEmail ?? null,
				input.isActive === false ? 0 : 1,
				input.displayOrder ?? 0,
				ts,
				ts,
			);
		return Number(result.lastInsertRowid);
	},

	update: (id: number, input: BranchInput) => {
		const ts = Math.floor(Date.now() / 1000);
		const current = branchesRepo.getById(id);
		if (!current) return false;

		const slug = slugify(input.name || current.name);
		db.prepare(
			`UPDATE branches
			 SET name = ?, slug = ?, address = ?, latitude = ?, longitude = ?,
			     phones = ?, contact_email = ?, is_active = ?, display_order = ?, updated_at = ?
			 WHERE id = ?`,
		).run(
			input.name || current.name,
			slug,
			input.address || current.address,
			input.latitude ?? current.latitude,
			input.longitude ?? current.longitude,
			JSON.stringify(input.phones || JSON.parse(current.phones)),
			input.contactEmail ?? current.contact_email,
			input.isActive === false ? 0 : 1,
			input.displayOrder ?? current.display_order,
			ts,
			id,
		);
		return true;
	},

	remove: (id: number) => {
		db.prepare('DELETE FROM branches WHERE id = ?').run(id);
	},
};
