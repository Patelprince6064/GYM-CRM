import { verifyToken } from '../lib/crypto.js';

/**
 * Authentication / authorisation middleware.
 *
 * `requireAuth` decodes the `Authorization: Bearer <token>` header and
 * attaches the verified claims to `req.user`. A missing, malformed, tampered
 * or expired token is a 401 — never a silent pass-through.
 */
export const createRequireAuth = (secret) => (req, res, next) => {
  const header = req.headers.authorization;
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = token ? verifyToken(token, secret) : null;

  if (!payload) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  req.user = {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role === 'admin' ? 'admin' : 'user',
    clientId: payload.cid ?? null,
  };
  next();
};

/** Admin-only gate. Placed after `requireAuth` so `req.user` always exists. */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
};

/**
 * Server-side record isolation: a non-admin session may only reach the
 * member record it is bound to. Returns `false` when access is denied so
 * route handlers can answer with a 403 without leaking whether the row
 * exists.
 */
export const ownsRecord = (req, clientId) => {
  if (req.user?.role === 'admin') return true;
  if (req.user?.clientId == null) return false;
  return Number(req.user.clientId) === Number(clientId);
};
