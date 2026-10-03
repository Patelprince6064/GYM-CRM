import { Router } from 'express';

export const createNotificationsRouter = ({ dbAll, dbRun, dbGet }) => {
  const router = Router();

  router.get('/', (req, res) => {
    try {
      const notifs = dbAll('SELECT * FROM notifications ORDER BY id DESC');
      res.json(notifs.map(n => ({ ...n, read: !!n.read })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/', (req, res) => {
    const { message, time, type } = req.body;
    try {
      const result = dbRun('INSERT INTO notifications (message, time, read, type) VALUES (?, ?, ?, ?)', [message, time || 'Just now', 0, type || 'info']);
      const newNotif = dbGet('SELECT * FROM notifications WHERE id = ?', [result.id]);
      res.status(201).json({ ...newNotif, read: false });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:id/read', (req, res) => {
    try {
      dbRun('UPDATE notifications SET read = 1 WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/read-all', (req, res) => {
    try {
      dbRun('UPDATE notifications SET read = 1');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
