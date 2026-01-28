import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { itemsRepo } from '../../../../lib/menus';

export const POST: APIRoute = async ({ request, cookies }) => {
	const user = auth.getUserFromCookies(cookies);
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

		itemsRepo.remove(id);

		return Response.redirect(new URL('/paneladministrador?tab=menus', request.url), 303);
	} catch (error) {
		console.error('Error al eliminar item:', error);
		return Response.redirect(new URL('/paneladministrador?tab=menus&error=1', request.url), 303);
	}
};
