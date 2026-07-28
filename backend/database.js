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

  // Seed initial data if clients table is empty
  const countResult = db.exec('SELECT COUNT(*) as count FROM clients');
  const count = countResult[0]?.values[0][0] || 0;
  if (count === 0) {
    console.log('Seeding initial data into database...');
    
    // Seed Clients
    const initialClients = [
      { name: "Rahul Sharma", age: 28, phone: "+91 98765 43210", email: "rahul.sharma@email.com", avatar: "RS", avatarColor: "from-violet-500 to-purple-600", plan: "Premium", startDate: "2026-01-15", endDate: "2026-07-15", remainingDays: 42, currentWeight: 79.5, goalWeight: 72, height: 175, status: "Active", goal: "Weight Loss", attendance: 92 },
      { name: "Priya Patel", age: 24, phone: "+91 87654 32109", email: "priya.patel@email.com", avatar: "PP", avatarColor: "from-pink-500 to-rose-600", plan: "Elite", startDate: "2026-02-01", endDate: "2026-08-01", remainingDays: 59, currentWeight: 58.2, goalWeight: 55, height: 162, status: "Active", goal: "Toning", attendance: 88 },
      { name: "Amit Verma", age: 35, phone: "+91 76543 21098", email: "amit.verma@email.com", avatar: "AV", avatarColor: "from-emerald-500 to-teal-600", plan: "Basic", startDate: "2026-05-20", endDate: "2026-06-20", remainingDays: 17, currentWeight: 88.0, goalWeight: 82, height: 180, status: "Expiring", goal: "Muscle Gain", attendance: 75 },
      { name: "Sunita Rao", age: 42, phone: "+91 65432 10987", email: "sunita.rao@email.com", avatar: "SR", avatarColor: "from-amber-500 to-yellow-600", plan: "Premium", startDate: "2025-12-10", endDate: "2026-06-10", remainingDays: 7, currentWeight: 65.5, goalWeight: 60, height: 158, status: "Expiring", goal: "Flexibility", attendance: 60 },
      { name: "Vikram Singh", age: 30, phone: "+91 54321 09876", email: "vikram.singh@email.com", avatar: "VS", avatarColor: "from-blue-500 to-cyan-600", plan: "Elite", startDate: "2026-03-01", endDate: "2026-09-01", remainingDays: 90, currentWeight: 92.0, goalWeight: 85, height: 183, status: "Active", goal: "Strength", attendance: 95 },
      { name: "Kavya Nair", age: 26, phone: "+91 43210 98765", email: "kavya.nair@email.com", avatar: "KN", avatarColor: "from-fuchsia-500 to-pink-600", plan: "Basic", startDate: "2025-11-01", endDate: "2026-05-01", remainingDays: 0, currentWeight: 54.0, goalWeight: 52, height: 156, status: "Expired", goal: "Weight Loss", attendance: 40 },
      { name: "Arjun Mehta", age: 22, phone: "+91 32109 87654", email: "arjun.mehta@email.com", avatar: "AM", avatarColor: "from-indigo-500 to-blue-600", plan: "Premium", startDate: "2026-04-10", endDate: "2026-10-10", remainingDays: 129, currentWeight: 70.0, goalWeight: 78, height: 177, status: "Active", goal: "Muscle Gain", attendance: 98 },
      { name: "Deepika Joshi", age: 31, phone: "+91 21098 76543", email: "deepika.joshi@email.com", avatar: "DJ", avatarColor: "from-lime-500 to-green-600", plan: "Elite", startDate: "2026-01-05", endDate: "2026-07-05", remainingDays: 32, currentWeight: 62.0, goalWeight: 58, height: 165, status: "Active", goal: "Endurance", attendance: 85 }
    ];

    for (const c of initialClients) {
      db.run(
        `INSERT INTO clients (name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.name, c.age, c.phone, c.email, c.avatar, c.avatarColor, c.plan, c.startDate, c.endDate, c.remainingDays, c.currentWeight, c.goalWeight, c.height, c.status, c.goal, c.attendance]
      );
    }

    // Seed Weight History
    const initialWeightHistory = [
      { date: "01 May", weight: 82.0 }, { date: "05 May", weight: 81.6 }, { date: "10 May", weight: 81.2 },
      { date: "15 May", weight: 80.8 }, { date: "20 May", weight: 80.5 }, { date: "25 May", weight: 80.1 },
      { date: "01 Jun", weight: 82.0 }, { date: "02 Jun", weight: 81.8 }, { date: "03 Jun", weight: 81.5 },
      { date: "04 Jun", weight: 81.2 }
    ];
    for (const w of initialWeightHistory) {
      db.run(`INSERT INTO weight_history (date, weight) VALUES (?, ?)`, [w.date, w.weight]);
    }

    // Seed Weight Table Data
    const initialWeightTable = [
      { date: "01 Jun", weight: "82.0 kg", change: "-", bmi: "26.8" },
      { date: "02 Jun", weight: "81.8 kg", change: "-0.2 kg", bmi: "26.7" },
      { date: "03 Jun", weight: "81.5 kg", change: "-0.3 kg", bmi: "26.6" },
      { date: "04 Jun", weight: "81.2 kg", change: "-0.3 kg", bmi: "26.5" },
      { date: "05 Jun", weight: "81.0 kg", change: "-0.2 kg", bmi: "26.4" },
      { date: "06 Jun", weight: "80.7 kg", change: "-0.3 kg", bmi: "26.3" },
      { date: "07 Jun", weight: "80.5 kg", change: "-0.2 kg", bmi: "26.2" }
    ];
    for (const wt of initialWeightTable) {
      db.run(`INSERT INTO weight_table_data (date, weight, change, bmi) VALUES (?, ?, ?, ?)`, [wt.date, wt.weight, wt.change, wt.bmi]);
    }

    // Seed Notifications
    const initialNotifs = [
      { message: "Rahul Sharma completed Chest + Triceps workout", time: "2 hours ago", read: 0, type: "info" },
      { message: "Priya Patel updated weight to 58.2 kg", time: "3 hours ago", read: 0, type: "success" },
      { message: "Sunita Rao membership expiring in 7 days", time: "6 hours ago", read: 0, type: "warning" }
    ];
    for (const n of initialNotifs) {
      db.run(`INSERT INTO notifications (message, time, read, type) VALUES (?, ?, ?, ?)`, [n.message, n.time, n.read, n.type]);
    }

    console.log('Database seeded successfully!');
  }

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
