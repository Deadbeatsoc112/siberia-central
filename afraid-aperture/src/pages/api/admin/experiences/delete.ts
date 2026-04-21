import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { experienceImagesRepo } from '../../../../lib/experiences';
import { deleteFile } from '../../../../lib/storage';
import { getDB } from '../../../../lib/db';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador', request.url), 303);
	}

	try {
		const formData = await request.formData();
		const id = parseInt(String(formData.get('id') || '0'));
		if (!id) {
			return Response.redirect(
				new URL('/paneladministrador?tab=experiences&error=id-invalido', request.url),
				303,
			);
		}

		const image = await experienceImagesRepo.getById(db, id);
		if (image && image.storage_path) {
			const bucket = locals.runtime?.env?.siberia_uploads;
			if (bucket) {
				try {
					await deleteFile(bucket, image.storage_path);
				} catch (err) {
					console.error('Error deleting R2 object:', err);
				}
			}
		}

		await experienceImagesRepo.remove(db, id);

		return Response.redirect(
			new URL('/paneladministrador?tab=experiences&success=deleted', request.url),
			303,
		);
	} catch (error) {
		console.error('Error deleting experience image:', error);
		return Response.redirect(
			new URL('/paneladministrador?tab=experiences&error=servidor', request.url),
			303,
		);
	}
};
