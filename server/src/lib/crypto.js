/**
 * Password hashing + stateless session tokens.
 *
 * Everything here uses only `node:crypto` — no third-party dependency is
 * added for authentication. Passwords are salted scrypt hashes (never
 * reversible, never logged); session tokens are HMAC-SHA256 signed so the
 * API can validate them without a server-side session table.
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** scrypt parameters: ~16 MB per hash, comfortably inside Node defaults. */
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const HASH_BYTES = 64;

/** Minimum accepted password length (the demo credentials already exceed it). */
export const MIN_PASSWORD_LENGTH = 6;

/** Returns `{ salt, hash }` — store both; the salt is what makes each hash unique. */
export const hashPassword = (password, salt = randomBytes(16).toString('hex')) => {
  const hash = scryptSync(String(password), salt, HASH_BYTES, SCRYPT_OPTIONS).toString('hex');
  return { salt, hash };
};

/** Constant-time password check. Never leaks which half was wrong. */
export const verifyPassword = (password, salt, expectedHash) => {
  if (!salt || !expectedHash) return false;
  let actual;
  try {
    actual = scryptSync(String(password), salt, HASH_BYTES, SCRYPT_OPTIONS);
  } catch {
    return false;
  }
  const expected = Buffer.from(String(expectedHash), 'hex');
  if (expected.length !== actual.length || expected.length === 0) return false;
  return timingSafeEqual(actual, expected);
};

const toBase64Url = (value) => Buffer.from(value, 'utf8').toString('base64url');

/**
 * `base64url(payload).base64url(hmac(payload))`.
 * The payload is only signed, not encrypted — it must never carry secrets.
 */
export const signToken = (payload, secret) => {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
};

/** Returns the decoded payload, or `null` when the token is tampered/expired. */
export const verifyToken = (token, secret) => {
  if (typeof token !== 'string' || token.length > 4096) return null;
  const split = token.lastIndexOf('.');
  if (split <= 0) return null;

  const body = token.slice(0, split);
  const signature = token.slice(split + 1);
  const expected = createHmac('sha256', secret).update(body).digest('base64url');

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || typeof payload.sub !== 'number') return null;
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

let ephemeralSecret = null;

/**
 * Signing key for session tokens.
 *
 * `AUTH_SECRET` (or `JWT_SECRET`) wins when it is long enough. Without it we
 * fall back to a random per-process key: perfectly safe, but sessions reset
 * on every restart, so production deployments are warned to set one.
 */
export const resolveAuthSecret = () => {
  const fromEnv = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (typeof fromEnv === 'string' && fromEnv.length >= 16) return fromEnv;

  if (!ephemeralSecret) {
    ephemeralSecret = randomBytes(32).toString('hex');
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[auth] AUTH_SECRET is not configured — using an ephemeral signing key. ' +
          'Sessions will be invalidated on every restart. Set AUTH_SECRET to persist them.',
      );
    }
  }
  return ephemeralSecret;
};
