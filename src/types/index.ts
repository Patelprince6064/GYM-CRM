/** Central domain types — single source of truth for the whole app. */

export interface User {
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface Client {
  id: number
  name: string
  age: number
  phone: string
  email: string
  avatar: string
  avatarColor: string
  avatarUrl?: string
  plan: string
  startDate: string
  endDate: string
  remainingDays: number
  currentWeight: number
  goalWeight: number
  height: number
  status: string
  goal: string
  attendance: number
  address?: string
  notes?: string
  membershipAmount?: number
}

export interface AttendanceLog {
  id: number
  clientId: number
  /** ISO date string "YYYY-MM-DD" */
  date: string
  /** e.g. "08:30 AM" */
  checkInTime: string
  checkOutTime?: string
  present: boolean
}

export interface SavedWorkout {
  id: number
  name: string
  focus: string
  exercises: string[]
  duration: string
  intensity: string
}

export interface DailyUpdate {
  clientId: number
  name: string
  avatar: string
  avatarColor: string
  date: string
  workout: boolean
  workoutName: string
  water: number
  calories: number
  sleep: number
  steps: number
  mood: string
  notes: string
  heartRate: number
}

export interface WeightEntry {
  date: string
  weight: number
}

export interface WeightTableEntry {
  date: string
  weight: string
  change: string
  bmi: string
}

export interface NotificationItem {
  id: number
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning'
}

export type Notification = NotificationItem

export interface ChatMessage {
  id: number
  text: string
  sender: 'admin' | 'user'
  senderName: string
  timestamp: string
  time: string
}

export interface WorkoutDay {
  day: string
  short: string
  focus: string
  exercises: string[]
  duration: string
  intensity: string
  color: string
  icon: string
  isRest: boolean
}
