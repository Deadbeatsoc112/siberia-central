import type { APIRoute } from 'astro';
import { auth } from '../../../../lib/auth';
import { menusRepo } from '../../../../lib/menus';
import { uploadFile } from '../../../../lib/storage';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const user = auth.getUserFromCookies(cookies);
	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();

		const menuId = parseInt(String(formData.get('menu_id') || '0'));
		const pdfFile = formData.get('pdf_file') as File | null;

		if (!menuId || !pdfFile) {
			return Response.redirect(
				new URL('/paneladministrador?tab=menus&error=campos-requeridos', request.url),
				303,
			);
		}

		// Validate PDF
		if (pdfFile.type !== 'application/pdf') {
			return Response.redirect(
				new URL('/paneladministrador?tab=menus&error=formato-invalido', request.url),
				303,
			);
		}

		const MAX_SIZE = 10 * 1024 * 1024; // 10MB
		if (pdfFile.size > MAX_SIZE) {
			return Response.redirect(
				new URL('/paneladministrador?tab=menus&error=archivo-grande', request.url),
				303,
			);
		}

		// Generate unique filename
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 8);
		const fileName = `menu-${menuId}-${timestamp}-${random}.pdf`;
		const filePath = `uploads/menus/${fileName}`;

		// Upload to R2
		const bucket = locals.runtime?.env?.UPLOADS_BUCKET;
		if (bucket) {
			await uploadFile(bucket, pdfFile, filePath);
		}

		// Update menu with PDF URL
		const menu = menusRepo.getById(menuId);
		if (menu) {
			menusRepo.update(menuId, {
				branchId: menu.branch_id,
				name: menu.name,
				pdfUrl: `/api/media/${filePath}`,
				displayOrder: menu.display_order,
				isActive: menu.is_active === 1,
			});
		}

		return Response.redirect(
			new URL(`/paneladministrador?tab=menus&success=pdf-uploaded`, request.url),
			303,
		);
	} catch (error) {
		console.error('Error uploading menu PDF:', error);
		return Response.redirect(
			new URL('/paneladministrador?tab=menus&error=servidor', request.url),
			303,
		);
	}
};
