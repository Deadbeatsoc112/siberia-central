import { db } from './db';

export type MenuInput = {
	branchId: number;
	name: string;
	pdfUrl?: string;
	displayOrder?: number;
	isActive?: boolean;
};

export type MenuCategoryInput = {
	menuId: number;
	name: string;
	displayOrder?: number;
};

export type MenuItemInput = {
	categoryId: number;
	name: string;
	description?: string;
	price: number;
	imageUrl?: string;
	isAvailable?: boolean;
	displayOrder?: number;
};

const nowEpoch = () => Math.floor(Date.now() / 1000);

export const menusRepo = {
	listAll: () =>
		db.prepare('SELECT * FROM menus ORDER BY display_order, name').all() as Array<{
			id: number;
			branch_id: number;
			name: string;
			pdf_url: string | null;
			display_order: number;
			is_active: number;
			created_at: number;
			updated_at: number;
		}>,

	listByBranch: (branchId: number) =>
		db
			.prepare('SELECT * FROM menus WHERE branch_id = ? ORDER BY display_order, name')
			.all(branchId) as Array<{
			id: number;
			branch_id: number;
			name: string;
			display_order: number;
			is_active: number;
			created_at: number;
			updated_at: number;
		}>,

	getById: (id: number) =>
		db.prepare('SELECT * FROM menus WHERE id = ?').get(id) as
			| {
					id: number;
					branch_id: number;
					name: string;
					display_order: number;
					is_active: number;
					created_at: number;
					updated_at: number;
			  }
			| undefined,

	getByBranchSlug: (slug: string) => {
		const branch = db.prepare('SELECT * FROM branches WHERE slug = ?').get(slug) as
			| { id: number; name: string; slug: string }
			| undefined;
		if (!branch) return null;

		const menus = menusRepo.listByBranch(branch.id);
		const result = menus.map((menu) => {
			const categories = categoriesRepo.listByMenu(menu.id);
			return {
				...menu,
				categories: categories.map((cat) => ({
					...cat,
					items: itemsRepo.listByCategory(cat.id),
				})),
			};
		});

		return {
			branch,
			menus: result,
		};
	},

	create: (input: MenuInput) => {
		const ts = nowEpoch();
		const result = db
			.prepare(
				`INSERT INTO menus (branch_id, name, pdf_url, display_order, is_active, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			)
			.run(
				input.branchId,
				input.name,
				input.pdfUrl ?? null,
				input.displayOrder ?? 0,
				input.isActive === false ? 0 : 1,
				ts,
				ts,
			);
		return Number(result.lastInsertRowid);
	},

	update: (id: number, input: MenuInput) => {
		const ts = nowEpoch();
		const current = menusRepo.getById(id);
		if (!current) return false;

		db.prepare(
			`UPDATE menus
			 SET branch_id = ?, name = ?, pdf_url = ?, display_order = ?, is_active = ?, updated_at = ?
			 WHERE id = ?`,
		).run(
			input.branchId || current.branch_id,
			input.name || current.name,
			input.pdfUrl ?? (current as any).pdf_url,
			input.displayOrder ?? current.display_order,
			input.isActive === false ? 0 : 1,
			ts,
			id,
		);
		return true;
	},

	remove: (id: number) => {
		db.prepare('DELETE FROM menus WHERE id = ?').run(id);
	},
};

export const categoriesRepo = {
	listByMenu: (menuId: number) =>
		db
			.prepare('SELECT * FROM menu_categories WHERE menu_id = ? ORDER BY display_order, name')
			.all(menuId) as Array<{
			id: number;
			menu_id: number;
			name: string;
			display_order: number;
			created_at: number;
			updated_at: number;
		}>,

	getById: (id: number) =>
		db.prepare('SELECT * FROM menu_categories WHERE id = ?').get(id) as
			| {
					id: number;
					menu_id: number;
					name: string;
					display_order: number;
					created_at: number;
					updated_at: number;
			  }
			| undefined,

	create: (input: MenuCategoryInput) => {
		const ts = nowEpoch();
		const result = db
			.prepare(
				`INSERT INTO menu_categories (menu_id, name, display_order, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?)`,
			)
			.run(input.menuId, input.name, input.displayOrder ?? 0, ts, ts);
		return Number(result.lastInsertRowid);
	},

	update: (id: number, input: MenuCategoryInput) => {
		const ts = nowEpoch();
		const current = categoriesRepo.getById(id);
		if (!current) return false;

		db.prepare(
			`UPDATE menu_categories
			 SET menu_id = ?, name = ?, display_order = ?, updated_at = ?
			 WHERE id = ?`,
		).run(
			input.menuId || current.menu_id,
			input.name || current.name,
			input.displayOrder ?? current.display_order,
			ts,
			id,
		);
		return true;
	},

	remove: (id: number) => {
		db.prepare('DELETE FROM menu_categories WHERE id = ?').run(id);
	},
};

export const itemsRepo = {
	listByCategory: (categoryId: number) =>
		db
			.prepare('SELECT * FROM menu_items WHERE category_id = ? ORDER BY display_order, name')
			.all(categoryId) as Array<{
			id: number;
			category_id: number;
			name: string;
			description: string | null;
			price: number;
			image_url: string | null;
			is_available: number;
			display_order: number;
			created_at: number;
			updated_at: number;
		}>,

	getById: (id: number) =>
		db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as
			| {
					id: number;
					category_id: number;
					name: string;
					description: string | null;
					price: number;
					image_url: string | null;
					is_available: number;
					display_order: number;
					created_at: number;
					updated_at: number;
			  }
			| undefined,

	create: (input: MenuItemInput) => {
		const ts = nowEpoch();
		const result = db
			.prepare(
				`INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, display_order, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.run(
				input.categoryId,
				input.name,
				input.description ?? null,
				input.price,
				input.imageUrl ?? null,
				input.isAvailable === false ? 0 : 1,
				input.displayOrder ?? 0,
				ts,
				ts,
			);
		return Number(result.lastInsertRowid);
	},

	update: (id: number, input: MenuItemInput) => {
		const ts = nowEpoch();
		const current = itemsRepo.getById(id);
		if (!current) return false;

		db.prepare(
			`UPDATE menu_items
			 SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?,
			     is_available = ?, display_order = ?, updated_at = ?
			 WHERE id = ?`,
		).run(
			input.categoryId || current.category_id,
			input.name || current.name,
			input.description ?? current.description,
			input.price ?? current.price,
			input.imageUrl ?? current.image_url,
			input.isAvailable === false ? 0 : 1,
			input.displayOrder ?? current.display_order,
			ts,
			id,
		);
		return true;
	},

	remove: (id: number) => {
		db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
	},
};
