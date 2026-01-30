import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { itemsRepo } from '../../../../lib/menus';
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
		const categoryId = parseInt(String(formData.get('category_id') || '0'));
		const name = String(formData.get('name') || '').trim();
		const description = String(formData.get('description') || '').trim();
		const price = parseFloat(String(formData.get('price') || '0'));
		const imageUrl = String(formData.get('image_url') || '').trim();
		const isAvailable = formData.get('is_available') === 'on';
		const displayOrder = parseInt(String(formData.get('display_order') || '0'));

		if (!id || !categoryId || !name || !price) {
			return Response.redirect(
				new URL('/paneladministrador?tab=menus&error=campos-requeridos', request.url),
				303,
			);
		}

		await itemsRepo.update(db, id, {
			categoryId,
			name,
			description: description || undefined,
			price,
			imageUrl: imageUrl || undefined,
			isAvailable,
			displayOrder,
		});

		return Response.redirect(new URL('/paneladministrador?tab=menus', request.url), 303);
	} catch (error) {
		console.error('Error al actualizar item:', error);
		return Response.redirect(new URL('/paneladministrador?tab=menus&error=1', request.url), 303);
	}
};
