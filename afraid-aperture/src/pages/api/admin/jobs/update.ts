import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { jobsRepo } from '../../../../lib/content';
import { getDB } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador', request.url), 303);
	}

	const form = await request.formData();
	const id = Number(form.get('id'));
	if (!Number.isFinite(id) || id <= 0) {
		return Response.redirect(new URL('/paneladministrador?tab=jobs&error=1', request.url), 303);
	}

	const title = String(form.get('title') ?? '').trim();
	const location = String(form.get('location') ?? '').trim();
	const type = String(form.get('type') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const isActive = form.get('is_active') === 'on';
	const availablePositions = Number(form.get('available_positions')) || 1;

	await jobsRepo.update(db, id, { title, location, type, description, isActive, availablePositions });

	return Response.redirect(new URL('/paneladministrador?tab=jobs', request.url), 303);
};
