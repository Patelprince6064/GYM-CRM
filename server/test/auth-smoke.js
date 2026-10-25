/**
 * Auth & Role-Based Access Control Smoke Test Suite.
 * Exercises 27 security and functionality assertions against the Express API.
 */
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { SCHEMA_SQL, migrateDatabase } from '../src/db/schema.js';
import { seedDatabase } from '../src/db/seed-data.js';
import { ensureDemoUsers } from '../src/db/accounts.js';
import { createApp } from '../src/app.js';

let passed = 0;
let failed = 0;

function it(description, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
  }
}

async function itAsync(description, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${description}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
  }
}

async function runSuite() {
  console.log('\n========================================');
  console.log('Running GYM CRM API & RBAC Smoke Suite');
  console.log('========================================\n');

  // Initialize in-memory test database
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  for (const sql of SCHEMA_SQL) {
    db.run(sql);
  }
  migrateDatabase(db);
  seedDatabase(db);
  ensureDemoUsers(db);

  const dbAll = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  };

  const dbRun = (sql, params = []) => {
    db.run(sql, params);
    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const res = stmt.getAsObject();
    stmt.free();
    return { id: res.id || 0, changes: 1 };
  };

  const dbGet = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    let row = null;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  };

  const app = createApp({ dbAll, dbRun, dbGet });

  // Start temporary server for HTTP requests
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  let adminToken = '';
  let memberToken = '';
  let memberClientId = null;

  try {
    // 1. Health check is public
    await itAsync('1. Health check is public and returns 200', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'ok');
    });

    // 2. Unauthenticated request to protected endpoint is rejected
    await itAsync('2. Unauthenticated request to protected endpoint is rejected with 401', async () => {
      const res = await fetch(`${baseUrl}/clients`);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.ok(data.error);
    });

    // 3. Login with invalid credentials returns 401 with generic error
    await itAsync('3. Login with invalid password returns 401 with generic message', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin123@gmail.com', password: 'wrongpassword' }),
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.error, 'Email or password is incorrect');
    });

    // 4. Login with non-existent user returns 401 with identical generic message
    await itAsync('4. Login with non-existent email returns 401 with identical generic message', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nosuchuser@example.com', password: 'wrongpassword' }),
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.error, 'Email or password is incorrect');
    });

    // 5. Admin login succeeds and returns user with role admin
    await itAsync('5. Admin login succeeds and returns user with role "admin"', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin123@gmail.com', password: 'admin123' }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.token);
      assert.equal(data.user.role, 'admin');
      assert.equal(data.user.passwordHash, undefined);
      assert.equal(data.user.salt, undefined);
      adminToken = data.token;
    });

    // 6. Member login succeeds and returns user with role user and valid clientId
    await itAsync('6. Member login succeeds with role "user" and linked clientId', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@gymcrm.com', password: 'user123' }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.token);
      assert.equal(data.user.role, 'user');
      assert.ok(data.user.clientId);
      memberToken = data.token;
      memberClientId = data.user.clientId;
    });

    // 7. Verify /auth/me returns caller profile
    await itAsync('7. GET /auth/me verifies session token and returns caller', async () => {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.user.email, 'admin123@gmail.com');
    });

    // 8. Tampered token signature is rejected
    await itAsync('8. Tampered token signature is rejected with 401', async () => {
      const tampered = adminToken.slice(0, -4) + 'abcd';
      const res = await fetch(`${baseUrl}/clients`, {
        headers: { Authorization: `Bearer ${tampered}` },
      });
      assert.equal(res.status, 401);
    });

    // 9. Malformed token is rejected
    await itAsync('9. Malformed Authorization header is rejected with 401', async () => {
      const res = await fetch(`${baseUrl}/clients`, {
        headers: { Authorization: 'Bearer not.a.valid.jwt' },
      });
      assert.equal(res.status, 401);
    });

    // 10. Admin can list all clients
    await itAsync('10. Admin can list all clients', async () => {
      const res = await fetch(`${baseUrl}/clients`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 1);
    });

    // 11. Member can only view their own record in client list
    await itAsync('11. Member record isolation: GET /clients returns only own record', async () => {
      const res = await fetch(`${baseUrl}/clients`, {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.equal(data.length, 1);
      assert.equal(data[0].id, memberClientId);
    });

    // 12. Member cannot view another member by id
    await itAsync('12. Member cannot view another member via GET /clients/:otherId (403)', async () => {
      const otherId = memberClientId === 1 ? 2 : 1;
      const res = await fetch(`${baseUrl}/clients/${otherId}`, {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      assert.equal(res.status, 403);
    });

    // 13. Member CAN view their own record via GET /clients/:ownId
    await itAsync('13. Member CAN view their own record via GET /clients/:ownId', async () => {
      const res = await fetch(`${baseUrl}/clients/${memberClientId}`, {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.id, memberClientId);
    });

    // 14. Member cannot create a new client
    await itAsync('14. Member cannot create a new member (403 required)', async () => {
      const res = await fetch(`${baseUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`,
        },
        body: JSON.stringify({ name: 'Hacker Member', email: 'hack@gymcrm.com', plan: 'Elite' }),
      });
      assert.equal(res.status, 403);
    });

    // 15. Member cannot delete another client
    await itAsync('15. Member cannot delete a member (403 required)', async () => {
      const otherId = memberClientId === 1 ? 2 : 1;
      const res = await fetch(`${baseUrl}/clients/${otherId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      assert.equal(res.status, 403);
    });

    // 16. Member cannot escalate membership terms on PUT /clients/:ownId
    await itAsync('16. Membership-term escalation blocked on member update (403)', async () => {
      const before = dbGet('SELECT plan, endDate FROM clients WHERE id = ?', [memberClientId]);
      const res = await fetch(`${baseUrl}/clients/${memberClientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`,
        },
        body: JSON.stringify({
          plan: 'Lifetime VIP Free',
          endDate: '2099-01-01',
          currentWeight: 75.5,
        }),
      });
      assert.equal(res.status, 403, 'Attempting to change plan/endDate must be rejected with 403 Forbidden');
      const after = dbGet('SELECT plan, endDate FROM clients WHERE id = ?', [memberClientId]);
      assert.equal(after.plan, before.plan);
      assert.equal(after.endDate, before.endDate);
    });

    // 17. Self-service body metrics allowed
    await itAsync('17. Self-service body metrics (goalWeight, height) successfully persist', async () => {
      const res = await fetch(`${baseUrl}/clients/${memberClientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`,
        },
        body: JSON.stringify({ goalWeight: 70.0, height: 180 }),
      });
      assert.equal(res.status, 200);
      const after = dbGet('SELECT goalWeight, height FROM clients WHERE id = ?', [memberClientId]);
      assert.equal(after.goalWeight, 70.0);
      assert.equal(after.height, 180);
    });

    // 18. Attendance: member cannot record attendance for another member
    await itAsync('18. Member cannot log attendance for another clientId (403)', async () => {
      const otherId = memberClientId === 1 ? 2 : 1;
      const res = await fetch(`${baseUrl}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`,
        },
        body: JSON.stringify({ clientId: otherId, date: '2026-10-25', checkInTime: '09:00', present: true }),
      });
      assert.equal(res.status, 403);
    });

    // 19. Member can record attendance for themselves
    await itAsync('19. Member can record check-in for themselves', async () => {
      const res = await fetch(`${baseUrl}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`,
        },
        body: JSON.stringify({ clientId: memberClientId, date: '2026-10-25', checkInTime: '08:30', present: true }),
      });
      assert.equal(res.status, 201);
    });

    // 20. Member query to /attendance returns only own records
    await itAsync('20. GET /attendance scopes to member own records only', async () => {
      const res = await fetch(`${baseUrl}/attendance`, {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      for (const log of data) {
        assert.equal(log.clientId, memberClientId);
      }
    });

    // 21. Member cannot delete attendance records
    await itAsync('21. Member cannot delete attendance record (403)', async () => {
      const res = await fetch(`${baseUrl}/attendance/1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      assert.equal(res.status, 403);
    });

    // 22. Member cannot create admin notifications
    await itAsync('22. Member cannot create admin notifications (403)', async () => {
      const res = await fetch(`${baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`,
        },
        body: JSON.stringify({ message: 'Fake announcement', type: 'system' }),
      });
      assert.equal(res.status, 403);
    });

    // 23. Signals RBAC: Non-admin cannot access dismissed signals
    await itAsync('23. Non-admin cannot access dismissed signals (403)', async () => {
      const res = await fetch(`${baseUrl}/signals/dismissed`, {
        headers: { Authorization: `Bearer ${memberToken}` },
      });
      assert.equal(res.status, 403);
    });

    // 24. Registration cannot create admin account
    await itAsync('24. Registration always assigns role "user" and requires existing client email', async () => {
      // First try random email not in clients -> rejected
      const failRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Stranger', email: 'random@nowhere.com', password: 'password123' }),
      });
      assert.equal(failRes.status, 403);

      // Add a client with email
      dbRun("INSERT INTO clients (name, email, plan, status) VALUES ('Test Member', 'testmember@example.com', 'Basic', 'Active')");

      // Register with that email
      const okRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Member', email: 'testmember@example.com', password: 'password123', role: 'admin' }),
      });
      assert.equal(okRes.status, 201);
      const data = await okRes.json();
      assert.equal(data.user.role, 'user', 'Role must remain user even if admin was submitted');
    });

    // 25. Password change validates current password
    await itAsync('25. Password change requires valid current password', async () => {
      const res = await fetch(`${baseUrl}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${memberToken}`,
        },
        body: JSON.stringify({
          email: 'user@gymcrm.com',
          currentPassword: 'wrongCurrentPassword',
          newPassword: 'newValidPassword123',
        }),
      });
      assert.equal(res.status, 401);
    });

    // 26. Absence of SQL or stack traces in error responses
    await itAsync('26. Absence of SQL errors or stack traces in 4xx/5xx responses', async () => {
      const res = await fetch(`${baseUrl}/clients/not-an-integer`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(!data.stack);
      assert.ok(!JSON.stringify(data).includes('SELECT'));
    });

    // 27. Passwords and salts are never returned in public APIs
    await itAsync('27. Passwords and salts are never returned in any response body', async () => {
      const res = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      assert.equal(data.user.passwordHash, undefined);
      assert.equal(data.user.salt, undefined);
    });

  } finally {
    server.close();
  }

  console.log('\n----------------------------------------');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('----------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
