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

		CREATE TABLE IF NOT EXISTS branches (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			slug TEXT NOT NULL UNIQUE,
			address TEXT NOT NULL,
			latitude REAL,
			longitude REAL,
			phones TEXT,
			contact_email TEXT,
			is_active INTEGER NOT NULL DEFAULT 1,
			display_order INTEGER NOT NULL DEFAULT 0,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch())
		);

		CREATE TABLE IF NOT EXISTS menus (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			branch_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			pdf_url TEXT,
			display_order INTEGER NOT NULL DEFAULT 0,
			is_active INTEGER NOT NULL DEFAULT 1,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
			FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS menu_categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			menu_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			display_order INTEGER NOT NULL DEFAULT 0,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
			FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS menu_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			category_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			description TEXT,
			price REAL NOT NULL,
			image_url TEXT,
			is_available INTEGER NOT NULL DEFAULT 1,
			display_order INTEGER NOT NULL DEFAULT 0,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
			FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
		);

		CREATE TABLE IF NOT EXISTS resumes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			job_id INTEGER,
			full_name TEXT NOT NULL,
			email TEXT NOT NULL,
			phone TEXT NOT NULL,
			file_path TEXT NOT NULL,
			file_name TEXT NOT NULL,
			file_size INTEGER NOT NULL,
			position_applied TEXT,
			status TEXT NOT NULL DEFAULT 'pending',
			notes TEXT,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
			FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL
		);

		CREATE TABLE IF NOT EXISTS contact_messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			full_name TEXT NOT NULL,
			email TEXT NOT NULL,
			phone TEXT,
			message TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'unread',
			notes TEXT,
			ip_address TEXT,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			updated_at INTEGER NOT NULL DEFAULT (unixepoch())
		);

		CREATE TABLE IF NOT EXISTS page_content (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			page_key TEXT NOT NULL UNIQUE,
			section TEXT NOT NULL,
			content_type TEXT NOT NULL,
			content_value TEXT NOT NULL,
			label TEXT NOT NULL,
			description TEXT,
			display_order INTEGER NOT NULL DEFAULT 0,
			updated_at INTEGER NOT NULL DEFAULT (unixepoch())
		);

		CREATE TABLE IF NOT EXISTS media_files (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			file_name TEXT NOT NULL,
			file_path TEXT NOT NULL,
			file_type TEXT NOT NULL,
			mime_type TEXT NOT NULL,
			file_size INTEGER NOT NULL,
			alt_text TEXT,
			uploaded_by INTEGER NOT NULL,
			created_at INTEGER NOT NULL DEFAULT (unixepoch()),
			FOREIGN KEY (uploaded_by) REFERENCES users(id)
		);

		CREATE INDEX IF NOT EXISTS idx_resumes_status ON resumes(status);
		CREATE INDEX IF NOT EXISTS idx_resumes_created ON resumes(created_at);
		CREATE INDEX IF NOT EXISTS idx_messages_status ON contact_messages(status);
		CREATE INDEX IF NOT EXISTS idx_branches_active ON branches(is_active);
		CREATE INDEX IF NOT EXISTS idx_page_content_section ON page_content(section);
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

const seedBranches = () => {
	const count = db.prepare('SELECT COUNT(*) as cnt FROM branches').get() as { cnt: number };
	if (count.cnt > 0) return;

	const branches = [
		{
			name: 'Central',
			slug: 'central',
			address: 'Av. Rodrigo Gómez 623, Centro, Monterrey',
			latitude: 25.6691,
			longitude: -100.3095,
			phones: JSON.stringify(['8112573064']),
			display_order: 1,
		},
		{
			name: 'San Pedro',
			slug: 'san-pedro',
			address: 'Porfirio Díaz 102, San Pedro Garza García',
			latitude: 25.6534,
			longitude: -100.3669,
			phones: JSON.stringify(['8183780000']),
			display_order: 2,
		},
	];

	const stmt = db.prepare(`
		INSERT INTO branches (name, slug, address, latitude, longitude, phones, is_active, display_order, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, 1, ?, unixepoch(), unixepoch())
	`);

	branches.forEach((b) => {
		stmt.run(b.name, b.slug, b.address, b.latitude, b.longitude, b.phones, b.display_order);
	});
};

const seedPageContent = () => {
	const count = db.prepare('SELECT COUNT(*) as cnt FROM page_content').get() as { cnt: number };
	if (count.cnt > 0) return;

	const content = [
		{
			page_key: 'home_hero_title',
			section: 'home',
			content_type: 'text',
			content_value: 'La Siberia Central',
			label: 'Título Hero',
			display_order: 1,
		},
		{
			page_key: 'home_story_title',
			section: 'home',
			content_type: 'text',
			content_value: 'Nuestra Historia',
			label: 'Título Historia',
			display_order: 2,
		},
		{
			page_key: 'home_story_text',
			section: 'home',
			content_type: 'html',
			content_value:
				'<p>Desde 1976, La Siberia Central ha sido un ícono de la gastronomía regiomontana. Comenzamos con un pequeño local en el corazón de Monterrey y hoy contamos con múltiples sucursales que mantienen viva la tradición de la auténtica cocina del norte.</p>',
			label: 'Texto Historia',
			display_order: 3,
		},
		{
			page_key: 'about_mission',
			section: 'about',
			content_type: 'html',
			content_value:
				'<p>Ofrecer experiencias gastronómicas únicas que celebren la riqueza culinaria del norte de México, manteniendo la calidad y el sabor que nos han caracterizado por generaciones.</p>',
			label: 'Misión',
			display_order: 1,
		},
		{
			page_key: 'about_vision',
			section: 'about',
			content_type: 'html',
			content_value:
				'<p>Ser el restaurante líder en cocina regional del norte, reconocido por nuestra excelencia en servicio, autenticidad en sabores y compromiso con la comunidad.</p>',
			label: 'Visión',
			display_order: 2,
		},
		{
			page_key: 'about_branch_count',
			section: 'about',
			content_type: 'text',
			content_value: '21',
			label: 'Número de sucursales',
			display_order: 3,
		},
		{
			page_key: 'contact_hero_title',
			section: 'contact',
			content_type: 'text',
			content_value: 'Contacto',
			label: 'Título Hero',
			display_order: 1,
		},
		{
			page_key: 'contact_form_intro',
			section: 'contact',
			content_type: 'text',
			content_value: 'Déjanos tu mensaje y nos pondremos en contacto contigo a la brevedad.',
			label: 'Intro Formulario',
			display_order: 2,
		},
	];

	const stmt = db.prepare(`
		INSERT INTO page_content (page_key, section, content_type, content_value, label, description, display_order, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())
	`);

	content.forEach((c) => {
		stmt.run(
			c.page_key,
			c.section,
			c.content_type,
			c.content_value,
			c.label,
			null,
			c.display_order,
		);
	});
};

runMigrations();
seedAdminUser();
seedBranches();
seedPageContent();

export const passwordUtils = {
	hashPassword,
};
