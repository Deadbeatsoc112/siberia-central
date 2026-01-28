import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { resumesRepo } from '../../../../lib/resumes';

export const POST: APIRoute = async ({ request, cookies }) => {
	const user = auth.getUserFromCookies(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();

		const id = parseInt(String(formData.get('id') || '0'));
		const notes = String(formData.get('notes') || '').trim();

		if (!id) {
			return Response.redirect(
				new URL('/paneladministrador?tab=resumes&error=id-invalido', request.url),
				303,
			);
		}

		resumesRepo.addNote(id, notes);

		return Response.redirect(new URL('/paneladministrador?tab=resumes', request.url), 303);
	} catch (error) {
		console.error('Error al agregar nota:', error);
		return Response.redirect(
			new URL('/paneladministrador?tab=resumes&error=1', request.url),
			303,
		);
	}
};
