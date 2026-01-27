import type { APIRoute } from 'astro';
import { auth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
	const sessionId = cookies.get(auth.SESSION_COOKIE)?.value;
	if (sessionId) {
		auth.deleteSessionById(sessionId);
	}
	auth.clearSessionCookie(cookies);
	return Response.redirect(new URL('/paneladministrador', request.url), 303);
};
