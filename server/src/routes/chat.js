import { Router } from 'express';

export const createChatRouter = ({ dbAll, dbRun, dbGet }) => {
  const router = Router();

  router.get('/', (req, res) => {
    try {
      res.json(dbAll('SELECT * FROM chat_messages ORDER BY id ASC'));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/', (req, res) => {
    const { text, sender, senderName, timestamp, time } = req.body;
    try {
      const result = dbRun(
        'INSERT INTO chat_messages (text, sender, senderName, timestamp, time) VALUES (?, ?, ?, ?, ?)',
        [text, sender, senderName, timestamp, time]
      );
      res.status(201).json(dbGet('SELECT * FROM chat_messages WHERE id = ?', [result.id]));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
