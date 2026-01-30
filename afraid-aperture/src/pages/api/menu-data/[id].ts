import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';
import { menusRepo, categoriesRepo, itemsRepo } from '../../../lib/menus';

export const GET: APIRoute = async ({ params, locals }) => {
	const db = getDB(locals);
	const menuId = parseInt(params.id || '0');

	if (!menuId) {
		return new Response(JSON.stringify({ error: 'Invalid menu ID' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const menu = await menusRepo.getById(db, menuId);
		if (!menu || !menu.is_active) {
			return new Response(JSON.stringify({ error: 'Menu not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const categories = await categoriesRepo.listByMenu(db, menuId);
		const categoriesWithItems = await Promise.all(
			categories.map(async (category) => ({
				...category,
				items: await itemsRepo.listByCategory(db, category.id),
			}))
		);

		return new Response(
			JSON.stringify({
				id: menu.id,
				name: menu.name,
				categories: categoriesWithItems,
			}),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('Error fetching menu data:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};
