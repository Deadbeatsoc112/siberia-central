import type { APIRoute } from 'astro';
import { auth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
	const form = await request.formData();
	const username = String(form.get('username') ?? '').trim();
	const password = String(form.get('password') ?? '');

	const user = auth.authenticate(username, password);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador?error=1', request.url), 303);
	}

	const { sessionId, expiresAt } = auth.createSession(user.id);
	auth.setSessionCookie(cookies, sessionId, expiresAt);

	return Response.redirect(new URL('/paneladministrador', request.url), 303);
};
