import { randomUUID, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { db, passwordUtils } from './db';

const SESSION_COOKIE = 'panel_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type DbUser = {
	id: number;
	username: string;
	password_salt: string;
	password_hash: string;
};

type DbSession = {
	id: string;
	user_id: number;
	expires_at: number;
};

const verifyPassword = (password: string, salt: string, expectedHash: string) => {
	const { hash } = passwordUtils.hashPassword(password, salt);
	const a = Buffer.from(hash, 'hex');
	const b = Buffer.from(expectedHash, 'hex');
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
};

const getUserByUsername = (username: string) =>
	db.prepare('SELECT * FROM users WHERE username = ?').get(username) as DbUser | undefined;

const getUserById = (id: number) =>
	db.prepare('SELECT id, username FROM users WHERE id = ?').get(id) as
		| { id: number; username: string }
		| undefined;

const deleteSession = (sessionId: string) => {
	db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
};

const readSession = (sessionId: string) =>
	db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as DbSession | undefined;

const createSession = (userId: number) => {
	const sessionId = randomUUID();
	const now = Math.floor(Date.now() / 1000);
	const expiresAt = now + SESSION_TTL_SECONDS;
	db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
		sessionId,
		userId,
		expiresAt,
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

const getSessionIdFromCookies = (cookies: AstroCookies) => cookies.get(SESSION_COOKIE)?.value;

const getUserFromCookies = (cookies: AstroCookies) => {
	const sessionId = getSessionIdFromCookies(cookies);
	if (!sessionId) return null;

	const session = readSession(sessionId);
	if (!session) return null;

	const now = Math.floor(Date.now() / 1000);
	if (session.expires_at <= now) {
		deleteSession(session.id);
		clearSessionCookie(cookies);
		return null;
	}

	return getUserById(session.user_id) ?? null;
};

const authenticate = (username: string, password: string) => {
	const user = getUserByUsername(username);
	if (!user) return null;
	const valid = verifyPassword(password, user.password_salt, user.password_hash);
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
