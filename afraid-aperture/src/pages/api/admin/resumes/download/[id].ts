import type { APIRoute } from 'astro';
import { auth } from '../../../../../lib/auth';
import { resumesRepo } from '../../../../../lib/resumes';
import { getFile } from '../../../../../lib/storage';
import { getDB } from '../../../../../lib/db';

export const GET: APIRoute = async ({ params, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const id = parseInt(params.id || '0');
		if (!id) {
			return new Response('Invalid ID', { status: 400 });
		}

		const resume = await resumesRepo.getById(db, id);
		if (!resume) {
			return new Response('Resume not found', { status: 404 });
		}

		const bucket = locals.runtime?.env?.siberia_uploads;
		if (!bucket) {
			return new Response('Storage not available', { status: 500 });
		}

		const fileData = await getFile(bucket, resume.file_path);
		if (!fileData) {
			return new Response('File not found', { status: 404 });
		}

		const ext = resume.file_name.split('.').pop()?.toLowerCase();
		let mimeType = 'application/octet-stream';
		if (ext === 'pdf') mimeType = 'application/pdf';
		else if (ext === 'doc') mimeType = 'application/msword';
		else if (ext === 'docx')
			mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

		return new Response(fileData, {
			headers: {
				'Content-Type': mimeType,
				'Content-Disposition': `attachment; filename="${resume.file_name}"`,
			},
		});
	} catch (error) {
		console.error('Error al descargar CV:', error);
		return new Response('Error downloading file', { status: 500 });
	}
};
