import { Router } from 'express';

export const createDailyUpdatesRouter = ({ dbAll, dbRun, dbGet }) => {
  const router = Router();

  router.get('/', (req, res) => {
    try {
      const updates = dbAll('SELECT * FROM daily_updates ORDER BY id DESC');
      res.json(updates.map(u => ({ ...u, workout: !!u.workout })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/', (req, res) => {
    const { clientId, name, avatar, avatarColor, date, workout, workoutName, water, calories, sleep, steps, mood, notes, heartRate } = req.body;
    try {
      const result = dbRun(
        `INSERT INTO daily_updates (clientId, name, avatar, avatarColor, date, workout, workoutName, water, calories, sleep, steps, mood, notes, heartRate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clientId, name, avatar, avatarColor, date, workout ? 1 : 0, workoutName, water, calories, sleep, steps, mood, notes, heartRate]
      );
      const newUpdate = dbGet('SELECT * FROM daily_updates WHERE id = ?', [result.id]);
      res.status(201).json({ ...newUpdate, workout: !!newUpdate.workout });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
