/**
 * Account table helpers.
 *
 * The `users` table is created by the shared schema in `schema.js`; this
 * module only guarantees the two demo accounts exist so a fresh (or
 * previously account-less) database is never locked out of the API.
 */
import { hashPassword } from '../lib/crypto.js';

/** Lower-cased, trimmed — the canonical form used for every lookup. */
export const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase().slice(0, 160);

/** Shape returned to clients. The hash and salt never leave the server. */
export const publicUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  clientId: row.clientId ?? null,
});

const firstClientName = (db) => {
  try {
    const result = db.exec('SELECT name FROM clients ORDER BY id ASC LIMIT 1');
    const value = result[0]?.values?.[0]?.[0];
    return typeof value === 'string' ? value : null;
  } catch {
    return null;
  }
};

/** The member-facing demo account documented in the README. */
const DEMO_MEMBER_EMAIL = 'user@gymcrm.com';

const firstClientId = (db) => {
  try {
    const result = db.exec('SELECT id FROM clients ORDER BY id ASC LIMIT 1');
    const value = result[0]?.values?.[0]?.[0];
    return typeof value === 'number' ? value : null;
  } catch {
    return null;
  }
};

/**
 * Create the demo admin and demo member if they are missing.
 * Safe to call on every boot — existing rows are never touched, so a
 * password changed through the UI survives a restart. The one repair it
 * does perform is re-binding the demo member to a live record when its
 * stored `clientId` points at a member that has since been deleted.
 */
export const ensureDemoUsers = (db) => {
  let rows = [];
  try {
    const result = db.exec('SELECT id, email, clientId FROM users');
    const columns = result[0]?.columns ?? [];
    rows = (result[0]?.values ?? []).map((values) =>
      Object.fromEntries(columns.map((column, index) => [column, values[index]])),
    );
  } catch {
    return;
  }

  const byEmail = new Map(rows.map((row) => [normalizeEmail(row.email), row]));
  const memberAnchor = firstClientId(db);

  // Repair: the demo member must point at a record that actually exists.
  const demoMember = byEmail.get(normalizeEmail(DEMO_MEMBER_EMAIL));
  if (demoMember && memberAnchor != null && Number(demoMember.clientId) !== memberAnchor) {
    const ids = new Set();
    try {
      const found = db.exec('SELECT id FROM clients');
      for (const row of found[0]?.values ?? []) ids.add(row[0]);
    } catch {
      /* no clients table yet — nothing to repair against */
    }
    if (!ids.has(demoMember.clientId)) {
      db.run('UPDATE users SET clientId = ? WHERE id = ?', [memberAnchor, demoMember.id]);
      demoMember.clientId = memberAnchor;
    }
  }

  const existing = new Set([...byEmail.keys()]);
  const memberName = firstClientName(db) ?? 'Demo Member';
  const demos = [
    {
      name: 'Demo Admin',
      email: 'admin123@gmail.com',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      clientId: null,
    },
    {
      name: memberName,
      email: DEMO_MEMBER_EMAIL,
      password: process.env.DEFAULT_MEMBER_PASSWORD || 'user123',
      role: 'user',
      clientId: memberAnchor,
    },
  ];

  for (const demo of demos) {
    const email = normalizeEmail(demo.email);
    if (existing.has(email)) continue;
    const { salt, hash } = hashPassword(demo.password);
    db.run(
      'INSERT INTO users (name, email, passwordHash, salt, role, clientId) VALUES (?, ?, ?, ?, ?, ?)',
      [demo.name, email, hash, salt, demo.role, demo.clientId],
    );
  }
};
