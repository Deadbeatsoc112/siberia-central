import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { menusRepo } from '../../../../lib/menus';
import { getDB } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();

		const branchId = parseInt(String(formData.get('branch_id') || '0'));
		const name = String(formData.get('name') || '').trim();
		const displayOrder = parseInt(String(formData.get('display_order') || '0'));
		const isActive = formData.get('is_active') === 'on';

		if (!branchId || !name) {
			return Response.redirect(
				new URL('/paneladministrador?tab=menus&error=campos-requeridos', request.url),
				303,
			);
		}

		await menusRepo.create(db, {
			branchId,
			name,
			displayOrder,
			isActive,
		});

		return Response.redirect(new URL('/paneladministrador?tab=menus', request.url), 303);
	} catch (error) {
		console.error('Error al crear menú:', error);
		return Response.redirect(new URL('/paneladministrador?tab=menus&error=1', request.url), 303);
	}
};
