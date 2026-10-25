import { Router } from 'express';
import {
  MIN_PASSWORD_LENGTH,
  hashPassword,
  signToken,
  verifyPassword,
} from '../lib/crypto.js';
import { normalizeEmail, publicUser } from '../db/accounts.js';
import { createRequireAuth } from '../middleware/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Session lifetime. Long enough for a shift, short enough to bound risk. */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const fail = (res, status, error) => res.status(status).json({ error });

const EMAIL_HINT = 'Enter a valid email address.';
const PASSWORD_HINT = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

/**
 * Auth API.
 *
 *   POST   /api/auth/login     { email, password }   → { token, user }
 *   POST   /api/auth/register  { name, email, password } → { token, user }
 *   GET    /api/auth/me                                → { user }
 *   PUT    /api/auth/password  { email, currentPassword, newPassword }
 *
 * Every error body is a fixed, human-readable string: no stack traces, no
 * SQL, no indication of which half of the credentials was wrong.
 */
export const createAuthRouter = ({ dbAll, dbGet, dbRun }, secret) => {
  const router = Router();

  const findByEmail = (email) =>
    dbAll('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizeEmail(email)])[0] ?? null;

  const issueSession = (user) => {
    const now = Date.now();
    const token = signToken(
      {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cid: user.clientId ?? null,
        iat: now,
        exp: now + SESSION_TTL_MS,
      },
      secret,
    );
    return { token, user: publicUser(user) };
  };

  const validateCredentials = (email, password) => {
    if (typeof email !== 'string' || !EMAIL_RE.test(normalizeEmail(email))) {
      return { error: EMAIL_HINT };
    }
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return { error: PASSWORD_HINT };
    }
    return {};
  };

  router.post('/login', (req, res) => {
    const { email, password } = req.body ?? {};
    const invalid = validateCredentials(email, password);
    if (invalid.error) return fail(res, 400, invalid.error);

    try {
      const user = findByEmail(email);
      // Same message whether the account is missing or the password is wrong.
      if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
        return fail(res, 401, 'Email or password is incorrect');
      }
      res.json(issueSession(user));
    } catch (error) {
      console.error('[auth] login failed:', error.message);
      fail(res, 500, 'Unable to sign in right now');
    }
  });

  router.post('/register', (req, res) => {
    const { name, email, password } = req.body ?? {};
    const invalid = validateCredentials(email, password);
    if (invalid.error) return fail(res, 400, invalid.error);
    if (typeof name !== 'string' || name.trim().length < 2) {
      return fail(res, 400, 'A name is required');
    }

    try {
      const normalized = normalizeEmail(email);
      if (findByEmail(normalized)) return fail(res, 409, 'An account with that email already exists');

      // Self-registration only opens the door an admin already made: the
      // email must belong to an existing member record. The role is always
      // `user` — the request body can never ask for admin.
      const member = dbAll('SELECT id FROM clients WHERE LOWER(email) = ? LIMIT 1', [normalized])[0];
      if (!member) {
        return fail(res, 403, 'Ask an administrator to add you as a member first');
      }

      const { salt, hash } = hashPassword(password);
      const result = dbRun(
        'INSERT INTO users (name, email, passwordHash, salt, role, clientId) VALUES (?, ?, ?, ?, ?, ?)',
        [name.trim().slice(0, 120), normalized, hash, salt, 'user', member.id],
      );

      const created = dbGet('SELECT * FROM users WHERE id = ?', [result.id]);
      res.status(201).json(issueSession(created));
    } catch (error) {
      console.error('[auth] register failed:', error.message);
      fail(res, 500, 'Unable to create the account');
    }
  });

  router.get('/me', createRequireAuth(secret), (req, res) => {
    const user = dbAll('SELECT * FROM users WHERE id = ? LIMIT 1', [req.user.id])[0];
    if (!user) return fail(res, 401, 'Authentication required');
    res.json({ user: publicUser(user) });
  });

  /**
   * Password change. Requires the current password — knowing only an email
   * must never be enough to take an account over.
   */
  router.put('/password', (req, res) => {
    const { email, currentPassword, newPassword } = req.body ?? {};
    const invalid = validateCredentials(email, newPassword);
    if (invalid.error) return fail(res, 400, invalid.error);
    if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
      return fail(res, 400, 'Enter your current password');
    }

    try {
      const user = findByEmail(email);
      if (!user || !verifyPassword(currentPassword, user.salt, user.passwordHash)) {
        return fail(res, 401, 'Current password is incorrect');
      }
      const { salt, hash } = hashPassword(newPassword);
      dbRun('UPDATE users SET passwordHash = ?, salt = ? WHERE id = ?', [hash, salt, user.id]);
      res.json({ success: true });
    } catch (error) {
      console.error('[auth] password change failed:', error.message);
      fail(res, 500, 'Unable to update the password');
    }
  });

  return router;
};
