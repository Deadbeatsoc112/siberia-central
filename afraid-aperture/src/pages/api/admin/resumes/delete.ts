import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { resumesRepo } from '../../../../lib/resumes';
import { deleteFile } from '../../../../lib/storage';
import { getDB } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();
		const id = parseInt(String(formData.get('id') || '0'));

		if (!id) {
			return Response.redirect(
				new URL('/paneladministrador?tab=resumes&error=id-invalido', request.url),
				303,
			);
		}

		const resume = await resumesRepo.getById(db, id);
		if (resume) {
			const bucket = locals.runtime?.env?.UPLOADS_BUCKET;
			if (bucket) {
				await deleteFile(bucket, resume.file_path);
			}
		}

		await resumesRepo.remove(db, id);

		return Response.redirect(new URL('/paneladministrador?tab=resumes', request.url), 303);
	} catch (error) {
		console.error('Error al eliminar CV:', error);
		return Response.redirect(
			new URL('/paneladministrador?tab=resumes&error=1', request.url),
			303,
		);
	}
};
