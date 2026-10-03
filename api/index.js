/**
 * Vercel serverless entrypoint — thin adapter.
 * Uses an in-memory sql.js database (serverless has no persistent disk),
 * applies the SHARED schema + seed from `server/`, and reuses the
 * SHARED express app factory. All route logic lives in `server/src/routes/`.
 */
import initSqlJs from 'sql.js';
import { SCHEMA_SQL } from '../server/src/db/schema.js';
import { seedDatabase } from '../server/src/db/seed-data.js';
import { createApp } from '../server/src/app.js';

let db = null;

const initDB = async () => {
  if (db) return db;
  const SQL = await initSqlJs();
  db = new SQL.Database();

  for (const sql of SCHEMA_SQL) {
    db.run(sql);
  }

  const countResult = db.exec('SELECT COUNT(*) as count FROM clients');
  const count = countResult[0]?.values[0][0] || 0;
  if (count === 0) {
    seedDatabase(db);
  }
  return db;
};

const dbAll = (database, sql, params = []) => {
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

const dbRun = (database, sql, params = []) => {
  database.run(sql, params);
  const stmt = database.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const res = stmt.getAsObject();
  stmt.free();
  return { id: res.id || 0 };
};

const dbGet = (database, sql, params = []) => {
  const stmt = database.prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
};

// Initialize the in-memory DB at cold start (top-level await supported on Vercel Node ESM).
await initDB();

const app = createApp({
  dbAll: (sql, params) => dbAll(db, sql, params),
  dbRun: (sql, params) => dbRun(db, sql, params),
  dbGet: (sql, params) => dbGet(db, sql, params),
});

export default app;
