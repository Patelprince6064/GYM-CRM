/**
 * Shared SQL schema — single source of truth for table definitions.
 * Imported by both `server` (persistent, Render) and `api` (in-memory, Vercel).
 */
export const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS clients (
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
  )`,
  `CREATE TABLE IF NOT EXISTS daily_updates (
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
    heartRate INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS weight_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    weight REAL
  )`,
  `CREATE TABLE IF NOT EXISTS weight_table_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    weight TEXT,
    change TEXT,
    bmi TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    time TEXT,
    read BOOLEAN DEFAULT 0,
    type TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    sender TEXT,
    senderName TEXT,
    timestamp TEXT,
    time TEXT
  )`,
];
