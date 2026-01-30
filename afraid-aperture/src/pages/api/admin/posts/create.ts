import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { postsRepo } from '../../../../lib/content';
import { getDB } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador', request.url), 303);
	}

	const form = await request.formData();
	const title = String(form.get('title') ?? '').trim();
	const excerpt = String(form.get('excerpt') ?? '').trim();
	const content = String(form.get('content') ?? '').trim();
	const imageUrl = String(form.get('imageUrl') ?? '').trim();
	const published = form.get('published') === 'on';

	if (!title || !excerpt || !content) {
		return Response.redirect(new URL('/paneladministrador?tab=posts&error=1', request.url), 303);
	}

	await postsRepo.create(db, {
		title,
		excerpt,
		content,
		imageUrl: imageUrl || undefined,
		published,
	});

	return Response.redirect(new URL('/paneladministrador?tab=posts', request.url), 303);
};
