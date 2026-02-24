import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { auth } from '../../../../lib/auth';
import { messagesRepo } from '../../../../lib/contactMessages';
import { getDB } from '../../../../lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
	const db = getDB(locals);
	const user = await auth.getUserFromCookies(db, cookies);
	if (!user) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const body = await request.json().catch(() => null);
		const messageId = Number(body?.message_id ?? 0);
		const toEmail = String(body?.to_email ?? '').trim();

		if (!messageId || !toEmail || !EMAIL_REGEX.test(toEmail)) {
			return new Response(JSON.stringify({ error: 'Datos inválidos' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const message = await messagesRepo.getById(db, messageId);
		if (!message) {
			return new Response(JSON.stringify({ error: 'Mensaje no encontrado' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const resendApiKey = locals.runtime?.env?.RESEND_API_KEY;
		if (!resendApiKey) {
			return new Response(JSON.stringify({ error: 'RESEND_API_KEY no configurada' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const resend = new Resend(resendApiKey);
		const branchName = message.branch_name || 'No especificada';
		const phoneValue = message.phone || 'No proporcionado';
		const dateValue = new Date(message.created_at).toLocaleString('es-MX');

		const subject = `Mensaje de contacto de ${message.full_name} (Sucursal: ${branchName})`;
		const html = `
			<div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:24px;">
				<div style="max-width:680px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #ececec;">
					<div style="background:#d4534f; color:#fff; padding:18px 24px;">
						<h2 style="margin:0; font-size:22px;">La Siberia Central</h2>
						<p style="margin:6px 0 0; opacity:0.95;">Reenvío de mensaje de contacto</p>
					</div>
					<div style="padding:24px;">
						<table style="width:100%; border-collapse:collapse; font-size:14px;">
							<tr><td style="padding:8px 0; color:#666;">Nombre</td><td style="padding:8px 0; font-weight:600;">${message.full_name}</td></tr>
							<tr><td style="padding:8px 0; color:#666;">Correo</td><td style="padding:8px 0; font-weight:600;">${message.email}</td></tr>
							<tr><td style="padding:8px 0; color:#666;">Teléfono</td><td style="padding:8px 0; font-weight:600;">${phoneValue}</td></tr>
							<tr><td style="padding:8px 0; color:#666;">Sucursal</td><td style="padding:8px 0; font-weight:600;">${branchName}</td></tr>
							<tr><td style="padding:8px 0; color:#666;">Fecha</td><td style="padding:8px 0; font-weight:600;">${dateValue}</td></tr>
						</table>
						<div style="margin-top:20px; border-left:4px solid #d4534f; background:#fff5f5; padding:14px 16px; border-radius:8px; white-space:pre-wrap;">
							${message.message}
						</div>
					</div>
					<div style="padding:16px 24px; border-top:1px solid #efefef; color:#888; font-size:12px;">
						Reenviado desde el panel de administración.
					</div>
				</div>
			</div>
		`;

		await resend.emails.send({
			from: 'La Siberia Central <noreply@lasiberiacentral.com>',
			to: [toEmail],
			subject,
			html,
		});

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Error al reenviar mensaje:', error);
		return new Response(JSON.stringify({ error: 'No se pudo enviar el correo' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
};