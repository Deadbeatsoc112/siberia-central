import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';
import { auth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, locals, redirect }) => {
	const db = getDB(locals);

	const form = await request.formData();
	const username = String(form.get('username') ?? '').trim();
	const password = String(form.get('password') ?? '');

	const user = await auth.authenticate(db, username, password);
	if (!user) {
		return redirect('/paneladministrador?error=1', 303);
	}

	const { sessionId, expiresAt } = await auth.createSession(db, user.id);
	auth.setSessionCookie(cookies, sessionId, expiresAt);

	return redirect('/paneladministrador', 303);
};
