import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { jobsRepo } from '../../../../lib/content';

export const POST: APIRoute = async ({ request, cookies }) => {
	const user = auth.getUserFromCookies(cookies);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador', request.url), 303);
	}

	const form = await request.formData();
	const id = Number(form.get('id'));
	if (Number.isFinite(id) && id > 0) {
		jobsRepo.remove(id);
	}

	return Response.redirect(new URL('/paneladministrador?tab=jobs', request.url), 303);
};
