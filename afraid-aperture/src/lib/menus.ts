import type { D1Database } from '@cloudflare/workers-types';
import { dbGet, dbAll, dbRun } from './db';

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
	imageUrl?: string;
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

export const menusRepo = {
	async listAll(db: D1Database) {
		return await dbAll<{
			id: number;
			branch_id: number;
			name: string;
			pdf_url: string | null;
			display_order: number;
			is_active: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM menus ORDER BY display_order, name');
	},

	async listByBranch(db: D1Database, branchId: number) {
		return await dbAll<{
			id: number;
			branch_id: number;
			name: string;
			pdf_url: string | null;
			display_order: number;
			is_active: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM menus WHERE branch_id = ? ORDER BY display_order, name', [branchId]);
	},

	async getById(db: D1Database, id: number) {
		return await dbGet<{
			id: number;
			branch_id: number;
			name: string;
			pdf_url: string | null;
			display_order: number;
			is_active: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM menus WHERE id = ?', [id]);
	},

	async getByBranchSlug(db: D1Database, slug: string) {
		const branch = await dbGet<{ id: number; name: string; slug: string }>(
			db,
			'SELECT * FROM branches WHERE slug = ?',
			[slug],
		);
		if (!branch) return null;

		const menus = await menusRepo.listByBranch(db, branch.id);
		const result = await Promise.all(
			menus.map(async (menu) => {
				const categories = await categoriesRepo.listByMenu(db, menu.id);
				return {
					...menu,
					categories: await Promise.all(
						categories.map(async (cat) => ({
							...cat,
							items: await itemsRepo.listByCategory(db, cat.id),
						})),
					),
				};
			}),
		);

		return {
			branch,
			menus: result,
		};
	},

	async create(db: D1Database, input: MenuInput) {
		const result = await dbRun(
			db,
			`INSERT INTO menus (branch_id, name, pdf_url, display_order, is_active)
			 VALUES (?, ?, ?, ?, ?)`,
			[
				input.branchId,
				input.name,
				input.pdfUrl ?? null,
				input.displayOrder ?? 0,
				input.isActive === false ? 0 : 1,
			],
		);
		return result.meta.last_row_id as number;
	},

	async update(db: D1Database, id: number, input: MenuInput) {
		const current = await menusRepo.getById(db, id);
		if (!current) return false;

		await dbRun(
			db,
			`UPDATE menus
			 SET branch_id = ?, name = ?, pdf_url = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
			 WHERE id = ?`,
			[
				input.branchId || current.branch_id,
				input.name || current.name,
				input.pdfUrl ?? current.pdf_url,
				input.displayOrder ?? current.display_order,
				input.isActive === false ? 0 : 1,
				id,
			],
		);
		return true;
	},

	async remove(db: D1Database, id: number) {
		await dbRun(db, 'DELETE FROM menus WHERE id = ?', [id]);
	},
};

export const categoriesRepo = {
	async listByMenu(db: D1Database, menuId: number) {
		return await dbAll<{
			id: number;
			menu_id: number;
			name: string;
			image_url: string | null;
			display_order: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM menu_categories WHERE menu_id = ? ORDER BY display_order, name', [menuId]);
	},

	async getById(db: D1Database, id: number) {
		return await dbGet<{
			id: number;
			menu_id: number;
			name: string;
			image_url: string | null;
			display_order: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM menu_categories WHERE id = ?', [id]);
	},

	async create(db: D1Database, input: MenuCategoryInput) {
		const result = await dbRun(
			db,
			`INSERT INTO menu_categories (menu_id, name, image_url, display_order)
			 VALUES (?, ?, ?, ?)`,
			[input.menuId, input.name, input.imageUrl ?? null, input.displayOrder ?? 0],
		);
		return result.meta.last_row_id as number;
	},

	async update(db: D1Database, id: number, input: MenuCategoryInput) {
		const current = await categoriesRepo.getById(db, id);
		if (!current) return false;

		await dbRun(
			db,
			`UPDATE menu_categories
			 SET menu_id = ?, name = ?, image_url = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
			 WHERE id = ?`,
			[
				input.menuId || current.menu_id,
				input.name || current.name,
				input.imageUrl ?? current.image_url,
				input.displayOrder ?? current.display_order,
				id,
			],
		);
		return true;
	},

	async remove(db: D1Database, id: number) {
		await dbRun(db, 'DELETE FROM menu_categories WHERE id = ?', [id]);
	},
};

export const itemsRepo = {
	async listByCategory(db: D1Database, categoryId: number) {
		return await dbAll<{
			id: number;
			category_id: number;
			name: string;
			description: string | null;
			price: number;
			image_url: string | null;
			is_available: number;
			display_order: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM menu_items WHERE category_id = ? ORDER BY display_order, name', [
			categoryId,
		]);
	},

	async getById(db: D1Database, id: number) {
		return await dbGet<{
			id: number;
			category_id: number;
			name: string;
			description: string | null;
			price: number;
			image_url: string | null;
			is_available: number;
			display_order: number;
			created_at: string;
			updated_at: string;
		}>(db, 'SELECT * FROM menu_items WHERE id = ?', [id]);
	},

	async create(db: D1Database, input: MenuItemInput) {
		const result = await dbRun(
			db,
			`INSERT INTO menu_items (category_id, name, description, price, image_url, is_available, display_order)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				input.categoryId,
				input.name,
				input.description ?? null,
				input.price,
				input.imageUrl ?? null,
				input.isAvailable === false ? 0 : 1,
				input.displayOrder ?? 0,
			],
		);
		return result.meta.last_row_id as number;
	},

	async update(db: D1Database, id: number, input: MenuItemInput) {
		const current = await itemsRepo.getById(db, id);
		if (!current) return false;

		await dbRun(
			db,
			`UPDATE menu_items
			 SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?,
			     is_available = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP
			 WHERE id = ?`,
			[
				input.categoryId || current.category_id,
				input.name || current.name,
				input.description ?? current.description,
				input.price ?? current.price,
				input.imageUrl ?? current.image_url,
				input.isAvailable === false ? 0 : 1,
				input.displayOrder ?? current.display_order,
				id,
			],
		);
		return true;
	},

	async remove(db: D1Database, id: number) {
		await dbRun(db, 'DELETE FROM menu_items WHERE id = ?', [id]);
	},
};
