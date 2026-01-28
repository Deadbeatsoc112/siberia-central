import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { branchesRepo } from '../../../../lib/branches';

export const POST: APIRoute = async ({ request, cookies }) => {
	const user = auth.getUserFromCookies(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();

		const name = String(formData.get('name') || '').trim();
		const address = String(formData.get('address') || '').trim();
		const latitude = parseFloat(String(formData.get('latitude') || '0'));
		const longitude = parseFloat(String(formData.get('longitude') || '0'));
		const phones = String(formData.get('phones') || '')
			.split(',')
			.map((p) => p.trim())
			.filter(Boolean);
		const contactEmail = String(formData.get('contact_email') || '').trim();
		const isActive = formData.get('is_active') === 'on';
		const displayOrder = parseInt(String(formData.get('display_order') || '0'));

		if (!name || !address) {
			return Response.redirect(
				new URL('/paneladministrador?tab=branches&error=campos-requeridos', request.url),
				303,
			);
		}

		branchesRepo.create({
			name,
			address,
			latitude: latitude || undefined,
			longitude: longitude || undefined,
			phones,
			contactEmail: contactEmail || undefined,
			isActive,
			displayOrder,
		});

		return Response.redirect(new URL('/paneladministrador?tab=branches', request.url), 303);
	} catch (error) {
		console.error('Error al crear sucursal:', error);
		return Response.redirect(
			new URL('/paneladministrador?tab=branches&error=1', request.url),
			303,
		);
	}
};
