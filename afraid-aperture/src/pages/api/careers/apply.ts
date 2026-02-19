import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';
import { resumesRepo } from '../../../lib/resumes';
import { validateCvFile } from '../../../lib/fileValidation';
import { uploadFile } from '../../../lib/storage';

export const POST: APIRoute = async ({ request, locals }) => {
	const db = getDB(locals);

	try {
		const formData = await request.formData();

		const jobId = parseInt(String(formData.get('job_id') || '0'));
		const fullName = String(formData.get('full_name') || '').trim();
		const email = String(formData.get('email') || '').trim();
		const phone = String(formData.get('phone') || '').trim();
		const position = String(formData.get('position') || '').trim();
		const cvFile = formData.get('cv_file') as File | null;

		if (!fullName || !email || !phone || !cvFile) {
			return Response.redirect(
				new URL('/bolsa-de-trabajo?error=campos-requeridos', request.url),
				303,
			);
		}

		const validation = validateCvFile(cvFile);
		if (!validation.valid) {
			return Response.redirect(
				new URL(`/bolsa-de-trabajo?error=${validation.error}`, request.url),
				303,
			);
		}

		const ext = cvFile.name.split('.').pop();
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 8);
		const fileName = `resume-${timestamp}-${random}.${ext}`;

		const year = new Date().getFullYear();
		const month = String(new Date().getMonth() + 1).padStart(2, '0');
		const filePath = `uploads/cvs/${year}/${month}/${fileName}`;

		const bucket = locals.runtime?.env?.siberia_uploads;
		if (bucket) {
			await uploadFile(bucket, cvFile, filePath);
		}

		await resumesRepo.create(db, {
			jobId: jobId > 0 ? jobId : null,
			fullName,
			email,
			phone,
			filePath,
			fileName: cvFile.name,
			fileSize: cvFile.size,
			positionApplied: position,
			status: 'pending',
		});

		return Response.redirect(new URL('/bolsa-de-trabajo?success=1', request.url), 303);
	} catch (error) {
		console.error('Error al procesar CV:', error);
		return Response.redirect(new URL('/bolsa-de-trabajo?error=servidor', request.url), 303);
	}
};
