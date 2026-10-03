import { Router } from 'express';

export const createHealthRouter = () => {
  const router = Router();
  router.get('/', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  return router;
};
