import { pbkdf2, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const pbkdf2Async = promisify(pbkdf2);

export async function createPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return { salt, hash: `scrypt:${derived.toString('hex')}` };
}

export async function verifyPassword(
  password: string,
  salt: string,
  stored: string,
) {
  const modern = stored.startsWith('scrypt:');
  const encoded = modern ? stored.slice(7) : stored;
  if (!/^[a-f0-9]{128}$/i.test(encoded)) return false;
  const derived = modern
    ? ((await scryptAsync(password, salt, 64)) as Buffer)
    : await pbkdf2Async(password, salt, 1000, 64, 'sha512');
  return timingSafeEqual(derived, Buffer.from(encoded, 'hex'));
}
