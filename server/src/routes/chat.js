import { Router } from 'express';

/**
 * The two-party support thread between the operator and members.
 * Both authenticated roles can read and post; message content is
 * length-capped and never echoed back with server internals.
 */
export const createChatRouter = ({ dbAll, dbRun, dbGet }) => {
  const router = Router();

  router.get('/', (_req, res) => {
    try {
      res.json(dbAll('SELECT * FROM chat_messages ORDER BY id ASC'));
    } catch (error) {
      console.error('[chat] GET failed:', error.message);
      res.status(500).json({ error: 'Failed to load messages' });
    }
  });

  router.post('/', (req, res) => {
    const { text, sender, senderName, timestamp, time } = req.body ?? {};
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'A message is required' });
    }
    // The sender field is the session's role, not whatever the body claims.
    const role = req.user?.role === 'admin' ? 'admin' : 'user';
    const claimed = sender === 'admin' || sender === 'user' ? sender : role;
    const safeSender = req.user?.role === 'admin' ? claimed : role;

    try {
      const result = dbRun(
        'INSERT INTO chat_messages (text, sender, senderName, timestamp, time) VALUES (?, ?, ?, ?, ?)',
        [
          text.slice(0, 2000),
          safeSender,
          String(senderName ?? req.user?.name ?? '').slice(0, 60),
          String(timestamp ?? new Date().toISOString()).slice(0, 40),
          String(time ?? '').slice(0, 40),
        ],
      );
      res.status(201).json(dbGet('SELECT * FROM chat_messages WHERE id = ?', [result.id]));
    } catch (error) {
      console.error('[chat] POST failed:', error.message);
      res.status(500).json({ error: 'Failed to send the message' });
    }
  });

  return router;
};
