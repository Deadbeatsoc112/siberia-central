import type { D1Database } from '@cloudflare/workers-types';
import { dbGet, dbAll, dbRun } from './db';

export type PageContentInput = {
  pageKey: string;
  section: string;
  contentType: string;
  contentValue: string;
  label: string;
  description?: string;
  displayOrder?: number;
};

export const pageContentRepo = {
  async listAll(db: D1Database) {
    return await dbAll<{
      id: number;
      page_key: string;
      section: string;
      content_type: string;
      content_value: string;
      label: string;
      description: string | null;
      display_order: number;
      updated_at: string;
    }>(db, 'SELECT * FROM page_content ORDER BY section, display_order');
  },

  async listBySection(db: D1Database, section: string) {
    return await dbAll<{
      id: number;
      page_key: string;
      section: string;
      content_type: string;
      content_value: string;
      label: string;
      description: string | null;
      display_order: number;
      updated_at: string;
    }>(db, 'SELECT * FROM page_content WHERE section = ? ORDER BY display_order', [section]);
  },

  async getByKey(db: D1Database, pageKey: string) {
    return await dbGet<{
      id: number;
      page_key: string;
      section: string;
      content_type: string;
      content_value: string;
      label: string;
      description: string | null;
      display_order: number;
      updated_at: string;
    }>(db, 'SELECT * FROM page_content WHERE page_key = ?', [pageKey]);
  },

  async update(db: D1Database, pageKey: string, contentValue: string) {
    await dbRun(
      db,
      'UPDATE page_content SET content_value = ?, updated_at = CURRENT_TIMESTAMP WHERE page_key = ?',
      [contentValue, pageKey]
    );
  },
};
