import { Router } from 'express';

/**
 * Daily member logs.
 *
 *   GET  /api/daily-updates   admin: everything · member: their own rows
 *   POST /api/daily-updates   a member can only ever post as themselves
 */
export const createDailyUpdatesRouter = ({ dbAll, dbRun, dbGet }) => {
  const router = Router();
  const isAdmin = (req) => req.user?.role === 'admin';

  router.get('/', (req, res) => {
    try {
      const rows = isAdmin(req)
        ? dbAll('SELECT * FROM daily_updates ORDER BY id DESC')
        : dbAll('SELECT * FROM daily_updates WHERE clientId = ? ORDER BY id DESC', [req.user?.clientId ?? -1]);
      res.json(rows.map((u) => ({ ...u, workout: !!u.workout })));
    } catch (error) {
      console.error('[daily-updates] GET failed:', error.message);
      res.status(500).json({ error: 'Failed to load daily logs' });
    }
  });

  router.post('/', (req, res) => {
    const body = req.body ?? {};
    // The recorded owner is the session's member for non-admins; the body
    // cannot be used to write into somebody else's log.
    const clientId = isAdmin(req)
      ? Number(body.clientId)
      : Number(req.user?.clientId ?? body.clientId);

    if (!Number.isInteger(clientId) || clientId <= 0) {
      return res.status(400).json({ error: 'A valid member is required' });
    }
    if (typeof body.date !== 'string' || body.date.length === 0 || body.date.length > 24) {
      return res.status(400).json({ error: 'A valid date is required' });
    }

    try {
      const result = dbRun(
        `INSERT INTO daily_updates (clientId, name, avatar, avatarColor, date, workout, workoutName, water, calories, sleep, steps, mood, notes, heartRate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          String(body.name ?? '').slice(0, 120),
          String(body.avatar ?? '').slice(0, 8),
          String(body.avatarColor ?? 'av-0').slice(0, 24),
          body.date.slice(0, 24),
          body.workout ? 1 : 0,
          String(body.workoutName ?? '').slice(0, 120),
          Number(body.water) || 0,
          Number(body.calories) || 0,
          Number(body.sleep) || 0,
          Number(body.steps) || 0,
          String(body.mood ?? '').slice(0, 32),
          String(body.notes ?? '').slice(0, 600),
          Number(body.heartRate) || 0,
        ],
      );
      const created = dbGet('SELECT * FROM daily_updates WHERE id = ?', [result.id]);
      res.status(201).json({ ...created, workout: !!created.workout });
    } catch (error) {
      console.error('[daily-updates] POST failed:', error.message);
      res.status(500).json({ error: 'Failed to save the daily log' });
    }
  });

  return router;
};
