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
    attendance INTEGER DEFAULT 0,
    address TEXT,
    notes TEXT,
    membershipAmount REAL,
    avatarUrl TEXT
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
  // Real attendance. One row per member per day — `present` distinguishes
  // an actual check-in from a recorded no-show.
  `CREATE TABLE IF NOT EXISTS attendance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientId INTEGER NOT NULL,
    date TEXT NOT NULL,
    checkInTime TEXT,
    checkOutTime TEXT,
    present BOOLEAN DEFAULT 1
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_member_day
     ON attendance_logs (clientId, date)`,
  // Which insight/action items an operator has already dealt with.
  `CREATE TABLE IF NOT EXISTS dismissed_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    signalId TEXT NOT NULL UNIQUE,
    dismissedBy TEXT,
    createdAt TEXT
  )`,
  // Accounts for API authentication. `passwordHash`/`salt` are scrypt output
  // and must never be selected into a response body.
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    clientId INTEGER
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email)`,
]

/**
 * Columns added after the first release. Existing databases get them via
 * ALTER TABLE; names come from this hardcoded list (never from input).
 */
const COLUMN_ADDITIONS = {
  clients: [
    { name: 'address', ddl: 'TEXT' },
    { name: 'notes', ddl: 'TEXT' },
    { name: 'membershipAmount', ddl: 'REAL' },
    { name: 'avatarUrl', ddl: 'TEXT' },
  ],
  weight_history: [{ name: 'clientId', ddl: 'INTEGER' }],
  weight_table_data: [{ name: 'clientId', ddl: 'INTEGER' }],
};

/** Bring an existing database up to the current schema without data loss. */
export const migrateDatabase = (db) => {
  for (const [table, columns] of Object.entries(COLUMN_ADDITIONS)) {
    const existing = new Set();
    const info = db.exec(`PRAGMA table_info(${table})`);
    if (info[0]) {
      for (const row of info[0].values) existing.add(row[1]);
    }
    for (const column of columns) {
      if (!existing.has(column.name)) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column.name} ${column.ddl}`);
      }
    }
  }
}