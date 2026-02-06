import type { AstroCookies } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';
import { dbGet, dbRun } from './db';

const SESSION_COOKIE = 'panel_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type DbUser = {
  id: number;
  username: string;
  password_hash: string; // Plain text password (testing only)
};

type DbSession = {
  id: string;
  user_id: number;
  expires_at: string; // TEXT en schema.sql
};

// Verify password (plain text comparison for testing)
const verifyPassword = (password: string, storedPassword: string) => {
  return password === storedPassword;
};

const getUserByUsername = async (db: D1Database, username: string) =>
  await dbGet<DbUser>(db, 'SELECT * FROM users WHERE username = ?', [username]);

const getUserById = async (db: D1Database, id: number) =>
  await dbGet<{ id: number; username: string }>(
    db,
    'SELECT id, username FROM users WHERE id = ?',
    [id]
  );

const deleteSession = async (db: D1Database, sessionId: string) => {
  await dbRun(db, 'DELETE FROM sessions WHERE id = ?', [sessionId]);
};

const readSession = async (db: D1Database, sessionId: string) =>
  await dbGet<DbSession>(db, 'SELECT * FROM sessions WHERE id = ?', [sessionId]);

const createSession = async (db: D1Database, userId: number) => {
  const sessionId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_TTL_SECONDS;

  // expires_at es TEXT en schema, guardar como ISO string
  const expiresAtISO = new Date(expiresAt * 1000).toISOString();

  await dbRun(
    db,
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    [sessionId, userId, expiresAtISO]
  );

  return { sessionId, expiresAt };
};

const setSessionCookie = (cookies: AstroCookies, sessionId: string, expiresAt: number) => {
  cookies.set(SESSION_COOKIE, sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(expiresAt * 1000),
  });
};

const clearSessionCookie = (cookies: AstroCookies) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
};

const getSessionIdFromCookies = (cookies: AstroCookies) =>
  cookies.get(SESSION_COOKIE)?.value;

const getUserFromCookies = async (db: D1Database, cookies: AstroCookies) => {
  const sessionId = getSessionIdFromCookies(cookies);
  if (!sessionId) return null;

  const session = await readSession(db, sessionId);
  if (!session) return null;

  // Comparar expires_at (TEXT) con now
  const expiresAt = new Date(session.expires_at).getTime();
  const now = Date.now();

  if (expiresAt <= now) {
    await deleteSession(db, session.id);
    clearSessionCookie(cookies);
    return null;
  }

  return (await getUserById(db, session.user_id)) ?? null;
};

const authenticate = async (db: D1Database, username: string, password: string) => {
  const user = await getUserByUsername(db, username);
  if (!user) return null;

  const valid = verifyPassword(password, user.password_hash);
  if (!valid) return null;

  return { id: user.id, username: user.username };
};

export const auth = {
  SESSION_COOKIE,
  authenticate,
  createSession,
  deleteSessionById: deleteSession,
  setSessionCookie,
  clearSessionCookie,
  getUserFromCookies,
};
