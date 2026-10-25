import { Router } from 'express';

/** Weight endpoints keep their historic URLs; mounted at `/api`. */
export const createWeightRouter = ({ dbAll, dbRun, dbGet }) => {
  const router = Router();

  const isAdmin = (req) => req.user?.role === 'admin';
  /** Admin sees every log; a member only ever reads their own rows. */
  const scoped = (req) => (isAdmin(req) ? '' : ' WHERE clientId = ?');
  const scopeParams = (req) => (isAdmin(req) ? [] : [req.user?.clientId ?? -1]);

  router.get('/weight-history', (req, res) => {
    try {
      res.json(dbAll(`SELECT * FROM weight_history${scoped(req)} ORDER BY id ASC`, scopeParams(req)));
    } catch (error) {
      console.error('[weight] GET history failed:', error.message);
      res.status(500).json({ error: 'Failed to load weight history' });
    }
  });

  router.post('/weight-history', (req, res) => {
    const { date, weight } = req.body ?? {};
    if (typeof date !== 'string' || date.length === 0 || date.length > 24) {
      return res.status(400).json({ error: 'A valid date is required' });
    }
    const value = Number(weight);
    if (!Number.isFinite(value) || value <= 0 || value > 500) {
      return res.status(400).json({ error: 'Weight must be a positive number under 500' });
    }
    try {
      // A member's entry is always stamped with their own id — the request
      // body cannot claim to belong to somebody else.
      const clientId = isAdmin(req)
        ? req.body.clientId === undefined || req.body.clientId === null ? null : Number(req.body.clientId)
        : Number(req.user.clientId);
      const result = dbRun('INSERT INTO weight_history (date, weight, clientId) VALUES (?, ?, ?)', [
        date.slice(0, 24),
        value,
        Number.isInteger(clientId) ? clientId : null,
      ]);
      res.status(201).json(dbGet('SELECT * FROM weight_history WHERE id = ?', [result.id]));
    } catch (error) {
      console.error('[weight] POST history failed:', error.message);
      res.status(500).json({ error: 'Failed to record the weight entry' });
    }
  });

  router.get('/weight-table-data', (req, res) => {
    try {
      res.json(dbAll(`SELECT * FROM weight_table_data${scoped(req)} ORDER BY id DESC`, scopeParams(req)));
    } catch (error) {
      console.error('[weight] GET table failed:', error.message);
      res.status(500).json({ error: 'Failed to load weight records' });
    }
  });

  router.post('/weight-table-data', (req, res) => {
    const { date, weight, change, bmi } = req.body ?? {};
    if (typeof date !== 'string' || date.length === 0 || date.length > 24) {
      return res.status(400).json({ error: 'A valid date is required' });
    }
    try {
      const clientId = isAdmin(req)
        ? req.body.clientId === undefined || req.body.clientId === null ? null : Number(req.body.clientId)
        : Number(req.user.clientId);
      const result = dbRun(
        'INSERT INTO weight_table_data (date, weight, change, bmi, clientId) VALUES (?, ?, ?, ?, ?)',
        [
          date.slice(0, 24),
          String(weight ?? '').slice(0, 32),
          String(change ?? '').slice(0, 32),
          String(bmi ?? '').slice(0, 32),
          Number.isInteger(clientId) ? clientId : null,
        ],
      );
      res.status(201).json(dbGet('SELECT * FROM weight_table_data WHERE id = ?', [result.id]));
    } catch (error) {
      console.error('[weight] POST table failed:', error.message);
      res.status(500).json({ error: 'Failed to record the weight entry' });
    }
  });

  return router;
};
