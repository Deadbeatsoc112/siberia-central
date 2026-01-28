const ALLOWED_CV_TYPES = [
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_CV_SIZE = 5 * 1024 * 1024;

export function validateCvFile(file: File): { valid: boolean; error?: string } {
	if (!ALLOWED_CV_TYPES.includes(file.type)) {
		return { valid: false, error: 'formato-invalido' };
	}
	if (file.size > MAX_CV_SIZE) {
		return { valid: false, error: 'archivo-grande' };
	}
	return { valid: true };
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function validateImageFile(file: File): { valid: boolean; error?: string } {
	if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
		return { valid: false, error: 'formato-invalido' };
	}
	if (file.size > MAX_IMAGE_SIZE) {
		return { valid: false, error: 'imagen-grande' };
	}
	return { valid: true };
}
