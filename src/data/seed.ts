/**
 * Canonical seed / fallback data — the SINGLE source of truth for demo content.
 * Used by the frontend (offline fallback) and mirrored by the server seed script
 * (`server/src/db/seed-data.js`), so a fresh local start and a fresh deploy
 * produce the same workspace.
 *
 * Membership dates are offsets from "today": a newly seeded workspace always
 * shows a believable mix of active, expiring and expired members.
 */
import type { Client, DailyUpdate, WeightEntry, WeightTableEntry, ChatMessage, WorkoutDay } from '@/types'

const DAY_MS = 86_400_000

/** "YYYY-MM-DD" for `offset` days from today (negative = past). */
export const dayOffset = (offset: number): string =>
  new Date(Date.now() + offset * DAY_MS).toISOString().split('T')[0]

/** Plan durations used to keep start/end dates internally consistent. */
const PLAN_DAYS: Record<string, number> = { Basic: 30, Premium: 180, Elite: 365 }

interface Blueprint {
  name: string
  age: number
  phone: string
  email: string
  plan: string
  /** Days until expiry — negative means already expired. */
  left: number
  currentWeight: number
  goalWeight: number
  height: number
  goal: string
  attendance: number
  amount: number
  address: string
  notes: string
  color: string
}

const BLUEPRINTS: Blueprint[] = [
  { name: 'Rahul Sharma', age: 28, phone: '+91 98765 43210', email: 'rahul.sharma@email.com', plan: 'Premium', left: 62, currentWeight: 79.5, goalWeight: 72, height: 175, goal: 'Weight Loss', attendance: 92, amount: 3600, address: 'Indiranagar, Bengaluru', notes: 'Prefers 6 AM slots. Bench PR target 100 kg.', color: 'av-0' },
  { name: 'Priya Patel', age: 24, phone: '+91 87654 32109', email: 'priya.patel@email.com', plan: 'Elite', left: 118, currentWeight: 58.2, goalWeight: 55, height: 162, goal: 'Toning', attendance: 88, amount: 7200, address: 'Koramangala, Bengaluru', notes: 'Training for a 10K in December.', color: 'av-1' },
  { name: 'Amit Verma', age: 35, phone: '+91 76543 21098', email: 'amit.verma@email.com', plan: 'Basic', left: 4, currentWeight: 88.0, goalWeight: 82, height: 180, goal: 'Muscle Gain', attendance: 75, amount: 1500, address: 'HSR Layout, Bengaluru', notes: 'Renewal conversation due this week.', color: 'av-2' },
  { name: 'Sunita Rao', age: 42, phone: '+91 65432 10987', email: 'sunita.rao@email.com', plan: 'Premium', left: 6, currentWeight: 65.5, goalWeight: 60, height: 158, goal: 'Flexibility', attendance: 60, amount: 3600, address: 'Whitefield, Bengaluru', notes: 'Recovering from a shoulder strain — cleared for lower body.', color: 'av-3' },
  { name: 'Vikram Singh', age: 30, phone: '+91 54321 09876', email: 'vikram.singh@email.com', plan: 'Elite', left: 84, currentWeight: 92.0, goalWeight: 85, height: 183, goal: 'Strength', attendance: 95, amount: 7200, address: 'Jayanagar, Bengaluru', notes: 'Powerlifting block — peaking in 6 weeks.', color: 'av-5' },
  { name: 'Kavya Nair', age: 26, phone: '+91 43210 98765', email: 'kavya.nair@email.com', plan: 'Basic', left: -9, currentWeight: 54.0, goalWeight: 52, height: 156, goal: 'Weight Loss', attendance: 40, amount: 1500, address: 'Malleshwaram, Bengaluru', notes: 'Membership lapsed — win-back call pending.', color: 'av-4' },
  { name: 'Arjun Mehta', age: 22, phone: '+91 32109 87654', email: 'arjun.mehta@email.com', plan: 'Premium', left: 145, currentWeight: 70.0, goalWeight: 78, height: 177, goal: 'Muscle Gain', attendance: 98, amount: 3600, address: 'Hebbal, Bengaluru', notes: 'New member — first review at 30 days.', color: 'av-6' },
  { name: 'Deepika Joshi', age: 31, phone: '+91 21098 76543', email: 'deepika.joshi@email.com', plan: 'Elite', left: 120, currentWeight: 62.0, goalWeight: 58, height: 165, goal: 'Endurance', attendance: 85, amount: 7200, address: 'JP Nagar, Bengaluru', notes: 'Marathon block — long run on Sundays.', color: 'av-1' },
]

export const initialClients: Client[] = BLUEPRINTS.map((c) => {
  const duration = PLAN_DAYS[c.plan] ?? 180
  const endDate = dayOffset(c.left)
  const startDate = dayOffset(c.left - duration)
  const status = c.left < 0 ? 'Expired' : c.left <= 14 ? 'Expiring' : 'Active'
  const initials = c.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return {
    id: BLUEPRINTS.indexOf(c) + 1,
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
  }
})

