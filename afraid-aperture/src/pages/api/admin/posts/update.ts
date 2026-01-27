import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { postsRepo } from '../../../../lib/content';

export const POST: APIRoute = async ({ request, cookies }) => {
	const user = auth.getUserFromCookies(cookies);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador', request.url), 303);
	}

	const form = await request.formData();
	const id = Number(form.get('id'));
	if (!Number.isFinite(id) || id <= 0) {
		return Response.redirect(new URL('/paneladministrador?tab=posts&error=1', request.url), 303);
	}

	const title = String(form.get('title') ?? '').trim();
	const excerpt = String(form.get('excerpt') ?? '').trim();
	const content = String(form.get('content') ?? '').trim();
	const imageUrl = String(form.get('imageUrl') ?? '').trim();
	const published = form.get('published') === 'on';

	postsRepo.update(id, {
		title,
		excerpt,
		content,
		imageUrl: imageUrl || undefined,
		published,
	});

	return Response.redirect(new URL('/paneladministrador?tab=posts', request.url), 303);
};
