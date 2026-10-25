import { Router } from 'express';
import { ownsRecord, requireAdmin } from '../middleware/auth.js';

/**
 * Writable client columns. Any key outside this list is ignored, which
 * both prevents column-injection through `SET ${key}` and keeps the
 * contract predictable for API consumers.
 */
const CLIENT_FIELDS = [
  'name', 'age', 'phone', 'email', 'avatar', 'avatarColor', 'plan',
  'startDate', 'endDate', 'remainingDays', 'currentWeight', 'goalWeight',
  'height', 'status', 'goal', 'attendance', 'address', 'notes',
  'membershipAmount', 'avatarUrl',
];

/**
 * Fields a member may change on *their own* record. Membership term, plan
 * and status are deliberately excluded — those are operator decisions.
 */
const SELF_SERVICE_FIELDS = ['currentWeight', 'goalWeight', 'height', 'attendance', 'goal', 'avatarUrl'];

const fail = (res, status, error) => res.status(status).json({ error });

export const createClientsRouter = ({ dbAll, dbRun, dbGet }) => {
  const router = Router();
  const isAdmin = (req) => req.user?.role === 'admin';

  router.get('/', (req, res) => {
    try {
      const rows = dbAll('SELECT * FROM clients ORDER BY id ASC');
      const { search, plan, status } = req.query;

      // Server-side record isolation: a non-admin session only ever sees
      // the member it is bound to, regardless of query parameters.
      const allowed = isAdmin(req)
        ? rows
        : rows.filter((row) => Number(row.id) === Number(req.user?.clientId));

      res.json(
        allowed.filter((row) => {
          if (typeof search === 'string' && search) {
            const q = search.toLowerCase();
            if (!String(row.name ?? '').toLowerCase().includes(q) &&
                !String(row.email ?? '').toLowerCase().includes(q) &&
                !String(row.phone ?? '').includes(q)) return false;
          }
          if (typeof plan === 'string' && plan && row.plan !== plan) return false;
          if (typeof status === 'string' && status && row.status !== status) return false;
          return true;
        }),
      );
    } catch (error) {
      console.error('[clients] GET failed:', error.message);
      fail(res, 500, 'Failed to load members');
    }
  });

  router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return fail(res, 400, 'Invalid member id');
    if (!ownsRecord(req, id)) return fail(res, 403, 'Administrator access required');
    try {
      const row = dbGet('SELECT * FROM clients WHERE id = ?', [id]);
      if (!row) return fail(res, 404, 'Member not found');
      res.json(row);
    } catch (error) {
      console.error('[clients] GET /:id failed:', error.message);
      fail(res, 500, 'Failed to load member');
    }
  });

  router.post('/', requireAdmin, (req, res) => {
    const body = req.body ?? {};
    if (typeof body.name !== 'string' || body.name.trim().length < 2) {
      return fail(res, 400, 'A member name is required');
    }

    const values = {};
    for (const field of CLIENT_FIELDS) {
      if (body[field] !== undefined) values[field] = body[field];
    }
    values.name = body.name.trim().slice(0, 120);
    if (values.email !== undefined) values.email = String(values.email).trim().toLowerCase().slice(0, 160);

    const columns = Object.keys(values);
    const placeholders = columns.map(() => '?').join(', ');

    try {
      const result = dbRun(
        `INSERT INTO clients (${columns.join(', ')}) VALUES (${placeholders})`,
        columns.map((c) => values[c]),
      );
      res.status(201).json(dbGet('SELECT * FROM clients WHERE id = ?', [result.id]));
    } catch (error) {
      console.error('[clients] POST failed:', error.message);
      if (String(error.message).includes('UNIQUE')) return fail(res, 409, 'A member with that email already exists');
      fail(res, 500, 'Failed to create member');
    }
  });

  router.put('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return fail(res, 400, 'Invalid member id');
    if (!ownsRecord(req, id)) return fail(res, 403, 'Administrator access required');

    const body = req.body ?? {};
    const values = {};
    for (const field of CLIENT_FIELDS) {
      if (body[field] !== undefined) values[field] = body[field];
    }

    let columns = Object.keys(values);
    if (columns.length === 0) return fail(res, 400, 'No updatable fields supplied');

    if (!isAdmin(req)) {
      const rejected = columns.filter((c) => !SELF_SERVICE_FIELDS.includes(c));
      if (rejected.length > 0) {
        return fail(res, 403, 'Administrator access required to change membership details');
      }
      columns = columns.filter((c) => SELF_SERVICE_FIELDS.includes(c));
      if (columns.length === 0) return fail(res, 400, 'No updatable fields supplied');
    }

    const assignments = columns.map((c) => `${c} = ?`).join(', ');
    try {
      dbRun(`UPDATE clients SET ${assignments} WHERE id = ?`, [...columns.map((c) => values[c]), id]);
      const updated = dbGet('SELECT * FROM clients WHERE id = ?', [id]);
      if (!updated) return fail(res, 404, 'Member not found');
      res.json(updated);
    } catch (error) {
      console.error('[clients] PUT failed:', error.message);
      fail(res, 500, 'Failed to update member');
    }
  });

  router.delete('/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return fail(res, 400, 'Invalid member id');
    try {
      const result = dbRun('DELETE FROM clients WHERE id = ?', [id]);
      if (!result.changes) return fail(res, 404, 'Member not found');
      res.json({ message: 'Member deleted successfully', id });
    } catch (error) {
      console.error('[clients] DELETE failed:', error.message);
      fail(res, 500, 'Failed to delete member');
    }
  });

  return router;
};
