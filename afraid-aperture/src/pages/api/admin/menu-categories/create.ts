import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { categoriesRepo } from '../../../../lib/menus';

export const POST: APIRoute = async ({ request, cookies }) => {
	const user = auth.getUserFromCookies(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();

		const menuId = parseInt(String(formData.get('menu_id') || '0'));
		const name = String(formData.get('name') || '').trim();
		const displayOrder = parseInt(String(formData.get('display_order') || '0'));

		if (!menuId || !name) {
			return Response.redirect(
				new URL('/paneladministrador?tab=menus&error=campos-requeridos', request.url),
				303,
			);
		}

		categoriesRepo.create({
			menuId,
			name,
			displayOrder,
		});

		return Response.redirect(new URL('/paneladministrador?tab=menus', request.url), 303);
	} catch (error) {
		console.error('Error al crear categoría:', error);
		return Response.redirect(new URL('/paneladministrador?tab=menus&error=1', request.url), 303);
	}
};
