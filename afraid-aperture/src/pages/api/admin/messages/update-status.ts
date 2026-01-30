import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { messagesRepo } from '../../../../lib/contactMessages';
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
		const status = String(formData.get('status') || '').trim();

		if (!id || !status) {
			return Response.redirect(
				new URL('/paneladministrador?tab=messages&error=campos-requeridos', request.url),
				303,
			);
		}

		await messagesRepo.updateStatus(db, id, status);

		return Response.redirect(new URL('/paneladministrador?tab=messages', request.url), 303);
	} catch (error) {
		console.error('Error al actualizar estado del mensaje:', error);
		return Response.redirect(
			new URL('/paneladministrador?tab=messages&error=1', request.url),
			303,
		);
	}
};
