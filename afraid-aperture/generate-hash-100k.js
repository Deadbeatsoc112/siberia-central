import { pbkdf2Sync, randomBytes } from 'node:crypto';

const password = 'admin';
const saltBytes = randomBytes(16);
// Usar 100,000 iteraciones (límite de Cloudflare Workers)
const hashBytes = pbkdf2Sync(password, saltBytes, 100_000, 32, 'sha256');

const salt = saltBytes.toString('hex');
const hash = hashBytes.toString('hex');
const combined = `${salt}:${hash}`;

console.log('Password hash for "admin" (100k iterations):');
console.log(combined);
