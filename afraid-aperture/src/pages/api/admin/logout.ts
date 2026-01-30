import type { APIRoute } from 'astro';
import { auth } from '../../../lib/auth';
import { getDB } from '../../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const sessionId = cookies.get(auth.SESSION_COOKIE)?.value;
	if (sessionId) {
		await auth.deleteSessionById(db, sessionId);
	}
	auth.clearSessionCookie(cookies);
	return Response.redirect(new URL('/paneladministrador', request.url), 303);
};
