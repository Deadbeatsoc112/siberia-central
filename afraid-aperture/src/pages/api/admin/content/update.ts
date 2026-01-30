import type { APIRoute } from 'astro';
import { getDB } from '../../../../lib/db';
import { auth } from '../../../../lib/auth';
import { pageContentRepo } from '../../../../lib/pageContent';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);

	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();

		const pageKey = String(formData.get('page_key') || '').trim();
		const contentValue = String(formData.get('content_value') || '').trim();

		if (!pageKey || !contentValue) {
			return Response.redirect(
				new URL('/paneladministrador?tab=content&error=campos-requeridos', request.url),
				303,
			);
		}

		await pageContentRepo.update(db, pageKey, contentValue);

		return Response.redirect(new URL('/paneladministrador?tab=content', request.url), 303);
	} catch (error) {
		console.error('Error al actualizar contenido:', error);
		return Response.redirect(
			new URL('/paneladministrador?tab=content&error=1', request.url),
			303,
		);
	}
};
