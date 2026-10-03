/**
 * SQLite (sql.js) persistence layer.
 * - Loads / creates the db file, applies shared schema, seeds demo data.
 * - Auto-saves to disk every 5s and after every write.
 */
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { SCHEMA_SQL } from './schema.js';
import { seedDatabase } from './seed-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'gym.db');

let db = null;

// Save database to disk
const saveDB = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// Auto-save every 5 seconds
setInterval(saveDB, 5000);

// Initialize database
export const initDB = async () => {
  const SQL = await initSqlJs();

  // Load existing database if it exists
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
    console.log('Loaded existing database from', dbPath);
  } else {
    db = new SQL.Database();
    console.log('Created new database at', dbPath);
  }

  // Apply shared schema
  for (const sql of SCHEMA_SQL) {
    db.run(sql);
  }

  // Seed initial data if clients table is empty
  const countResult = db.exec('SELECT COUNT(*) as count FROM clients');
  const count = countResult[0]?.values[0][0] || 0;
  if (count === 0) {
    console.log('Seeding initial data into database...');
    seedDatabase(db);
    console.log('Database seeded successfully!');
  }

  saveDB();
  console.log('Database schema initialized successfully');
};

export { seedDatabase };

// Helper: convert sql.js result to array of objects
const toObjects = (result) => {
  if (!result || result.length === 0) return [];
  const res = result[0];
  const columns = res.columns;
  return res.values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
};

// DB Run - for INSERT, UPDATE, DELETE
export const dbRun = (sql, params = []) => {
  db.run(sql, params);
  // Get the last inserted row id
  const result = db.exec('SELECT last_insert_rowid() as id, changes() as changes');
  const data = toObjects(result);
  saveDB();
  return { id: data[0]?.id || 0, changes: data[0]?.changes || 0 };
};

// DB All - for SELECT (returns all rows)
export const dbAll = (sql, params = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

// DB Get - for SELECT (returns one row)
export const dbGet = (sql, params = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
};

export default () => db;
