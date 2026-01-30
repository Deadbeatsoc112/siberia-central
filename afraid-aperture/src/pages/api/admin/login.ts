import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';
import { auth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);

	const form = await request.formData();
	const username = String(form.get('username') ?? '').trim();
	const password = String(form.get('password') ?? '');

	const user = await auth.authenticate(db, username, password);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador?error=1', request.url), 303);
	}

	const { sessionId, expiresAt } = await auth.createSession(db, user.id);
	auth.setSessionCookie(cookies, sessionId, expiresAt);

	return Response.redirect(new URL('/paneladministrador', request.url), 303);
};
