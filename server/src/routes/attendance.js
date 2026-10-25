import { Router } from 'express';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Attendance API.
 *
 *   GET    /api/attendance?clientId=&from=&to=&limit=
 *   GET    /api/attendance/today
 *   POST   /api/attendance        record / amend a check-in (upsert per member+day)
 *   DELETE /api/attendance/:id    remove a mistaken entry (admin only)
 *
 * Reads are scoped to the session's own member unless the caller is an
 * admin. Every value is bound as a SQL parameter and every user-supplied
 * string is format-checked before it reaches the query.
 */
export const createAttendanceRouter = ({ dbAll, dbRun }, requireAdmin) => {
  const router = Router();
  const isAdmin = (req) => req.user?.role === 'admin';

  router.get('/', (req, res) => {
    try {
      const { clientId, from, to, limit } = req.query;
      const where = [];
      const params = [];

      // Server-side isolation first: a member can never widen the query
      // past their own record, whatever the query string says.
      if (!isAdmin(req)) {
        where.push('clientId = ?');
        params.push(Number(req.user?.clientId ?? -1));
      } else if (clientId !== undefined && clientId !== '') {
        const id = Number(clientId);
        if (!Number.isInteger(id)) return res.status(400).json({ error: 'clientId must be an integer' });
        where.push('clientId = ?');
        params.push(id);
      }

      if (typeof from === 'string' && DATE_RE.test(from)) {
        where.push('date >= ?');
        params.push(from);
      }
      if (typeof to === 'string' && DATE_RE.test(to)) {
        where.push('date <= ?');
        params.push(to);
      }

      const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const cap = Math.min(Math.max(Number(limit) || 5000, 1), 20000);
      const rows = dbAll(
        `SELECT * FROM attendance_logs ${clause} ORDER BY date DESC, id DESC LIMIT ?`,
        [...params, cap],
      );

      res.json(
        rows.map((r) => ({
          id: r.id,
          clientId: r.clientId,
          date: r.date,
          checkInTime: r.checkInTime || '',
          checkOutTime: r.checkOutTime || undefined,
          present: !!r.present,
        })),
      );
    } catch (error) {
      console.error('[attendance] GET failed:', error.message);
      res.status(500).json({ error: 'Failed to load attendance records' });
    }
  });

  router.get('/today', (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const rows = isAdmin(req)
        ? dbAll(
            'SELECT * FROM attendance_logs WHERE date = ? AND present = 1 ORDER BY checkInTime ASC',
            [today],
          )
        : dbAll(
            'SELECT * FROM attendance_logs WHERE date = ? AND present = 1 AND clientId = ? ORDER BY checkInTime ASC',
            [today, Number(req.user?.clientId ?? -1)],
          );
      res.json(
        rows.map((r) => ({
          id: r.id,
          clientId: r.clientId,
          date: r.date,
          checkInTime: r.checkInTime || '',
          checkOutTime: r.checkOutTime || undefined,
          present: true,
        })),
      );
    } catch (error) {
      console.error('[attendance] GET /today failed:', error.message);
      res.status(500).json({ error: "Failed to load today's attendance" });
    }
  });

  router.post('/', (req, res) => {
    const body = req.body ?? {};
    if (!isAdmin(req) && body.clientId !== undefined && Number(body.clientId) !== Number(req.user?.clientId)) {
      return res.status(403).json({ error: 'Administrator access required' });
    }
    const clientId = isAdmin(req) ? Number(body.clientId) : Number(req.user?.clientId);
    const date = body.date;

    if (!Number.isInteger(clientId) || clientId <= 0) {
      return res.status(400).json({ error: 'clientId must be a positive integer' });
    }
    if (typeof date !== 'string' || !DATE_RE.test(date)) {
      return res.status(400).json({ error: 'date must be formatted YYYY-MM-DD' });
    }

    const isPresent = body.present === undefined ? true : Boolean(body.present);
    const inTime = typeof body.checkInTime === 'string' ? body.checkInTime.slice(0, 24) : '';
    const outTime = typeof body.checkOutTime === 'string' ? body.checkOutTime.slice(0, 24) : null;

    try {
      // Upsert so re-checking the same member on the same day cannot duplicate.
      dbRun(
        `INSERT INTO attendance_logs (clientId, date, checkInTime, checkOutTime, present)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(clientId, date)
         DO UPDATE SET checkInTime = excluded.checkInTime,
                       checkOutTime = excluded.checkOutTime,
                       present = excluded.present`,
        [clientId, date, inTime, outTime, isPresent ? 1 : 0],
      );

      const row = dbAll('SELECT id FROM attendance_logs WHERE clientId = ? AND date = ?', [clientId, date]);
      res.status(201).json({
        id: row[0]?.id,
        clientId,
        date,
        checkInTime: inTime,
        checkOutTime: outTime || undefined,
        present: isPresent,
      });
    } catch (error) {
      console.error('[attendance] POST failed:', error.message);
      res.status(500).json({ error: 'Failed to record attendance' });
    }
  });

  router.delete('/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    try {
      const result = dbRun('DELETE FROM attendance_logs WHERE id = ?', [id]);
      if (!result.changes) return res.status(404).json({ error: 'Attendance record not found' });
      res.json({ success: true, id });
    } catch (error) {
      console.error('[attendance] DELETE failed:', error.message);
      res.status(500).json({ error: 'Failed to delete attendance record' });
    }
  });

  return router;
};
