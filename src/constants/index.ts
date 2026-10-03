/** App-wide constants. */

export const API_URL = import.meta.env.VITE_API_URL || '/api'

export const STORAGE_KEYS = {
  user: 'gym_crm_user',
  users: 'gym_crm_users',
  clients: 'gym_crm_clients',
  dailyUpdates: 'gym_crm_daily_updates',
  weightHistory: 'gym_crm_weight_history',
  weightTable: 'gym_crm_weight_table',
  notifications: 'gym_crm_notifications',
  chatMessages: 'gym_crm_chat_messages',
} as const

export const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-yellow-600',
  'from-blue-500 to-cyan-600',
  'from-fuchsia-500 to-pink-600',
  'from-indigo-500 to-blue-600',
  'from-lime-500 to-green-600',
  'from-red-500 to-orange-600',
  'from-cyan-500 to-sky-600',
] as const

export const ROUTES = {
  login: '/',
  dashboard: '/dashboard',
  clients: '/clients',
  workouts: '/workouts',
  dailyUpdates: '/daily-updates',
  weight: '/weight',
  member: '/member',
  memberDashboard: '/member-dashboard',
  memberActivity: '/member-activity',
} as const
