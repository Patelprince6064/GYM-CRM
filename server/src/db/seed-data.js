/**
 * Shared seed data — single source of truth for demo content.
 * Mirrors `src/data/seed.ts` (frontend). Imported by both `server`
 * (persistent, Render) and `api` (in-memory, Vercel serverless).
 */
export const SEED_CLIENTS = [
  { name: "Rahul Sharma", age: 28, phone: "+91 98765 43210", email: "rahul.sharma@email.com", avatar: "RS", avatarColor: "from-violet-500 to-purple-600", plan: "Premium", startDate: "2026-01-15", endDate: "2026-07-15", remainingDays: 42, currentWeight: 79.5, goalWeight: 72, height: 175, status: "Active", goal: "Weight Loss", attendance: 92 },
  { name: "Priya Patel", age: 24, phone: "+91 87654 32109", email: "priya.patel@email.com", avatar: "PP", avatarColor: "from-pink-500 to-rose-600", plan: "Elite", startDate: "2026-02-01", endDate: "2026-08-01", remainingDays: 59, currentWeight: 58.2, goalWeight: 55, height: 162, status: "Active", goal: "Toning", attendance: 88 },
  { name: "Amit Verma", age: 35, phone: "+91 76543 21098", email: "amit.verma@email.com", avatar: "AV", avatarColor: "from-emerald-500 to-teal-600", plan: "Basic", startDate: "2026-05-20", endDate: "2026-06-20", remainingDays: 17, currentWeight: 88.0, goalWeight: 82, height: 180, status: "Expiring", goal: "Muscle Gain", attendance: 75 },
  { name: "Sunita Rao", age: 42, phone: "+91 65432 10987", email: "sunita.rao@email.com", avatar: "SR", avatarColor: "from-amber-500 to-yellow-600", plan: "Premium", startDate: "2025-12-10", endDate: "2026-06-10", remainingDays: 7, currentWeight: 65.5, goalWeight: 60, height: 158, status: "Expiring", goal: "Flexibility", attendance: 60 },
  { name: "Vikram Singh", age: 30, phone: "+91 54321 09876", email: "vikram.singh@email.com", avatar: "VS", avatarColor: "from-blue-500 to-cyan-600", plan: "Elite", startDate: "2026-03-01", endDate: "2026-09-01", remainingDays: 90, currentWeight: 92.0, goalWeight: 85, height: 183, status: "Active", goal: "Strength", attendance: 95 },
  { name: "Kavya Nair", age: 26, phone: "+91 43210 98765", email: "kavya.nair@email.com", avatar: "KN", avatarColor: "from-fuchsia-500 to-pink-600", plan: "Basic", startDate: "2025-11-01", endDate: "2026-05-01", remainingDays: 0, currentWeight: 54.0, goalWeight: 52, height: 156, status: "Expired", goal: "Weight Loss", attendance: 40 },
  { name: "Arjun Mehta", age: 22, phone: "+91 32109 87654", email: "arjun.mehta@email.com", avatar: "AM", avatarColor: "from-indigo-500 to-blue-600", plan: "Premium", startDate: "2026-04-10", endDate: "2026-10-10", remainingDays: 129, currentWeight: 70.0, goalWeight: 78, height: 177, status: "Active", goal: "Muscle Gain", attendance: 98 },
  { name: "Deepika Joshi", age: 31, phone: "+91 21098 76543", email: "deepika.joshi@email.com", avatar: "DJ", avatarColor: "from-lime-500 to-green-600", plan: "Elite", startDate: "2026-01-05", endDate: "2026-07-05", remainingDays: 32, currentWeight: 62.0, goalWeight: 58, height: 165, status: "Active", goal: "Endurance", attendance: 85 },
];

export const SEED_WEIGHT_HISTORY = [
  { date: "01 May", weight: 82.0 }, { date: "05 May", weight: 81.6 }, { date: "10 May", weight: 81.2 },
  { date: "15 May", weight: 80.8 }, { date: "20 May", weight: 80.5 }, { date: "25 May", weight: 80.1 },
  { date: "01 Jun", weight: 82.0 }, { date: "02 Jun", weight: 81.8 }, { date: "03 Jun", weight: 81.5 },
  { date: "04 Jun", weight: 81.2 },
];

export const SEED_WEIGHT_TABLE = [
  { date: "01 Jun", weight: "82.0 kg", change: "-", bmi: "26.8" },
  { date: "02 Jun", weight: "81.8 kg", change: "-0.2 kg", bmi: "26.7" },
  { date: "03 Jun", weight: "81.5 kg", change: "-0.3 kg", bmi: "26.6" },
  { date: "04 Jun", weight: "81.2 kg", change: "-0.3 kg", bmi: "26.5" },
  { date: "05 Jun", weight: "81.0 kg", change: "-0.2 kg", bmi: "26.4" },
  { date: "06 Jun", weight: "80.7 kg", change: "-0.3 kg", bmi: "26.3" },
  { date: "07 Jun", weight: "80.5 kg", change: "-0.2 kg", bmi: "26.2" },
];

export const SEED_NOTIFICATIONS = [
  { message: "Rahul Sharma completed Chest + Triceps workout", time: "2 hours ago", read: 0, type: "info" },
  { message: "Priya Patel updated weight to 58.2 kg", time: "3 hours ago", read: 0, type: "success" },
  { message: "Sunita Rao membership expiring in 7 days", time: "6 hours ago", read: 0, type: "warning" },
];

/**
 * Insert seed rows into an open sql.js database instance.
 * Shared by `server` (persistent) and `api` (in-memory serverless).
 */
export const seedDatabase = (target) => {
  for (const c of SEED_CLIENTS) {
    target.run(
      `INSERT INTO clients (name, age, phone, email, avatar, avatarColor, plan, startDate, endDate, remainingDays, currentWeight, goalWeight, height, status, goal, attendance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.name, c.age, c.phone, c.email, c.avatar, c.avatarColor, c.plan, c.startDate, c.endDate, c.remainingDays, c.currentWeight, c.goalWeight, c.height, c.status, c.goal, c.attendance]
    );
  }
  for (const w of SEED_WEIGHT_HISTORY) {
    target.run(`INSERT INTO weight_history (date, weight) VALUES (?, ?)`, [w.date, w.weight]);
  }
  for (const wt of SEED_WEIGHT_TABLE) {
    target.run(`INSERT INTO weight_table_data (date, weight, change, bmi) VALUES (?, ?, ?, ?)`, [wt.date, wt.weight, wt.change, wt.bmi]);
  }
  for (const n of SEED_NOTIFICATIONS) {
    target.run(`INSERT INTO notifications (message, time, read, type) VALUES (?, ?, ?, ?)`, [n.message, n.time, n.read, n.type]);
  }
};
