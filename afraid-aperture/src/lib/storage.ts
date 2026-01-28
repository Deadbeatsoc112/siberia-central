import type { R2Bucket } from '@cloudflare/workers-types';

export async function uploadFile(bucket: R2Bucket, file: File, path: string): Promise<void> {
	const buffer = await file.arrayBuffer();
	await bucket.put(path, buffer, {
		httpMetadata: {
			contentType: file.type,
		},
	});
}

export async function getFile(bucket: R2Bucket, path: string): Promise<ArrayBuffer | null> {
	const object = await bucket.get(path);
	if (!object) return null;
	return await object.arrayBuffer();
}

export async function deleteFile(bucket: R2Bucket, path: string): Promise<void> {
	await bucket.delete(path);
}
