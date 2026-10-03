<div align="center">

  <h1>🏋️ GYM CRM — Fitness Management Platform</h1>

  <p>
    A premium, full-stack Customer Relationship Management platform built exclusively for fitness businesses.<br/>
    Manage members, track performance, and grow your gym — all from a single, beautiful dashboard.
  </p>

  <br/>

  ![Version](https://img.shields.io/badge/version-1.0.0-FACC15?style=for-the-badge&labelColor=0a0a0a)
  ![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&labelColor=0a0a0a)
  ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&labelColor=0a0a0a)
  ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&labelColor=0a0a0a)
  ![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&labelColor=0a0a0a)
  ![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge&labelColor=0a0a0a)

  <br/>

  [🚀 Live Demo](#) · [📖 Documentation](#table-of-contents) · [🐛 Report Bug](#contributing) · [✨ Request Feature](#contributing)

  <br/>
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Gym CRM** is an enterprise-grade fitness management platform designed to give gym owners, trainers, and members an all-in-one digital workspace. Built with a modern **React 19 + TypeScript** frontend and a robust **Node.js/Express** backend, it delivers real-time data insights, member lifecycle management, and personalized member portals — all wrapped in a stunning dark-mode, glassmorphism UI.

> **Who is it for?**
> - 🏢 **Gym Owners & Admins** — Full operational control: client management, analytics, communication
> - 💪 **Members** — A personal health companion: logs, weight tracking, BMI, and progress charts

---

## ✨ Features

### 👑 Admin Panel

| Feature | Description |
|---|---|
| **Interactive Dashboard** | Real-time KPI cards, membership growth charts (Recharts), and a live activity feed |
| **Client Management** | Create, view, edit, and archive member profiles with plan tracking |
| **Membership Status Tracking** | Visualize active, expiring-soon, and expired memberships at a glance |
| **Daily Logs Oversight** | Monitor all member workout logs, water intake, calorie counts, sleep, and heart rate |
| **Weight Management** | View all members weight histories and BMI trends on interactive charts |
| **Workout Schedule Viewer** | Global view of all member workout programs and daily schedules |
| **Live Chat** | Real-time admin-to-member direct messaging system |
| **Notification Center** | System-generated alerts for membership renewals, weight updates, and activity milestones |
| **Report Export** | Download daily and weekly CRM data reports |

### 🙋 Member Portal

| Feature | Description |
|---|---|
| **Personalized Dashboard** | Current plan status, attendance tracking, and daily goal summary |
| **Daily Activity Logs** | Log workouts, water intake, calories, sleep hours, steps, mood, and heart rate |
| **Weight Tracker** | Log weight entries, auto-calculate BMI, and visualize progress on a live graph |
| **Progress History** | Full historical view of all personal weight and fitness log entries |
| **Role-Based Isolation** | Strict data separation — members can only access their own private records |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | Core UI framework |
| **TypeScript** | ~6.0 | Type-safe development |
| **Vite** | 8.x | Blazing-fast build tooling & HMR |
| **Tailwind CSS** | v4.3 | Utility-first CSS framework |
| **Framer Motion** | 12.x | Declarative animations & micro-interactions |
| **Recharts** | 3.x | Responsive data visualization |
| **Lucide React** | Latest | Beautiful, consistent icon library |
| **React Router DOM** | v7 | Client-side routing |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | LTS | JavaScript runtime |
| **Express.js** | 4.x | Lightweight HTTP server & API routing |
| **SQLite3** | via better-sqlite3 | Embedded relational database |
| **sql.js** | 1.x | In-memory SQLite for serverless environments |
| **CORS** | 2.x | Cross-origin resource sharing middleware |

### DevOps & Tooling
| Tool | Purpose |
|---|---|
| **Vercel** | Frontend deployment + serverless API functions |
| **Render** | Persistent backend deployment |
| **concurrently** | Run frontend and backend in parallel locally |
| **ESLint** | Code quality enforcement |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │  Auth Pages  │   │  Admin Panel │   │ Member Portal│   │
│  │  (Login)     │   │  (Dashboard, │   │ (Dashboard,  │   │
│  │              │   │   Clients,   │   │  Activity,   │   │
│  │              │   │   Reports)   │   │  Weight)     │   │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │
│         │                  │                   │            │
│         └──────────────────┼───────────────────┘            │
│                            │ React Router v7                 │
│                    ┌───────┴────────┐                       │
│                    │  AuthContext   │                       │
│                    │  (Role-Based)  │                       │
│                    └───────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │ REST API (/api/*)
                             │ Vite Dev Proxy → localhost:5000
                             │ Vercel → /api/index.js (serverless)
┌────────────────────────────┼────────────────────────────────┐
│                     BACKEND (Express.js)                     │
│                            │                                 │
│           ┌────────────────┼──────────────────┐             │
│           │                │                  │             │
│     ┌─────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐     │
│     │  /clients  │  │/daily-updates│  │  /weight-    │     │
│     │            │  │             │  │   history    │     │
│     └─────┬──────┘  └──────┬──────┘  └───────┬──────┘     │
│           │                │                  │             │
│     ┌─────▼──────┐  ┌──────▼──────┐           │            │
│     │/notifications│ │/chat-messages│          │            │
│     └─────┬──────┘  └──────┬──────┘           │            │
│           └────────────────┼──────────────────┘            │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │   SQLite DB    │                       │
│                    │   (gym.db)     │                       │
│                    │   [Persistent] │                       │
│                    └────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

> **Dual Deployment Strategy**: The Express app factory (`createApp`) is decoupled from the HTTP server, allowing it to be used both as a persistent Render web service (`server/src/server.js`) and as Vercel serverless functions (`api/index.js`) — sharing the same route and middleware logic.

---

## 🗄️ Database Schema

The SQLite database (`gym.db`) is auto-created on first run. All tables use `CREATE TABLE IF NOT EXISTS` for safe initialization.

```sql
-- Member profiles and subscription management
CREATE TABLE clients (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  age           INTEGER,
  phone         TEXT,
  email         TEXT,
  avatar        TEXT,
  avatarColor   TEXT,
  plan          TEXT,           -- e.g., "Monthly", "Quarterly", "Annual"
  startDate     TEXT,
  endDate       TEXT,
  remainingDays INTEGER,
  currentWeight REAL,
  goalWeight    REAL,
  height        REAL,
  status        TEXT,           -- "active" | "expiring" | "expired"
  goal          TEXT,
  attendance    INTEGER DEFAULT 0
);

-- Daily health & activity entries per member
CREATE TABLE daily_updates (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  clientId    INTEGER,
  name        TEXT,
  avatar      TEXT,
  avatarColor TEXT,
  date        TEXT,
  workout     BOOLEAN,
  workoutName TEXT,
  water       INTEGER,          -- in ml
  calories    INTEGER,
  sleep       REAL,             -- in hours
  steps       INTEGER,
  mood        TEXT,
  notes       TEXT,
  heartRate   INTEGER
);

-- Weight progress tracking (chart data)
CREATE TABLE weight_history (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  date   TEXT,
  weight REAL
);

-- Weight log table with BMI records
CREATE TABLE weight_table_data (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  date   TEXT,
  weight TEXT,
  change TEXT,
  bmi    TEXT
);

-- System & event notifications
CREATE TABLE notifications (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT,
  time    TEXT,
  read    BOOLEAN DEFAULT 0,
  type    TEXT                  -- "info" | "warning" | "success"
);

-- Admin to member chat messages
CREATE TABLE chat_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  text       TEXT,
  sender     TEXT,             -- "admin" | "member"
  senderName TEXT,
  timestamp  TEXT,
  time       TEXT
);
```

---

## 📡 API Reference

All API routes are prefixed with `/api`. The backend runs on `http://localhost:5000` in development.

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/clients` | Fetch all clients |
| `GET` | `/api/clients/:id` | Fetch single client |
| `POST` | `/api/clients` | Create new client |
| `PUT` | `/api/clients/:id` | Update client profile |
| `DELETE` | `/api/clients/:id` | Delete a client |

### Daily Updates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/daily-updates` | Fetch all daily logs |
| `GET` | `/api/daily-updates/:clientId` | Fetch logs for a specific client |
| `POST` | `/api/daily-updates` | Submit a new daily log |
| `PUT` | `/api/daily-updates/:id` | Update a log entry |

### Weight Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/weight-history` | Fetch chart weight history |
| `GET` | `/api/weight-table-data` | Fetch tabular weight log with BMI |
| `POST` | `/api/weight-history` | Add a new weight entry |
| `POST` | `/api/weight-table-data` | Add a weight record with BMI |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | Fetch all notifications |
| `PUT` | `/api/notifications/:id/read` | Mark a notification as read |
| `POST` | `/api/notifications` | Create a notification |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chat-messages` | Fetch all chat messages |
| `POST` | `/api/chat-messages` | Send a new message |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18.x — [Download](https://nodejs.org/)
- **npm** >= 9.x (bundled with Node.js)
- **Git** — [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gym-crm.git
cd gym-crm
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` to match your setup (see [Environment Variables](#-environment-variables)).

### 3. Install Dependencies

```bash
# Install root (frontend) dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 4. Run in Development Mode

The following command starts both the frontend and backend concurrently:

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | `http://localhost:5173` |
| Backend (Express) | `http://localhost:5000` |

> The Vite dev server proxies all `/api/*` requests to `localhost:5000`, so no CORS issues arise in development.

### 5. Default Credentials

> Change these before deploying to production.

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Member | *(any member name)* | `member123` |

---

## 🔐 Environment Variables

Create a `.env` file in the project root. Reference `.env.example` for all required keys.

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Base URL for API requests from the frontend |
| `PORT` | `5000` | Port the Express backend server listens on |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |

```env
# .env
VITE_API_URL=/api
PORT=5000
```

---

## 📁 Project Structure

```
gym-crm/
├── api/
│   └── index.js                # Vercel serverless function entry point
│
├── public/
│   └── assets/                 # Static assets (banner, icons, etc.)
│
├── server/                     # Express.js backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js     # Database connection factory
│   │   │   ├── schema.js       # SQL table definitions (single source of truth)
│   │   │   └── seed-data.js    # Initial seed data for demo
│   │   ├── middleware/
│   │   │   └── cors.js         # CORS configuration middleware
│   │   ├── routes/
│   │   │   ├── clients.js      # Client CRUD routes
│   │   │   ├── daily-updates.js# Daily log routes
│   │   │   ├── weight.js       # Weight history routes
│   │   │   ├── notifications.js# Notification routes
│   │   │   ├── chat.js         # Chat message routes
│   │   │   └── health.js       # Health check route
│   │   ├── app.js              # Express app factory
│   │   └── server.js           # HTTP server bootstrap (Render)
│   └── package.json
│
├── src/                        # React frontend (TypeScript)
│   ├── app/                    # App shell & router
│   ├── assets/                 # Images, SVGs
│   ├── components/             # Reusable UI components
│   ├── constants/              # App-wide constants
│   ├── context/                # React context (Auth, etc.)
│   ├── data/                   # Static/mock data
│   ├── hooks/                  # Custom React hooks
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx       # Admin overview with charts
│   │   │   ├── Clients.tsx         # Member management table
│   │   │   ├── DailyUpdates.tsx    # All members daily logs
│   │   │   ├── WeightManagement.tsx# Weight analytics
│   │   │   └── WorkoutSchedules.tsx# Workout schedule viewer
│   │   ├── auth/               # Login / auth pages
│   │   └── member/
│   │       ├── MemberDashboard.tsx # Member home screen
│   │       ├── MemberPortal.tsx    # Member profile & plan
│   │       └── MemberActivity.tsx  # Member daily log entry
│   ├── services/               # API service layer (fetch wrappers)
│   ├── styles/                 # Global CSS & design tokens
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Helper utilities
│   └── main.tsx                # React app entry point
│
├── .env.example                # Environment variable template
├── .gitignore
├── index.html                  # Vite HTML entry point
├── package.json                # Root package (frontend + scripts)
├── render-blueprint.yaml       # Render.com deployment config
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel deployment config
└── vite.config.ts              # Vite bundler configuration
```

---

## ☁️ Deployment

This project supports two deployment strategies. Mix and match based on your needs.

### Option 1: Vercel (Recommended — Full-Stack)

Vercel hosts the React frontend and runs the Express backend as serverless functions via `api/index.js`.

> Note: Vercel uses an in-memory SQLite (`sql.js`) instance — data is reset on each cold start. This is ideal for demos. For persistent production data, use Option 2 or connect to an external database.

**Steps:**
1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com/).
3. Set environment variables in the Vercel dashboard.
4. Click **Deploy**. Vercel auto-detects the `vercel.json` configuration.

```json
// vercel.json (already configured)
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/(.*)",     "destination": "/index.html"   }
  ]
}
```

---

### Option 2: Render (Persistent Backend)

Deploy the Express backend to Render for a persistent `gym.db` file on disk.

**Steps:**
1. Push your repository to GitHub.
2. Create a new Web Service on [Render](https://render.com/) pointing to your repo.
3. Render auto-detects `render-blueprint.yaml`.
4. Deploy your frontend separately to Vercel or Netlify, and set `VITE_API_URL` to your Render service URL.

---

### Option 3: Self-Hosted / VPS

```bash
# 1. Build the frontend
npm run build

# 2. Start the backend
node server/src/server.js

# 3. Serve the dist/ folder with nginx or a static host
```

---

## 🎨 UI/UX Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Dark Mode First** | Deep black backgrounds (`#0a0a0a`) with vibrant yellow-gold accents (`#FACC15`) |
| **Glassmorphism** | Translucent card surfaces with `backdrop-filter: blur()` for modern depth |
| **Micro-interactions** | Framer Motion-powered hover animations, page transitions, and chart tooltips |
| **Responsive Design** | Mobile-first layout with Tailwind CSS breakpoints |
| **Data Visualization** | Interactive Recharts line, bar, and area graphs with custom tooltips |
| **Typography** | Modern sans-serif system fonts for legibility at all sizes |

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

  Made with love and dedication for the fitness community

  Star this repo if you find it useful!

</div>
