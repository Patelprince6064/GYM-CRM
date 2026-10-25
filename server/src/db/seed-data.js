/**
 * Shared seed data — single source of truth for demo content.
 * Mirrors `src/data/seed.ts` (frontend). Imported by both `server`
 * (persistent, Render) and `api` (in-memory, Vercel).
 *
 * Membership dates are expressed as offsets from "today" so a freshly
 * seeded workspace always shows a believable mix of active, expiring and
 * expired members instead of a wall of long-stale dates.
 */

const DAY_MS = 86400000;

/** "YYYY-MM-DD" for `offset` days from today (negative = past). */
const dayOffset = (offset) => new Date(Date.now() + offset * DAY_MS).toISOString().split('T')[0];

/** Plan durations used to keep start/end dates internally consistent. */
const PLAN_DAYS = { Basic: 30, Premium: 180, Elite: 365 };

/**
 * name, plan, daysRemaining (negative = expired), plus profile data.
 * `amount` is the recorded membership value in ₹ — demo data only.
 */
const CLIENT_BLUEPRINT = [
  { name: 'Rahul Sharma', age: 28, phone: '+91 98765 43210', email: 'rahul.sharma@email.com', plan: 'Premium', left: 62, currentWeight: 79.5, goalWeight: 72, height: 175, goal: 'Weight Loss', attendance: 92, amount: 3600, address: 'Indiranagar, Bengaluru', notes: 'Prefers 6 AM slots. Bench PR target 100 kg.', color: 'av-0' },
  { name: 'Priya Patel', age: 24, phone: '+91 87654 32109', email: 'priya.patel@email.com', plan: 'Elite', left: 118, currentWeight: 58.2, goalWeight: 55, height: 162, goal: 'Toning', attendance: 88, amount: 7200, address: 'Koramangala, Bengaluru', notes: 'Training for a 10K in December.', color: 'av-1' },
  { name: 'Amit Verma', age: 35, phone: '+91 76543 21098', email: 'amit.verma@email.com', plan: 'Basic', left: 4, currentWeight: 88.0, goalWeight: 82, height: 180, goal: 'Muscle Gain', attendance: 75, amount: 1500, address: 'HSR Layout, Bengaluru', notes: 'Renewal conversation due this week.', color: 'av-2' },
  { name: 'Sunita Rao', age: 42, phone: '+91 65432 10987', email: 'sunita.rao@email.com', plan: 'Premium', left: 6, currentWeight: 65.5, goalWeight: 60, height: 158, goal: 'Flexibility', attendance: 60, amount: 3600, address: 'Whitefield, Bengaluru', notes: 'Recovering from a shoulder strain — cleared for lower body.', color: 'av-3' },
  { name: 'Vikram Singh', age: 30, phone: '+91 54321 09876', email: 'vikram.singh@email.com', plan: 'Elite', left: 84, currentWeight: 92.0, goalWeight: 85, height: 183, goal: 'Strength', attendance: 95, amount: 7200, address: 'Jayanagar, Bengaluru', notes: 'Powerlifting block — peaking in 6 weeks.', color: 'av-5' },
  { name: 'Kavya Nair', age: 26, phone: '+91 43210 98765', email: 'kavya.nair@email.com', plan: 'Basic', left: -9, currentWeight: 54.0, goalWeight: 52, height: 156, goal: 'Weight Loss', attendance: 40, amount: 1500, address: 'Malleshwaram, Bengaluru', notes: 'Membership lapsed — win-back call pending.', color: 'av-4' },
  { name: 'Arjun Mehta', age: 22, phone: '+91 32109 87654', email: 'arjun.mehta@email.com', plan: 'Premium', left: 145, currentWeight: 70.0, goalWeight: 78, height: 177, goal: 'Muscle Gain', attendance: 98, amount: 3600, address: 'Hebbal, Bengaluru', notes: 'New member — first review at 30 days.', color: 'av-6' },
  { name: 'Deepika Joshi', age: 31, phone: '+91 21098 76543', email: 'deepika.joshi@email.com', plan: 'Elite', left: 120, currentWeight: 62.0, goalWeight: 58, height: 165, goal: 'Endurance', attendance: 85, amount: 7200, address: 'JP Nagar, Bengaluru', notes: 'Marathon block — long run on Sundays.', color: 'av-1' },
];

export const SEED_CLIENTS = CLIENT_BLUEPRINT.map((c) => {
  const duration = PLAN_DAYS[c.plan] ?? 180;
  const endDate = dayOffset(c.left);
  const startDate = dayOffset(c.left - duration);
  const status = c.left < 0 ? 'Expired' : c.left <= 14 ? 'Expiring' : 'Active';
  const initials = c.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return {
    name: c.name,
    age: c.age,
    phone: c.phone,
    email: c.email,
    avatar: initials,
    avatarColor: c.color,
    plan: c.plan,
    startDate,
    endDate,
    remainingDays: c.left,
    currentWeight: c.currentWeight,
    goalWeight: c.goalWeight,
    height: c.height,
    status,
    goal: c.goal,
    attendance: c.attendance,
    address: c.address,
    notes: c.notes,
    membershipAmount: c.amount,
  };
});

