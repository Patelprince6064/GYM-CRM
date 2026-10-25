/** App-wide constants. */

export const API_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * Brand identity. The product ships as "GYM CRM"; the NEXUS FITNESS OS
 * direction is a layer on top — change these strings and the whole UI
 * re-labels itself.
 */
export const BRAND = {
  name: 'GYM CRM',
  /** System / design-direction label rendered under the wordmark. */
  system: 'NEXUS FITNESS OS',
  tagline: 'Fitness management, engineered.',
  description:
    'One intelligent platform to manage members, track performance, and build a stronger fitness business.',
  trustLine: 'BUILT FOR MODERN FITNESS BUSINESSES',
  established: 'EST. 2026',
  /**
   * Published on the landing page's contact block. Leave null until the
   * operator supplies a real address — the page shows setup guidance
   * instead of a placeholder.
   */
  contactEmail: null as string | null,
} as const

export const STORAGE_KEYS = {
  user: 'gym_crm_user',
  users: 'gym_crm_users',
  token: 'gym_crm_token',
  clients: 'gym_crm_clients',
  dailyUpdates: 'gym_crm_daily_updates',
  weightHistory: 'gym_crm_weight_history',
  weightTable: 'gym_crm_weight_table',
  notifications: 'gym_crm_notifications',
  chatMessages: 'gym_crm_chat_messages',
  attendanceLogs: 'gym_crm_attendance_logs',
  actionCenter: 'gym_crm_action_center',
} as const

/**
 * Curated avatar colour tokens — resolved to gradients by
 * `components/ui/Avatar`. Legacy `from-* to-*` values stored in old
 * records still resolve; these are what new records get.
 */
export const AVATAR_COLORS = [
  'av-0',
  'av-1',
  'av-2',
  'av-3',
  'av-4',
  'av-5',
  'av-6',
  'av-7',
  'av-8',
  'av-9',
] as const

export const ROUTES = {
  landing: '/',
  login: '/login',
  dashboard: '/dashboard',
  clients: '/clients',
  memberships: '/memberships',
  reports: '/reports',
  workouts: '/workouts',
  dailyUpdates: '/daily-updates',
  weight: '/weight',
  member: '/member',
  memberDashboard: '/member-dashboard',
  memberActivity: '/member-activity',
} as const

/** Landing page section ids — kept in sync with `LandingNavbar`. */
export const LANDING_SECTIONS = {
  platform: 'platform',
  features: 'features',
  intelligence: 'intelligence',
  membership: 'membership',
  contact: 'contact',
} as const
