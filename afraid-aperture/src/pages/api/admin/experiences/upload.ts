import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { experienceImagesRepo } from '../../../../lib/experiences';
import { uploadFile } from '../../../../lib/storage';
import { getDB } from '../../../../lib/db';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return Response.redirect(new URL('/paneladministrador', request.url), 303);
	}

	try {
		const formData = await request.formData();
		const files = formData.getAll('images') as File[];
		const title = String(formData.get('title') || '').trim();

		const validFiles = files.filter((f) => f instanceof File && f.size > 0);
		if (validFiles.length === 0) {
			return Response.redirect(
				new URL('/paneladministrador?tab=experiences&error=sin-archivos', request.url),
				303,
			);
		}

		const bucket = locals.runtime?.env?.siberia_uploads;
		if (!bucket) {
			return Response.redirect(
				new URL('/paneladministrador?tab=experiences&error=storage', request.url),
				303,
			);
		}

		let uploaded = 0;
		for (const file of validFiles) {
			if (!ALLOWED_TYPES.includes(file.type)) continue;
			if (file.size > MAX_SIZE) continue;

			const timestamp = Date.now();
			const random = Math.random().toString(36).substring(2, 8);
			const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
			const fileName = `exp-${timestamp}-${random}.${ext}`;
			const filePath = `uploads/experiences/${fileName}`;

			await uploadFile(bucket, file, filePath);

			await experienceImagesRepo.create(db, {
				imageUrl: `/api/media/${filePath}`,
				storagePath: filePath,
				title: title || null,
				displayOrder: 0,
			});
			uploaded += 1;
		}

		if (uploaded === 0) {
			return Response.redirect(
				new URL('/paneladministrador?tab=experiences&error=formato-invalido', request.url),
				303,
			);
		}

		return Response.redirect(
			new URL('/paneladministrador?tab=experiences&success=uploaded', request.url),
			303,
		);
	} catch (error) {
		console.error('Error uploading experience images:', error);
		return Response.redirect(
			new URL('/paneladministrador?tab=experiences&error=servidor', request.url),
			303,
		);
	}
};
