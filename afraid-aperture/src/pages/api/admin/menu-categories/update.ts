import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { categoriesRepo } from '../../../../lib/menus';
import { getDB } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();

		const id = parseInt(String(formData.get('id') || '0'));
		const menuId = parseInt(String(formData.get('menu_id') || '0'));
		const name = String(formData.get('name') || '').trim();
		const displayOrder = parseInt(String(formData.get('display_order') || '0'));

		if (!id || !menuId || !name) {
			return Response.redirect(
				new URL('/paneladministrador?tab=menus&error=campos-requeridos', request.url),
				303,
			);
		}

		await categoriesRepo.update(db, id, {
			menuId,
			name,
			displayOrder,
		});

		return Response.redirect(new URL('/paneladministrador?tab=menus', request.url), 303);
	} catch (error) {
		console.error('Error al actualizar categoría:', error);
		return Response.redirect(new URL('/paneladministrador?tab=menus&error=1', request.url), 303);
	}
};
