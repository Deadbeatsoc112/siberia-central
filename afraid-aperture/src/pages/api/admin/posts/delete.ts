import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { postsRepo } from '../../../../lib/content';
import { getDB } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador', request.url), 303);
	}

	const form = await request.formData();
	const id = Number(form.get('id'));
	if (Number.isFinite(id) && id > 0) {
		await postsRepo.remove(db, id);
	}

	return Response.redirect(new URL('/paneladministrador?tab=posts', request.url), 303);
};