export const SEED_WEIGHT_HISTORY = [
  { date: '01 May', weight: 82.0 }, { date: '05 May', weight: 81.6 }, { date: '10 May', weight: 81.2 },
  { date: '15 May', weight: 80.8 }, { date: '20 May', weight: 80.5 }, { date: '25 May', weight: 80.1 },
  { date: '01 Jun', weight: 82.0 }, { date: '02 Jun', weight: 81.8 }, { date: '03 Jun', weight: 81.5 },
  { date: '04 Jun', weight: 81.2 },
];

export const SEED_WEIGHT_TABLE = [
  { date: '01 Jun', weight: '82.0 kg', change: '-', bmi: '26.8' },
  { date: '02 Jun', weight: '81.8 kg', change: '-0.2 kg', bmi: '26.7' },
  { date: '03 Jun', weight: '81.5 kg', change: '-0.3 kg', bmi: '26.6' },
  { date: '04 Jun', weight: '81.2 kg', change: '-0.3 kg', bmi: '26.5' },
  { date: '05 Jun', weight: '81.0 kg', change: '-0.2 kg', bmi: '26.4' },
  { date: '06 Jun', weight: '80.7 kg', change: '-0.3 kg', bmi: '26.3' },
  { date: '07 Jun', weight: '80.5 kg', change: '-0.2 kg', bmi: '26.2' },
];

export const SEED_NOTIFICATIONS = [
  { message: 'Rahul Sharma completed Chest + Triceps workout', time: '2 hours ago', read: 0, type: 'info' },
  { message: 'Priya Patel updated weight to 58.2 kg', time: '3 hours ago', read: 0, type: 'success' },
  { message: 'Sunita Rao membership expiring in 7 days', time: '6 hours ago', read: 0, type: 'warning' },
];

/**
 * 60 days of deterministic check-in history. A fixed LCG keeps the
 * demo identical between restarts and between the Render / Vercel hosts,
 * so charts, streaks and engagement signals stay stable.
 */
export const buildSeedAttendance = () => {
  const logs = [];
  let seed = 20260425;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const checkIns = ['06:15 AM', '06:45 AM', '07:15 AM', '08:00 AM', '06:30 PM', '07:45 PM', '08:30 PM'];

  // Members 1-5 train regularly, 6-8 more sporadically — mirrors their attendance scores.
  const cadence = [0.78, 0.72, 0.58, 0.5, 0.84, 0.3, 0.8, 0.66];

  for (let i = 0; i < SEED_CLIENTS.length; i += 1) {
    const clientId = i + 1;
    for (let d = 1; d <= 60; d += 1) {
      const date = new Date(Date.now() - d * DAY_MS);
      const dow = date.getDay();
      const weekend = dow === 0 || dow === 6;
      const chance = weekend ? cadence[i] * 0.55 : cadence[i];
      const present = rnd() < chance;
      // Kavya's membership lapsed — no check-ins after it expired.
      if (i === 5 && d < 10) continue;
      logs.push({
        clientId,
        date: date.toISOString().split('T')[0],
        checkInTime: present ? checkIns[Math.floor(rnd() * checkIns.length)] : '',
        checkOutTime: present ? '07:30 PM' : '',
        present: present ? 1 : 0,
      });
    }
  }
  return logs;
};

/**
 * Insert seed rows into an open sql.js database instance.
 * Shared by `server` (persistent) and `api` (in-memory serverless).
 */
export const seedDatabase = (target) => {
  for (const c of SEED_CLIENTS) {
    target.run(
      `INSERT INTO clients (name, age, phone, email, avatar, avatarColor, plan, startDate, endDate,
                            remainingDays, currentWeight, goalWeight, height, status, goal, attendance,
                            address, notes, membershipAmount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.name, c.age, c.phone, c.email, c.avatar, c.avatarColor, c.plan, c.startDate, c.endDate,
       c.remainingDays, c.currentWeight, c.goalWeight, c.height, c.status, c.goal, c.attendance,
       c.address, c.notes, c.membershipAmount],
    );
  }
  for (const w of SEED_WEIGHT_HISTORY) {
    target.run(`INSERT INTO weight_history (date, weight, clientId) VALUES (?, ?, ?)`, [w.date, w.weight, 1]);
  }
  for (const wt of SEED_WEIGHT_TABLE) {
    target.run(`INSERT INTO weight_table_data (date, weight, change, bmi, clientId) VALUES (?, ?, ?, ?, ?)`, [wt.date, wt.weight, wt.change, wt.bmi, 1]);
  }
  for (const n of SEED_NOTIFICATIONS) {
    target.run(`INSERT INTO notifications (message, time, read, type) VALUES (?, ?, ?, ?)`, [n.message, n.time, n.read, n.type]);
  }
  for (const a of buildSeedAttendance()) {
    target.run(
      `INSERT OR IGNORE INTO attendance_logs (clientId, date, checkInTime, checkOutTime, present)
       VALUES (?, ?, ?, ?, ?)`,
      [a.clientId, a.date, a.checkInTime, a.checkOutTime, a.present],
    );
  }
};
