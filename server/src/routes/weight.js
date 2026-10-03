import { Router } from 'express';

/** Weight endpoints keep their historic URLs; mounted at `/api`. */
export const createWeightRouter = ({ dbAll, dbRun, dbGet }) => {
  const router = Router();

  router.get('/weight-history', (req, res) => {
    try {
      res.json(dbAll('SELECT * FROM weight_history ORDER BY id ASC'));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/weight-history', (req, res) => {
    const { date, weight } = req.body;
    try {
      const result = dbRun('INSERT INTO weight_history (date, weight) VALUES (?, ?)', [date, weight]);
      res.status(201).json(dbGet('SELECT * FROM weight_history WHERE id = ?', [result.id]));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/weight-table-data', (req, res) => {
    try {
      res.json(dbAll('SELECT * FROM weight_table_data ORDER BY id DESC'));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/weight-table-data', (req, res) => {
    const { date, weight, change, bmi } = req.body;
    try {
      const result = dbRun('INSERT INTO weight_table_data (date, weight, change, bmi) VALUES (?, ?, ?, ?)', [date, weight, change, bmi]);
      res.status(201).json(dbGet('SELECT * FROM weight_table_data WHERE id = ?', [result.id]));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
