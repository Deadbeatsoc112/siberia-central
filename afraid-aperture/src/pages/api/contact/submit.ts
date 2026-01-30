import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';
import { messagesRepo } from '../../../lib/contactMessages';
import { checkRateLimit } from '../../../lib/rateLimit';

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

		if (!fullName || !email || !message) {
			return Response.redirect(
				new URL('/contacto?error=campos-requeridos', request.url),
				303,
			);
		}

		await messagesRepo.create(db, {
			fullName,
			email,
			phone: phone || undefined,
			message,
			ipAddress: ip,
		});

		return Response.redirect(new URL('/contacto?success=1', request.url), 303);
	} catch (error) {
		console.error('Error al procesar mensaje de contacto:', error);
		return Response.redirect(new URL('/contacto?error=servidor', request.url), 303);
	}
};
