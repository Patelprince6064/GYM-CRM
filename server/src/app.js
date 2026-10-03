/**
 * Express app factory — builds the API without starting to listen,
 * so both `server` (Render) and `api` (Vercel serverless) can reuse it.
 */
import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { createHealthRouter } from './routes/health.js';
import { createClientsRouter } from './routes/clients.js';
import { createDailyUpdatesRouter } from './routes/daily-updates.js';
import { createWeightRouter } from './routes/weight.js';
import { createNotificationsRouter } from './routes/notifications.js';
import { createChatRouter } from './routes/chat.js';

export const createApp = (db) => {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());

  app.use('/api/health', createHealthRouter());
  app.use('/api/clients', createClientsRouter(db));
  app.use('/api/daily-updates', createDailyUpdatesRouter(db));
  // Weight router registers its own historic `/weight-history` + `/weight-table-data` paths.
  app.use('/api', createWeightRouter(db));
  app.use('/api/notifications', createNotificationsRouter(db));
  app.use('/api/chat-messages', createChatRouter(db));

  return app;
};
