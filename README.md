# Gym CRM - Fitness Management Platform

A premium, full-stack Gym Customer Relationship Management (CRM) platform built with React, Node.js, and SQLite. Designed with a modern dark theme and glassmorphism UI, this application provides an end-to-end solution for gym administrators and members to track progress, manage memberships, and log daily activities.

## 🚀 Features

### For Admins
- **Interactive Dashboard**: Real-time stats, membership growth charts (Recharts), and a live activity feed.
- **Client Management**: Create, edit, and manage member profiles, including tracking active, expiring, and expired memberships.
- **Global Oversight**: View all member daily logs, weight tracking history, and workout schedules.
- **Live Chat & Notifications**: Send direct messages to members and receive real-time notifications for system events (e.g., membership renewals, weight updates).
- **Report Generation**: Export daily/weekly CRM data reports.

### For Members
- **Member Portal**: A personalized dashboard to track attendance, current plan status, and daily goals.
- **Daily Workout Logs**: Track daily workouts, water intake, calories, sleep, mood, and heart rate.
- **Weight Management**: Log weight updates, automatically calculate BMI, and visualize progress on an interactive graph.
- **Role-Based Access Control**: Strict data isolation ensures members can only view and edit their own private data.

## 🛠️ Tech Stack

**Frontend:**
- React 19 (TypeScript)
- Vite
- Tailwind CSS v4 (Styling & Utilities)
- Recharts (Data Visualization)
- Lucide React (Icons)
- Framer Motion (Animations)

**Backend:**
- Node.js
- Express.js
- SQLite3 (Local Database via `gym.db`)
- CORS & Express JSON parser

## ⚙️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/gym-crm.git
cd gym-crm
```

### 2. Setup the Backend
The backend runs on an Express server and uses SQLite for data persistence.
```bash
cd backend
npm install
npm start
```
*The backend server will start on `http://localhost:5000` and automatically create the SQLite database file (`gym.db`) if it does not exist.*

### 3. Setup the Frontend
Open a new terminal window/tab and navigate back to the project root.
```bash
# Ensure you are in the root directory
npm install
npm run dev
```
*The React app will compile and become available at `http://localhost:5173`.*

## 🔐 Authentication Credentials

By default, the application comes with a pre-configured Admin account. New users must be created by the Admin via the **Client Management** tab before they can log in.

**Admin Login:**
- **Email:** `admin123@gmail.com`
- **Password:** `admin123`

*(Note: These credentials can be changed in `src/context/AuthContext.tsx`)*

## 🎨 UI/UX Highlights
- **Premium Dark Mode**: Carefully crafted color palettes featuring vibrant yellows (`#FACC15`) and deep blacks for a sleek fitness aesthetic.
- **Glassmorphism**: Translucent cards and blurred backgrounds for modern UI depth.
- **Micro-interactions**: Hover effects, smooth route transitions, and responsive chart tooltips.

## 📄 License
This project is licensed under the MIT License.
