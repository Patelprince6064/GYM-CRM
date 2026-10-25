import { Router } from 'express';

/**
 * Dismissed insight / action-centre items.
 *
 *   GET    /api/signals/dismissed      → ["expiry:3", ...]
 *   POST   /api/signals/dismissed      → { signalId } (idempotent)
 *   DELETE /api/signals/dismissed/:id  → re-open an item
 *
 * Operator-only: the action centre is an admin surface, so every verb is
 * gated by `requireAdmin`.
 */
export const createSignalsRouter = ({ dbAll, dbRun }, requireAdmin) => {
  const router = Router();
  router.use(requireAdmin);

  const sanitize = (value) => {
    if (typeof value !== 'string' || value.length === 0 || value.length > 120) return null;
    if (!/^[a-z0-9:_-]+$/i.test(value)) return null;
    return value;
  };

  router.get('/dismissed', (_req, res) => {
    try {
      const rows = dbAll('SELECT signalId FROM dismissed_signals ORDER BY id DESC');
      res.json(rows.map((r) => r.signalId));
    } catch (error) {
      console.error('[signals] GET failed:', error.message);
      res.status(500).json({ error: 'Failed to load dismissed signals' });
    }
  });

  router.post('/dismissed', (req, res) => {
    const signalId = sanitize(req.body?.signalId);
    if (!signalId) return res.status(400).json({ error: 'A valid signalId is required' });
    try {
      dbRun(
        'INSERT OR IGNORE INTO dismissed_signals (signalId, dismissedBy, createdAt) VALUES (?, ?, ?)',
        [signalId, typeof req.body?.by === 'string' ? req.body.by.slice(0, 60) : req.user?.email ?? null, new Date().toISOString()],
      );
      res.status(201).json({ success: true, signalId });
    } catch (error) {
      console.error('[signals] POST failed:', error.message);
      res.status(500).json({ error: 'Failed to save dismissal' });
    }
  });

  router.delete('/dismissed/:id', (req, res) => {
    const signalId = sanitize(req.params.id);
    if (!signalId) return res.status(400).json({ error: 'A valid signalId is required' });
    try {
      dbRun('DELETE FROM dismissed_signals WHERE signalId = ?', [signalId]);
      res.json({ success: true, signalId });
    } catch (error) {
      console.error('[signals] DELETE failed:', error.message);
      res.status(500).json({ error: 'Failed to restore signal' });
    }
  });

  return router;
};
