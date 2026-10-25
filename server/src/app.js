/**
 * Express app factory — builds the API without starting a listener,
 * so both `server` (Render) and `api` (Vercel serverless) can reuse it.
 */
import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { createRequireAuth, requireAdmin } from './middleware/auth.js';
import { resolveAuthSecret } from './lib/crypto.js';
import { createHealthRouter } from './routes/health.js';
import { createAuthRouter } from './routes/auth.js';
import { createClientsRouter } from './routes/clients.js';
import { createDailyUpdatesRouter } from './routes/daily-updates.js';
import { createWeightRouter } from './routes/weight.js';
import { createNotificationsRouter } from './routes/notifications.js';
import { createChatRouter } from './routes/chat.js';
import { createAttendanceRouter } from './routes/attendance.js';
import { createSignalsRouter } from './routes/signals.js';

export const createApp = (db) => {
  const app = express();
  const secret = resolveAuthSecret();
  const requireAuth = createRequireAuth(secret);

  app.use(corsMiddleware);
  // Avatars are stored as data URLs, so the JSON ceiling is above the
  // default 100 KB but still bounded.
  app.use(express.json({ limit: '1mb' }));

  // Public: liveness probe and the sign-in / registration surface.
  app.use('/api/health', createHealthRouter());
  app.use('/api/auth', createAuthRouter(db, secret));

  // Everything else requires a verified session token.
  app.use('/api', requireAuth);

  app.use('/api/clients', createClientsRouter(db));
  app.use('/api/daily-updates', createDailyUpdatesRouter(db));
  // Weight router registers its own historic `/weight-history` + `/weight-table-data` paths.
  app.use('/api', createWeightRouter(db));
  app.use('/api/notifications', createNotificationsRouter(db));
  app.use('/api/chat-messages', createChatRouter(db));
  app.use('/api/attendance', createAttendanceRouter(db, requireAdmin));
  app.use('/api/signals', createSignalsRouter(db, requireAdmin));

  return app;
};
