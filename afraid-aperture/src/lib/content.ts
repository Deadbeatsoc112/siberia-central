import type { D1Database } from '@cloudflare/workers-types';
import { dbGet, dbAll, dbRun } from './db';

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

let jobsAvailablePositionsSchemaChecked = false;

const ensureJobsAvailablePositionsColumn = async (db: D1Database) => {
  if (jobsAvailablePositionsSchemaChecked) return;

  const columns = await dbAll<{ name: string }>(db, 'PRAGMA table_info(jobs)');
  const hasAvailablePositions = columns.some(
    (column) => column.name === 'available_positions'
  );

  if (!hasAvailablePositions) {
    try {
      await dbRun(
        db,
        'ALTER TABLE jobs ADD COLUMN available_positions INTEGER DEFAULT 1'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/duplicate column name/i.test(message)) {
        throw error;
      }
    }
  }

  jobsAvailablePositionsSchemaChecked = true;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const ensureUniqueSlug = async (db: D1Database, base: string) => {
  let slug = base;
  let suffix = 2;
  while (await dbGet(db, 'SELECT id FROM posts WHERE slug = ?', [slug])) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

export const postsRepo = {
  async listAll(db: D1Database) {
    return await dbAll<{
      id: number;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      image_url: string | null;
      published: number;
      created_at: string;
      updated_at: string;
    }>(
      db,
      'SELECT id, title, slug, excerpt, content, image_url, published, created_at, updated_at FROM posts ORDER BY created_at DESC'
    );
  },

  async getById(db: D1Database, id: number) {
    return await dbGet<{
      id: number;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      image_url: string | null;
      published: number;
      created_at: string;
      updated_at: string;
    }>(db, 'SELECT * FROM posts WHERE id = ?', [id]);
  },

  async getBySlug(db: D1Database, slug: string) {
    return await dbGet<{
      id: number;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      image_url: string | null;
      published: number;
      created_at: string;
      updated_at: string;
    }>(db, 'SELECT * FROM posts WHERE slug = ?', [slug]);
  },

  async create(db: D1Database, input: PostInput) {
    const baseSlug = slugify(input.title) || 'post';
    const slug = await ensureUniqueSlug(db, baseSlug);

    const result = await dbRun(
      db,
      `INSERT INTO posts (title, slug, excerpt, content, image_url, published)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        slug,
        input.excerpt,
        input.content,
        input.imageUrl ?? null,
        input.published === false ? 0 : 1,
      ]
    );
    return result.meta.last_row_id as number;
  },

  async update(db: D1Database, id: number, input: PostInput) {
    const current = await postsRepo.getById(db, id);
    if (!current) return false;

    const nextTitle = input.title || current.title;
    let nextSlug = current.slug;
    const baseSlug = slugify(nextTitle) || 'post';
    if (baseSlug !== current.slug && baseSlug !== slugify(current.title)) {
      nextSlug = await ensureUniqueSlug(db, baseSlug);
    }

    await dbRun(
      db,
      `UPDATE posts
       SET title = ?, slug = ?, excerpt = ?, content = ?, image_url = ?, published = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        nextTitle,
        nextSlug,
        input.excerpt || current.excerpt,
        input.content || current.content,
        input.imageUrl ?? current.image_url,
        input.published === false ? 0 : 1,
        id,
      ]
    );
    return true;
  },

  async remove(db: D1Database, id: number) {
    await dbRun(db, 'DELETE FROM posts WHERE id = ?', [id]);
  },
};

export const jobsRepo = {
  async listAll(db: D1Database) {
    await ensureJobsAvailablePositionsColumn(db);

    return await dbAll<{
      id: number;
      title: string;
      location: string;
      type: string;
      description: string;
      is_active: number;
      available_positions: number;
      created_at: string;
      updated_at: string;
    }>(
      db,
      'SELECT id, title, location, type, description, is_active, available_positions, created_at, updated_at FROM jobs ORDER BY created_at DESC'
    );
  },

  async getById(db: D1Database, id: number) {
    await ensureJobsAvailablePositionsColumn(db);

    return await dbGet<{
      id: number;
      title: string;
      location: string;
      type: string;
      description: string;
      is_active: number;
      available_positions: number;
      created_at: string;
      updated_at: string;
    }>(db, 'SELECT * FROM jobs WHERE id = ?', [id]);
  },

  async create(db: D1Database, input: JobInput) {
    await ensureJobsAvailablePositionsColumn(db);

    const result = await dbRun(
      db,
      `INSERT INTO jobs (title, location, type, description, is_active, available_positions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.title,
        input.location,
        input.type,
        input.description,
        input.isActive === false ? 0 : 1,
        input.availablePositions ?? 1,
      ]
    );
    return result.meta.last_row_id as number;
  },

  async update(db: D1Database, id: number, input: JobInput) {
    await ensureJobsAvailablePositionsColumn(db);

    const current = await jobsRepo.getById(db, id);
    if (!current) return false;

    await dbRun(
      db,
      `UPDATE jobs
       SET title = ?, location = ?, type = ?, description = ?, is_active = ?, available_positions = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        input.title || current.title,
        input.location || current.location,
        input.type || current.type,
        input.description || current.description,
        input.isActive === false ? 0 : 1,
        input.availablePositions ?? current.available_positions,
        id,
      ]
    );
    return true;
  },

  async remove(db: D1Database, id: number) {
    await dbRun(db, 'DELETE FROM jobs WHERE id = ?', [id]);
  },
};