export const initialDailyUpdates: DailyUpdate[] = [
  { clientId: 1, name: 'Rahul Sharma', avatar: 'RS', avatarColor: 'av-0', date: 'Today', workout: true, workoutName: 'Chest & Triceps Hypertrophy', water: 3.5, calories: 2450, sleep: 7.5, steps: 10420, mood: 'Energized', notes: 'Hit personal record on bench press!', heartRate: 142 },
  { clientId: 2, name: 'Priya Patel', avatar: 'PP', avatarColor: 'av-1', date: 'Today', workout: true, workoutName: 'Legs & Core Conditioning', water: 2.8, calories: 1850, sleep: 8.0, steps: 12150, mood: 'Great', notes: 'Increased squat weight by 5kg.', heartRate: 155 },
  { clientId: 5, name: 'Vikram Singh', avatar: 'VS', avatarColor: 'av-5', date: 'Yesterday', workout: true, workoutName: 'Back & Biceps Power', water: 4.0, calories: 2800, sleep: 7.0, steps: 8900, mood: 'Pushed', notes: 'Heavy deadlifts feeling good.', heartRate: 160 },
]

export const initialWeightHistory: WeightEntry[] = [
  { date: '01 May', weight: 82.0 },
  { date: '05 May', weight: 81.6 },
  { date: '10 May', weight: 81.2 },
  { date: '15 May', weight: 80.8 },
  { date: '20 May', weight: 80.5 },
  { date: '25 May', weight: 80.1 },
  { date: '01 Jun', weight: 82.0 },
  { date: '02 Jun', weight: 81.8 },
  { date: '03 Jun', weight: 81.5 },
  { date: '04 Jun', weight: 81.2 },
]

export const initialWeightTable: WeightTableEntry[] = [
  { date: '01 Jun', weight: '82.0 kg', change: '-', bmi: '26.8' },
  { date: '02 Jun', weight: '81.8 kg', change: '-0.2 kg', bmi: '26.7' },
  { date: '03 Jun', weight: '81.5 kg', change: '-0.3 kg', bmi: '26.6' },
  { date: '04 Jun', weight: '81.2 kg', change: '-0.3 kg', bmi: '26.5' },
  { date: '05 Jun', weight: '81.0 kg', change: '-0.2 kg', bmi: '26.4' },
  { date: '06 Jun', weight: '80.7 kg', change: '-0.3 kg', bmi: '26.3' },
  { date: '07 Jun', weight: '80.5 kg', change: '-0.2 kg', bmi: '26.2' },
]

export interface NotificationItem {
  id: number
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning'
}

export const initialNotifications: NotificationItem[] = [
  { id: 1, message: 'Rahul Sharma completed Chest + Triceps workout', time: '2 hours ago', read: false, type: 'info' },
  { id: 2, message: 'Priya Patel updated weight to 58.2 kg', time: '3 hours ago', read: false, type: 'success' },
  { id: 3, message: 'Sunita Rao membership expiring in 6 days', time: '6 hours ago', read: false, type: 'warning' },
]

export const initialChatMessages: ChatMessage[] = [
  { id: 1, text: 'Welcome to GymCRM! Feel free to ask any questions about your training plan.', sender: 'admin', senderName: 'Admin', timestamp: new Date().toISOString(), time: '10:00 AM' },
]

// ===================== WORKOUT SCHEDULE =====================

export const workoutSchedule: WorkoutDay[] = [
  { day: 'Monday', short: 'MON', focus: 'Chest + Triceps', exercises: ['Bench Press 4×10', 'Incline DB Press 3×12', 'Cable Flyes 3×15', 'Tricep Pushdowns 4×12', 'Skull Crushers 3×10'], duration: '60 min', intensity: 'High', color: 'from-lime-500 to-green-600', icon: '💪', isRest: false },
  { day: 'Tuesday', short: 'TUE', focus: 'Back + Biceps', exercises: ['Deadlifts 4×6', 'Pull-ups 4×8', 'Seated Rows 3×12', 'Lat Pulldowns 3×15', 'Barbell Curls 4×10'], duration: '65 min', intensity: 'High', color: 'from-teal-500 to-cyan-600', icon: '🏋️', isRest: false },
  { day: 'Wednesday', short: 'WED', focus: 'Legs', exercises: ['Squats 5×8', 'Leg Press 4×12', 'Lunges 3×15', 'Leg Curls 3×12', 'Calf Raises 4×20'], duration: '70 min', intensity: 'Very High', color: 'from-emerald-500 to-teal-600', icon: '🦵', isRest: false },
  { day: 'Thursday', short: 'THU', focus: 'Shoulders', exercises: ['OHP 4×10', 'Arnold Press 3×12', 'Lateral Raises 4×15', 'Front Raises 3×15', 'Face Pulls 3×15'], duration: '55 min', intensity: 'Medium', color: 'from-amber-500 to-yellow-600', icon: '🏆', isRest: false },
  { day: 'Friday', short: 'FRI', focus: 'Cardio', exercises: ['Treadmill 20 min', 'Cycling 15 min', 'Jump Rope 10 min', 'Battle Ropes 3×1 min', 'Stair Climber 10 min'], duration: '60 min', intensity: 'Medium', color: 'from-rose-500 to-pink-600', icon: '🏃', isRest: false },
  { day: 'Saturday', short: 'SAT', focus: 'Core', exercises: ['Planks 3×1 min', 'Crunches 4×20', 'Russian Twists 3×20', 'Leg Raises 4×15', 'Ab Rollouts 3×12'], duration: '45 min', intensity: 'Medium', color: 'from-fuchsia-500 to-purple-600', icon: '🎯', isRest: false },
  { day: 'Sunday', short: 'SUN', focus: 'Rest Day', exercises: ['Light stretching', 'Foam rolling', 'Meditation', 'Recovery walk'], duration: '30 min', intensity: 'Low', color: 'from-slate-500 to-slate-600', icon: '😴', isRest: true },
]
