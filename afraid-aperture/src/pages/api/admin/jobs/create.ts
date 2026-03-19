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
	const title = String(form.get('title') ?? '').trim();
	const location = String(form.get('location') ?? '').trim();
	const type = String(form.get('type') ?? '').trim();
	const description = String(form.get('description') ?? '').trim();
	const isActive = form.get('is_active') === 'on';
	const availablePositionsRaw = Number(form.get('available_positions'));
	const availablePositions = Number.isFinite(availablePositionsRaw) && availablePositionsRaw > 0
		? Math.floor(availablePositionsRaw)
		: 1;

	if (!title || !location || !type || !description) {
		return Response.redirect(new URL('/paneladministrador?tab=jobs&error=1', request.url), 303);
	}

	try {
		await jobsRepo.create(db, { title, location, type, description, isActive, availablePositions });
	} catch (error) {
		console.error('Failed to create job vacancy:', error);
		return Response.redirect(new URL('/paneladministrador?tab=jobs&error=create-failed', request.url), 303);
	}

	return Response.redirect(new URL('/paneladministrador?tab=jobs&success=created', request.url), 303);
};
