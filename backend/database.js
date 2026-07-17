import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'gym.db');

let db = null;

// Save database to disk periodically
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

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      phone TEXT,
      email TEXT,
      avatar TEXT,
      avatarColor TEXT,
      plan TEXT,
      startDate TEXT,
      endDate TEXT,
      remainingDays INTEGER,
      currentWeight REAL,
      goalWeight REAL,
      height REAL,
      status TEXT,
      goal TEXT,
      attendance INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS daily_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId INTEGER,
      name TEXT,
      avatar TEXT,
      avatarColor TEXT,
      date TEXT,
      workout BOOLEAN,
      workoutName TEXT,
      water INTEGER,
      calories INTEGER,
      sleep REAL,
      steps INTEGER,
      mood TEXT,
      notes TEXT,
      heartRate INTEGER,
      FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS weight_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      weight REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS weight_table_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      weight TEXT,
      change TEXT,
      bmi TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT,
      time TEXT,
      read BOOLEAN DEFAULT 0,
      type TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT,
      sender TEXT,
      senderName TEXT,
      timestamp TEXT,
      time TEXT
    )
  `);

  saveDB();
  console.log('Database schema initialized successfully');
};

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
