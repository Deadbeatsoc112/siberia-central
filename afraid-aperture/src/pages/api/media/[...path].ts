import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals }) => {
	const path = params.path;

	if (!path) {
		return new Response('Path required', { status: 400 });
	}

	try {
		const bucket = locals.runtime?.env?.siberia_uploads;
		if (!bucket) {
			return new Response('Storage not available', { status: 500 });
		}

		const object = await bucket.get(path);

		if (!object) {
			return new Response('File not found', { status: 404 });
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('Cache-Control', 'public, max-age=31536000');

		return new Response(object.body, { headers });
	} catch (error) {
		console.error('Error serving file:', error);
		return new Response('Error serving file', { status: 500 });
	}
};
