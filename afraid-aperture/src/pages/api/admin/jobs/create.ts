import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { jobsRepo } from '../../../../lib/content';

export const POST: APIRoute = async ({ request, cookies }) => {
	const user = auth.getUserFromCookies(cookies);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador', request.url), 303);
	}

	const form = await request.formData();
	const title = String(form.get('title') ?? '').trim();
	const location = String(form.get('location') ?? '').trim();
	const type = String(form.get('type') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const isActive = form.get('is_active') === 'on';
	const availablePositions = Number(form.get('available_positions')) || 1;

	if (!title || !location || !type || !description) {
		return Response.redirect(new URL('/paneladministrador?tab=jobs&error=1', request.url), 303);
	}

	jobsRepo.create({ title, location, type, description, isActive, availablePositions });

	return Response.redirect(new URL('/paneladministrador?tab=jobs', request.url), 303);
};
