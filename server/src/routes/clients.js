import { Router } from 'express';

export const createClientsRouter = ({ dbAll, dbRun, dbGet }) => {
  const router = Router();

  router.get('/', (req, res) => {
    try {
      res.json(dbAll('SELECT * FROM clients'));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/', (req, res) => {
    const { name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance } = req.body;
    try {
      const result = dbRun(
        `INSERT INTO clients (name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance || 0]
      );
      res.status(201).json(dbGet('SELECT * FROM clients WHERE id = ?', [result.id]));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    try {
      dbRun(`UPDATE clients SET ${fields} WHERE id = ?`, [...Object.values(data), id]);
      res.json(dbGet('SELECT * FROM clients WHERE id = ?', [id]));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    try {
      dbRun('DELETE FROM clients WHERE id = ?', [id]);
      res.json({ message: 'Client deleted successfully', id: parseInt(id) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
