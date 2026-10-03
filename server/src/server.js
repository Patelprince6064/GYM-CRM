/** Local / Render entrypoint — persistent SQLite file. */
import { initDB, dbAll, dbRun, dbGet } from './db/database.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDB();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Failed to initialize database', err);
    process.exit(1);
  }

  const app = createApp({ dbAll, dbRun, dbGet });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
