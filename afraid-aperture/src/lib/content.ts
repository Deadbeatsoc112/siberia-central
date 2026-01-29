import { db } from './db';

export type PostInput = {
	title: string;
	excerpt: string;
	content: string;
	imageUrl?: string;
	published?: boolean;
};

export type JobInput = {
	title: string;
	location: string;
	type: string;
	description: string;
	isActive?: boolean;
	availablePositions?: number;
};

const nowEpoch = () => Math.floor(Date.now() / 1000);

const slugify = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');

const ensureUniqueSlug = (base: string) => {
	let slug = base;
	let suffix = 2;
	const exists = db.prepare('SELECT id FROM posts WHERE slug = ?');
	while (exists.get(slug)) {
		slug = `${base}-${suffix}`;
		suffix += 1;
	}
	return slug;
};

export const postsRepo = {
	listAll: () =>
		db
			.prepare(
				'SELECT id, title, slug, excerpt, content, image_url, published, created_at, updated_at FROM posts ORDER BY created_at DESC',
			)
			.all() as Array<{
				id: number;
				title: string;
				slug: string;
				excerpt: string;
				content: string;
				image_url: string | null;
				published: number;
				created_at: number;
				updated_at: number;
			}>,

	getById: (id: number) =>
		db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as
			| {
				id: number;
				title: string;
				slug: string;
				excerpt: string;
				content: string;
				image_url: string | null;
				published: number;
				created_at: number;
				updated_at: number;
			}
			| undefined,

	getBySlug: (slug: string) =>
		db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as
			| {
				id: number;
				title: string;
				slug: string;
				excerpt: string;
				content: string;
				image_url: string | null;
				published: number;
				created_at: number;
				updated_at: number;
			}
			| undefined,

	create: (input: PostInput) => {
		const baseSlug = slugify(input.title) || 'post';
		const slug = ensureUniqueSlug(baseSlug);
		const ts = nowEpoch();
		const result = db
			.prepare(
				`INSERT INTO posts (title, slug, excerpt, content, image_url, published, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.run(
				input.title,
				slug,
				input.excerpt,
				input.content,
				input.imageUrl ?? null,
				input.published === false ? 0 : 1,
				ts,
				ts,
			);
		return Number(result.lastInsertRowid);
	},

	update: (id: number, input: PostInput) => {
		const ts = nowEpoch();
		const current = postsRepo.getById(id);
		if (!current) return false;

		const nextTitle = input.title || current.title;
		let nextSlug = current.slug;
		const baseSlug = slugify(nextTitle) || 'post';
		if (baseSlug !== current.slug && baseSlug !== slugify(current.title)) {
			nextSlug = ensureUniqueSlug(baseSlug);
		}

		db.prepare(
			`UPDATE posts
			 SET title = ?, slug = ?, excerpt = ?, content = ?, image_url = ?, published = ?, updated_at = ?
			 WHERE id = ?`,
		).run(
			nextTitle,
			nextSlug,
			input.excerpt || current.excerpt,
			input.content || current.content,
			input.imageUrl ?? current.image_url,
			input.published === false ? 0 : 1,
			ts,
			id,
		);
		return true;
	},

	remove: (id: number) => {
		db.prepare('DELETE FROM posts WHERE id = ?').run(id);
	},
};

export const jobsRepo = {
	listAll: () =>
		db
			.prepare(
				'SELECT id, title, location, type, description, is_active, available_positions, created_at, updated_at FROM jobs ORDER BY created_at DESC',
			)
			.all() as Array<{
				id: number;
				title: string;
				location: string;
				type: string;
				description: string;
				is_active: number;
				available_positions: number;
				created_at: number;
				updated_at: number;
			}>,

	getById: (id: number) =>
		db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as
			| {
				id: number;
				title: string;
				location: string;
				type: string;
				description: string;
				is_active: number;
				available_positions: number;
				created_at: number;
				updated_at: number;
			}
			| undefined,

	create: (input: JobInput) => {
		const ts = nowEpoch();
		const result = db
			.prepare(
				`INSERT INTO jobs (title, location, type, description, is_active, available_positions, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.run(
				input.title,
				input.location,
				input.type,
				input.description,
				input.isActive === false ? 0 : 1,
				input.availablePositions ?? 1,
				ts,
				ts,
			);
		return Number(result.lastInsertRowid);
	},

	update: (id: number, input: JobInput) => {
		const ts = nowEpoch();
		const current = jobsRepo.getById(id);
		if (!current) return false;

		db.prepare(
			`UPDATE jobs
			 SET title = ?, location = ?, type = ?, description = ?, is_active = ?, available_positions = ?, updated_at = ?
			 WHERE id = ?`,
		).run(
			input.title || current.title,
			input.location || current.location,
			input.type || current.type,
			input.description || current.description,
			input.isActive === false ? 0 : 1,
			input.availablePositions ?? current.available_positions,
			ts,
			id,
		);
		return true;
	},

	remove: (id: number) => {
		db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
	},
};
