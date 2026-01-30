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

		if (!id) {
			return Response.redirect(
				new URL('/paneladministrador?tab=menus&error=id-invalido', request.url),
				303,
			);
		}

		await categoriesRepo.remove(db, id);

		return Response.redirect(new URL('/paneladministrador?tab=menus', request.url), 303);
	} catch (error) {
		console.error('Error al eliminar categoría:', error);
		return Response.redirect(new URL('/paneladministrador?tab=menus&error=1', request.url), 303);
	}
};
