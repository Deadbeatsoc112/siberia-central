import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';
import { messagesRepo } from '../../../lib/contactMessages';
import { checkRateLimit } from '../../../lib/rateLimit';
import { validateImageFile } from '../../../lib/fileValidation';
import { uploadFile } from '../../../lib/storage';

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
	const db = getDB(locals);

	try {
		const ip = clientAddress || 'unknown';

		if (!(await checkRateLimit(db, ip, 60, 3))) {
			return Response.redirect(
				new URL('/contacto?error=limite-excedido', request.url),
				303,
			);
		}

		const formData = await request.formData();

		const fullName = String(formData.get('full_name') || '').trim();
		const email = String(formData.get('email') || '').trim();
		const phone = String(formData.get('phone') || '').trim();
		const message = String(formData.get('message') || '').trim();
		const imageFile = formData.get('image') as File | null;

		if (!fullName || !email || !message) {
			return Response.redirect(
				new URL('/contacto?error=campos-requeridos', request.url),
				303,
			);
		}

		let imagePath: string | undefined;

		if (imageFile && imageFile.size > 0) {
			const validation = validateImageFile(imageFile);
			if (!validation.valid) {
				return Response.redirect(
					new URL(`/contacto?error=${validation.error}`, request.url),
					303,
				);
			}

			const ext = imageFile.name.split('.').pop();
			const timestamp = Date.now();
			const random = Math.random().toString(36).substring(2, 8);
			const fileName = `contact-img-${timestamp}-${random}.${ext}`;

			const year = new Date().getFullYear();
			const month = String(new Date().getMonth() + 1).padStart(2, '0');
			imagePath = `uploads/contact-images/${year}/${month}/${fileName}`;

			const bucket = locals.runtime?.env?.siberia_uploads;
			if (bucket) {
				await uploadFile(bucket, imageFile, imagePath);
			}
		}

		await messagesRepo.create(db, {
			fullName,
			email,
			phone: phone || undefined,
			message,
			ipAddress: ip,
			imagePath,
		});

		return Response.redirect(new URL('/contacto?success=1', request.url), 303);
	} catch (error) {
		console.error('Error al procesar mensaje de contacto:', error);
		return Response.redirect(new URL('/contacto?error=servidor', request.url), 303);
	}
};
