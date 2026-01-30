import type { D1Database } from '@cloudflare/workers-types';

export type AppDatabase = D1Database;

// Obtener D1 desde Astro.locals
export function getDB(locals: App.Locals): D1Database {
  // En Cloudflare Pages, los bindings están en runtime.env
  const db = locals.runtime?.env?.siberia_prod || locals.siberia_prod;
  if (!db) {
    throw new Error('D1 binding "siberia_prod" not found');
  }
  return db;
}

// Helpers para queries
export async function dbGet<T = any>(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<T | null> {
  const stmt = db.prepare(query);
  const result = await stmt.bind(...params).first<T>();
  return result || null;
}

export async function dbAll<T = any>(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<T[]> {
  const stmt = db.prepare(query);
  const result = await stmt.bind(...params).all<T>();
  return result.results || [];
}

export async function dbRun(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<D1Result> {
  const stmt = db.prepare(query);
  return await stmt.bind(...params).run();
}

// Password utils removidos - contraseñas en texto plano para testing
