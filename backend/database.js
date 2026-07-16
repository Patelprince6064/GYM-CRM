import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = join(dataDir, 'gym.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Initialize database schema
export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Clients Table
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

      // Daily Updates Table
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

      // Weight History Table
      db.run(`
        CREATE TABLE IF NOT EXISTS weight_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          weight REAL
        )
      `);

      // Weight Table Data
      db.run(`
        CREATE TABLE IF NOT EXISTS weight_table_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT,
          weight TEXT,
          change TEXT,
          bmi TEXT
        )
      `);

      // Notifications Table
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message TEXT,
          time TEXT,
          read BOOLEAN DEFAULT 0,
          type TEXT
        )
      `);

      // Chat Messages Table
      db.run(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT,
          sender TEXT,
          senderName TEXT,
          timestamp TEXT,
          time TEXT
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

// Generic Promisified DB Run
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Generic Promisified DB All
export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Generic Promisified DB Get
export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export default db;
