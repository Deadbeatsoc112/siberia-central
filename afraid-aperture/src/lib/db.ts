import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pbkdf2Sync, randomBytes } from 'node:crypto';

const dbPath = join(process.cwd(), 'data', 'app.db');
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

type HashParts = {
	salt: string;
	hash: string;
};

const hashPassword = (password: string, salt?: string): HashParts => {
	const saltBytes = salt ? Buffer.from(salt, 'hex') : randomBytes(16);
	const hashBytes = pbkdf2Sync(password, saltBytes, 120_000, 32, 'sha256');
	return {
		salt: saltBytes.toString('hex'),
		hash: hashBytes.toString('hex'),
	};
};

const runMigrations = () => {
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			password_salt TEXT NOT NULL,
			password_hash TEXT NOT NULL,
			created_at INTEGER NOT NULL DEFAULT (unixepoch())
		);

		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id INTEGER NOT NULL,
			expires_at INTEGER NOT NULL,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			slug TEXT NOT NULL UNIQUE,
			excerpt TEXT NOT NULL,
			content TEXT NOT NULL,
			image_url TEXT,
			published INTEGER NOT NULL DEFAULT 1,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch())
		);

		CREATE TABLE IF NOT EXISTS jobs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			location TEXT NOT NULL,
			type TEXT NOT NULL,
			description TEXT NOT NULL,
			is_active INTEGER NOT NULL DEFAULT 1,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch())
		);
	`);
};

const seedAdminUser = () => {
	const username = 'admin';
	const password = 'admin';

	const existing = db
		.prepare('SELECT id FROM users WHERE username = ?')
		.get(username) as { id: number } | undefined;

	if (existing) return;

	const { salt, hash } = hashPassword(password);

	db.prepare(
		'INSERT INTO users (username, password_salt, password_hash) VALUES (?, ?, ?)',
	).run(username, salt, hash);
};

runMigrations();
seedAdminUser();

export const passwordUtils = {
	hashPassword,
};
