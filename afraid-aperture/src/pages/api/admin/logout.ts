import type { APIRoute } from 'astro';
import { auth } from '../../../lib/auth';
import { getDB } from '../../../lib/db';

export const POST: APIRoute = async ({ cookies, locals, redirect }) => {
	const db = getDB(locals);
	const sessionId = cookies.get(auth.SESSION_COOKIE)?.value;
	if (sessionId) {
		await auth.deleteSessionById(db, sessionId);
	}
	auth.clearSessionCookie(cookies);
	return redirect('/paneladministrador', 303);
};
