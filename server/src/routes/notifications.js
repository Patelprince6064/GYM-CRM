import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';

/**
 * Workspace notification feed. This is the operator's inbox, so every verb
 * is admin-gated — a member session can read its own local confirmations
 * but can neither see nor write the gym-wide list.
 *
 *   GET    /api/notifications
 *   POST   /api/notifications
 *   PUT    /api/notifications/:id/read
 *   PUT    /api/notifications/read-all
 */
export const createNotificationsRouter = (db) => {
  const { dbAll, dbRun, dbGet } = db;
  const router = Router();

  router.use(requireAdmin);

  router.get('/', (_req, res) => {
    try {
      const notifs = dbAll('SELECT * FROM notifications ORDER BY id DESC');
      res.json(notifs.map((n) => ({ ...n, read: !!n.read })));
    } catch (error) {
      console.error('[notifications] GET failed:', error.message);
      res.status(500).json({ error: 'Failed to load notifications' });
    }
  });

  router.post('/', (req, res) => {
    const { message, time, type } = req.body ?? {};
    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'A message is required' });
    }
    try {
      const result = dbRun(
        'INSERT INTO notifications (message, time, read, type) VALUES (?, ?, ?, ?)',
        [
          message.trim().slice(0, 400),
          String(time ?? 'Just now').slice(0, 40),
          0,
          type === 'success' || type === 'warning' ? type : 'info',
        ],
      );
      const newNotif = dbGet('SELECT * FROM notifications WHERE id = ?', [result.id]);
      res.status(201).json({ ...newNotif, read: false });
    } catch (error) {
      console.error('[notifications] POST failed:', error.message);
      res.status(500).json({ error: 'Failed to save the notification' });
    }
  });

  router.put('/:id/read', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid notification id' });
    try {
      const result = dbRun('UPDATE notifications SET read = 1 WHERE id = ?', [id]);
      if (!result.changes) return res.status(404).json({ error: 'Notification not found' });
      res.json({ success: true, id });
    } catch (error) {
      console.error('[notifications] PUT failed:', error.message);
      res.status(500).json({ error: 'Failed to update the notification' });
    }
  });

  router.put('/read-all', (_req, res) => {
    try {
      dbRun('UPDATE notifications SET read = 1');
      res.json({ success: true });
    } catch (error) {
      console.error('[notifications] PUT read-all failed:', error.message);
      res.status(500).json({ error: 'Failed to update notifications' });
    }
  });

  return router;
};
