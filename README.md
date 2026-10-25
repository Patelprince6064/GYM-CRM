<div align="center">

  <h1>GYM CRM — Fitness Management Platform</h1>

  <p>
    A full-stack management platform for fitness businesses, with a cinematic public
    site, an operator dashboard, and a member portal — all sharing one design system
    and one deterministic insight engine.
  </p>

  <br/>

  ![Version](https://img.shields.io/badge/version-1.0.0-C6FF3D?style=for-the-badge&labelColor=0a0a0a)
  ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&labelColor=0a0a0a)
  ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&labelColor=0a0a0a)
  ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&labelColor=0a0a0a)
  ![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?style=for-the-badge&logo=sqlite&labelColor=0a0a0a)
  ![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge&labelColor=0a0a0a)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Design System](#design-system)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Authentication & Roles](#authentication--roles)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Verification](#verification)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Overview

GYM CRM has three surfaces:

| Surface | Route | Audience |
|---|---|---|
| Public site | `/` | Prospective customers — no API calls at all |
| Operator workspace | `/dashboard`, `/clients`, `/memberships`, `/reports`, `/workouts`, `/daily-updates`, `/weight` | Administrators |
| Member portal | `/member`, `/member-dashboard`, `/member-activity` | Signed-in members |

Everything the product claims to know is derived from records it actually holds.
There are no placeholder KPIs, no invented growth percentages and no fabricated
trend lines: where a comparison cannot be made honestly, the trend indicator is
omitted and the panel says so.

---

## Features

### Public site (`/`)

Transparent→solid navbar with an animated mobile menu, a near-full-screen hero,
a dashboard preview with floating metrics (desktop-only parallax), a metrics and
capabilities strip, six alternating feature sections, an intelligence section, a
three-step "how it works", a membership section, a final CTA and a footer.

The page is a **public route and never calls the API**. Its figures are computed
from the bundled demo dataset and labelled "Sample workspace / Sample data".

### Operator workspace

| Feature | Description |
|---|---|
| **Dashboard** | Greeting header, honest KPI cards, member growth + attendance charts, plan mix donut, quick actions |
| **Gym Pulse** | Today's roster, real week-on-week check-in comparison, membership phase totals |
| **Smart Action Center** | De-duplicated, priority-ranked task list with dismiss / restore |
| **Member Milestones** | Streaks and visit counts evidenced by actual check-in rows |
| **Members** | Search, filter, sort, table + card views, detail panel, confirm dialogs, CSV |
| **Memberships** | Real expiry dates, phase filters, one-click renewal, CSV export |
| **Reports** | Date-ranged datasets with preview table and CSV download |
| **Global search** | ⌘K / Ctrl-K palette across members and pages |
| **Workout schedules, daily logs, weight management** | Full CRUD with validation |

### Member portal

Personal dashboard, activity log with tabs, weight tracker with BMI, profile
picture upload, daily log entry, and plan/expiry messaging.

### What this product deliberately does **not** do

- **No payment processing.** Renewals are staff-recorded changes to a date field.
- **No machine-learning or medical claims.** The insight engine is four published
  rules over your records (see `src/lib/insights.ts`).
- **No invented statistics.**

---

## Design System

Dark-first, single accent, Inter-only typography.

| Token | Value |
|---|---|
| Page background | `#070807` |
| Surface | `#0D100E` |
| Raised surface | `#121612` |
| Border | `rgba(255,255,255,0.09)` |
| Accent (lime) | `#C6FF3D` |
| Accent (sage) | `#9BBE72` |
| Primary text | `#F5F7F2` |
| Secondary text | `#969B93` |

Tokens, component layers (buttons, forms, badges, cards, tables, modals, charts),
motion utilities, reduced-motion overrides and responsive rules all live in
`src/styles/index.css`. `BRAND` in `src/constants/index.ts` is a configurable
label layer — change those strings and the UI re-labels itself.

Motion runs on the existing Framer Motion dependency and animates only
`transform`/`opacity`. `prefers-reduced-motion` disables reveals, counters and
parallax throughout.

---

## Tech Stack

**Frontend** — React 19, TypeScript ~6.0, Vite 8, Tailwind CSS v4, Framer Motion 12,
Recharts 3, Lucide, React Router v7.

**Backend** — Node.js LTS, Express 4, `sql.js` (SQLite), `node:crypto` for
passwords and session tokens. No authentication dependency is added.

**Tooling** — concurrently, ESLint, Vercel (frontend + serverless API),
Render (persistent backend).

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Install

```bash
npm install
npm --prefix server install
```

### 2. Configure (optional for local dev)

```bash
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

Set `AUTH_SECRET` if you want sessions to survive a server restart (see
[Environment Variables](#environment-variables)). Without it the server generates
an ephemeral key and prints a warning.

### 3. Run

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:5000 |

Vite proxies `/api/*` to `localhost:5000`.

### 4. Sign in

| Role | Email | Password |
|---|---|---|
| Administrator | `admin123@gmail.com` | `admin123` |
| Member | `user@gymcrm.com` | `user123` |

Override both with `DEFAULT_ADMIN_PASSWORD` / `DEFAULT_MEMBER_PASSWORD` before
any real deployment, and change them through the app afterwards.

---

## Authentication & Roles

### Model

- Passwords are salted **scrypt** hashes (`server/src/lib/crypto.js`); they are
  never returned, logged or stored in plaintext.
- Sessions are **HMAC-SHA256 signed stateless tokens** (12-hour expiry) sent as
  `Authorization: Bearer <token>` and attached to every request by
  `src/services/api.ts`.
- `POST /api/auth/register` only opens an account for an email that already
  belongs to a member record, and always issues the `user` role — the request
  body cannot ask for admin.
- Password changes require the **current** password.

### Roles

| Capability | Admin | Member |
|---|:---:|:---:|
| Read all members / logs / attendance | ✅ | ❌ |
| Read own record, logs, attendance, weight | ✅ | ✅ |
| Create, edit, delete members | ✅ | ❌ |
| Change plan, start/end date, status, amount | ✅ | ❌ |
| Update own body metrics / profile picture | ✅ | ✅ |
| Notifications feed, dismissed signals | ✅ | ❌ |
| Record attendance, delete attendance rows | ✅ | own rows only / ❌ |

Enforcement is **server-side** in `server/src/middleware/auth.js` plus per-route
checks in `server/src/routes/*`. A member session reads exactly one member row,
one attendance slice and one weight slice, regardless of what it asks for.

### Offline fallback

If the API is unreachable at sign-in, the client falls back to credentials held in
this browser and shows an amber banner saying so. That mode is a demo convenience:
it is labelled in the UI and never presented as a server-verified session.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Base URL for API requests from the frontend |
| `PORT` | `5000` | Port the Express server listens on |
| `AUTH_SECRET` | ephemeral | HMAC key for session tokens — **at least 16 characters** |
| `DEFAULT_ADMIN_PASSWORD` | `admin123` | Seed password for the demo admin (first boot only) |
| `DEFAULT_MEMBER_PASSWORD` | `user123` | Seed password for the demo member (first boot only) |
| `NODE_ENV` | `development` | `development` or `production` |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.env` and `server/data/` are gitignored. **Never commit secrets or the database.**

---

## Architecture

```
Browser
  ├── Public site  (/, no API calls)
  ├── /login       ──► POST /api/auth/login ──► { token, user }
  └── Workspace    ──► every request carries Authorization: Bearer <token>
        │
        ▼  Vite dev proxy /api → localhost:5000   (Vercel: api/index.js)
Express app factory  createApp(db)
  ├── /api/health, /api/auth          public
  ├── requireAuth                     ← HMAC verification, attaches req.user
  ├── /api/clients                    per-route RBAC + record scoping
  ├── /api/daily-updates, /attendance scoped by role
  ├── /api/weight-history, -table     scoped by role
  ├── /api/notifications, /signals    admin only
  └── /api/chat-messages              authenticated
        │
        ▼
sql.js  ──  server/data/gym.db (Render, persistent)
        ──  in-memory          (Vercel serverless)
```

`createApp` is decoupled from `listen`, so `server/src/server.js` (persistent,
Render) and `api/index.js` (serverless, Vercel) share one set of routes and
middleware.

---

## Database Schema

Created by `server/src/db/schema.js` (single source of truth) and migrated in
place by `migrateDatabase()` for existing databases.

```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, age INTEGER, phone TEXT, email TEXT,
  avatar TEXT, avatarColor TEXT, plan TEXT,
  startDate TEXT, endDate TEXT, remainingDays INTEGER,
  currentWeight REAL, goalWeight REAL, height REAL,
  status TEXT, goal TEXT, attendance INTEGER DEFAULT 0,
  address TEXT, notes TEXT, membershipAmount REAL, avatarUrl TEXT
);

CREATE TABLE users (            -- API accounts (added in this release)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, email TEXT NOT NULL,
  passwordHash TEXT NOT NULL, salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  clientId INTEGER
);
CREATE UNIQUE INDEX idx_users_email ON users (email);

CREATE TABLE attendance_logs (  -- one row per member per day (new)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clientId INTEGER NOT NULL, date TEXT NOT NULL,
  checkInTime TEXT, checkOutTime TEXT, present BOOLEAN DEFAULT 1
);
CREATE UNIQUE INDEX idx_attendance_member_day ON attendance_logs (clientId, date);

CREATE TABLE dismissed_signals ( -- persisted Action Center dismissals (new)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  signalId TEXT NOT NULL UNIQUE, dismissedBy TEXT, createdAt TEXT
);

-- Also: daily_updates, weight_history (+clientId), weight_table_data
--       (+clientId), notifications, chat_messages
```

Membership `status` and `remainingDays` are **derived from `endDate`** on every
read path in the client, so a record never goes stale as dates pass.

---

## API Reference

All routes are prefixed with `/api`. Everything except `/health` and `/auth/*`
requires `Authorization: Bearer <token>`.

### Auth (public)

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| `POST` | `/auth/login` | `{ email, password }` | `{ token, user }` |
| `POST` | `/auth/register` | `{ name, email, password }` | `{ token, user }` (201) |
| `PUT` | `/auth/password` | `{ email, currentPassword, newPassword }` | `{ success }` |
| `GET` | `/auth/me` | — | `{ user }` (requires token) |
| `GET` | `/health` | — | `{ status, timestamp }` |

### Members

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/clients` | admin: all · member: own row only |
| `GET` | `/clients/:id` | owner or admin |
| `POST` | `/clients` | admin |
| `PUT` | `/clients/:id` | admin: all fields · member: body metrics + avatar only |
| `DELETE` | `/clients/:id` | admin |

### Attendance (new)

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/attendance?clientId=&from=&to=&limit=` | admin: all · member: own |
| `GET` | `/attendance/today` | admin: all · member: own |
| `POST` | `/attendance` | admin: any member · member: self (upsert per member+day) |
| `DELETE` | `/attendance/:id` | admin |

### Insights (new)

| Method | Endpoint | Access |
|---|---|---|
| `GET` | `/signals/dismissed` | admin |
| `POST` | `/signals/dismissed` | admin (`{ signalId }`, idempotent) |
| `DELETE` | `/signals/dismissed/:id` | admin |

### Logs, weight, notifications, chat

| Method | Endpoint | Access |
|---|---|---|
| `GET`/`POST` | `/daily-updates` | admin: all · member: own rows (owner forced server-side) |
| `GET`/`POST` | `/weight-history` | admin: all · member: own |
| `GET`/`POST` | `/weight-table-data` | admin: all · member: own |
| `GET`/`POST`/`PUT` | `/notifications`, `/notifications/:id/read`, `/notifications/read-all` | admin |
| `GET`/`POST` | `/chat-messages` | authenticated (sender forced from the session) |

Errors always return `{ "error": "<human-readable message>" }`. Stack traces,
SQL and internal paths are logged server-side only.

---

## Project Structure

```
api/index.js                 # Vercel serverless entry (in-memory sql.js)
server/
  src/
    lib/crypto.js            # scrypt hashing + HMAC session tokens
    db/
      schema.js              # tables + migrateDatabase()
      accounts.js            # demo accounts, email normalisation
      database.js            # persistent connection + autosave
      seed-data.js           # shared demo dataset (relative dates)
    middleware/
      auth.js                # requireAuth / requireAdmin / ownsRecord
      cors.js
    routes/
      auth.js                # login / register / me / password
      clients.js             # RBAC + record scoping
      attendance.js  signals.js  daily-updates.js
      weight.js  notifications.js  chat.js  health.js
    app.js                   # createApp(db) factory
    server.js                # HTTP bootstrap (Render)
src/
  app/                       # routes, providers
  components/
    ui/                      # Button, Card, Modal, Table, Avatar, Toast, …
    motion/                  # Reveal, Stagger, AnimatedCounter
    charts/                  # shared Recharts tooltip
    layout/                  # shell, sidebar, topbar, global search
    landing/                 # public site sections
    dashboard/               # GymPulse, ActionCenter, Milestones
  context/                   # AuthContext, DataContext
  lib/insights.ts            # deterministic rules engine + CSV export
  pages/                     # admin | member | auth | landing
  services/api.ts            # every backend call, with auth header
  styles/index.css           # design tokens + component layers
  data/seed.ts               # frontend demo data
```

---

## Verification

Commands actually run against this repository:

```bash
npx tsc -b        # type check — clean
npm run lint      # ESLint — clean
npm run build     # tsc + vite build — succeeds
npm run dev       # backend + frontend together
```

Plus a live API suite (`auth-smoke`) exercising 27 assertions against a running
server: unauthenticated rejection, generic credential errors, admin/member login,
tampered-token rejection, member record isolation (read/edit/delete cross-member),
membership-term escalation blocked, self-service body metrics still allowed,
member cannot create members, attendance scoping, notifications/signals RBAC,
registration gating, password-change gating, and absence of stack traces or SQL
in error bodies.

---

## Deployment

### Vercel (frontend + serverless API)

`vercel.json` rewrites `/api/(.*)` → `api/index.js`. The serverless instance uses
**in-memory** SQLite: data resets on every cold start — fine for demos, not for
production. Set `AUTH_SECRET` in the dashboard.

### Render (persistent backend)

`render-blueprint.yaml` starts `server/src/server.js` with a persistent disk for
`server/data/gym.db`. Set `AUTH_SECRET` and the demo password overrides as
environment variables.

### Self-hosted

```bash
npm run build
node server/src/server.js     # serve dist/ with your web server
```

---

## Known Limitations

1. **Offline mode is client-side.** When the API is unreachable, the app runs on
   a localStorage copy of the dataset and credentials held in the browser. Role
   isolation is enforced by the API, not by that cache — acceptable for a demo,
   not a substitute for the server.
2. **Stateless tokens are not revocable.** A signed token stays valid until it
   expires (12 hours). Signing out clears it client-side only; there is no
   server-side denylist.
3. **Weight history has no audit trail.** Entries record the owning member but
   not who wrote them or when.
4. **The chat thread is workspace-wide.** It is one operator↔member thread, not
   per-member conversations.
5. **Notifications have no owner column**, so they are admin-only rather than
   per-recipient.
6. **Local date display only.** Expiry maths uses the server/browser local
   timezone with no per-gym timezone configuration.
7. **Responsive verification** covers 1440+, 1024–1439, 768–1023 and 320–767 by
   construction (fluid grids + explicit breakpoints); it has not been run through
   a device lab.

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
