/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import {
  initialClients,
  initialDailyUpdates,
  initialWeightHistory,
  initialWeightTable,
  initialNotifications,
  initialChatMessages,
} from '../data/seed'
import type {
  AttendanceLog,
  ChatMessage,
  Client,
  DailyUpdate,
  NotificationItem,
  SavedWorkout,
  WeightEntry,
  WeightTableEntry,
} from '../types'
import { STORAGE_KEYS } from '../constants'
import { api } from '../services/api'
import { useAuth } from './AuthContext'
import { getInitials, randomAvatarColor, timeNow } from '../utils'
import { buildSampleLogs } from '../lib/sampleAttendance'
import { DEFAULT_RULES, daysUntil, membershipPhase } from '../lib/insights'

// Re-export domain types so existing `import { type Client } from '@/context/DataContext'` keeps working.
export type {
  AttendanceLog,
  ChatMessage,
  Client,
  DailyUpdate,
  NotificationItem,
  SavedWorkout,
  WeightEntry,
  WeightTableEntry,
}
export type Notification = NotificationItem

interface DataContextType {
  clients: Client[]
  addClient: (client: Omit<Client, 'id' | 'avatar' | 'avatarColor'>) => void
  updateClient: (id: number, data: Partial<Client>) => void
  deleteClient: (id: number) => void
  dailyUpdates: DailyUpdate[]
  addDailyUpdate: (update: DailyUpdate) => void
  weightHistory: WeightEntry[]
  addWeightEntry: (entry: WeightEntry) => void
  weightTableData: WeightTableEntry[]
  addWeightTableEntry: (entry: WeightTableEntry) => void
  notifications: Notification[]
  addNotification: (msg: string, type?: 'info' | 'success' | 'warning') => void
  markNotificationRead: (id: number) => void
  clearNotifications: () => void
  chatMessages: ChatMessage[]
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp' | 'time'>) => void
  attendanceLogs: AttendanceLog[]
  addAttendanceLog: (log: Omit<AttendanceLog, 'id'>) => Promise<boolean>
  removeAttendanceLog: (id: number) => Promise<boolean>
  /** Insight / action-centre items the operator has already dealt with. */
  dismissedSignals: string[]
  dismissSignal: (signalId: string) => void
  restoreSignal: (signalId: string) => void
  savedWorkouts: SavedWorkout[]
  addSavedWorkout: (workout: Omit<SavedWorkout, 'id'>) => void
  deleteSavedWorkout: (id: number) => void
  isBackendConnected: boolean
  /** True while the initial backend hydration is still in flight. */
  isHydrating: boolean
}

const DataContext = createContext<DataContextType | null>(null)

/**
 * Recompute the derived membership fields from `endDate`.
 *
 * `status` / `remainingDays` are stored, which means they drift: a record
 * seeded as "Active, 42 days left" is Expired a month later. Everything in
 * the UI reads the derived value, so we normalise on the way in rather than
 * trusting a snapshot that was written at a different point in time.
 */
function normalizeClient(client: Client): Client {
  const left = daysUntil(client.endDate)
  if (!Number.isFinite(left)) return client

  const phase = membershipPhase(client, new Date(), DEFAULT_RULES)
  return {
    ...client,
    remainingDays: left,
    status: phase === 'active' ? 'Active' : phase === 'expiring' ? 'Expiring' : 'Expired',
  }
}

function normalizeClients(list: Client[]): Client[] {
  return list.map(normalizeClient)
}

// LocalStorage helpers (keys come from `@/constants` STORAGE_KEYS, used as-is)
function loadLocalStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function saveLocalStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Error saving to localStorage', e)
  }
}

/** Optimistic temp id for entities created while offline (replaced once the backend responds). */
function generateTempId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>(() =>
    normalizeClients(loadLocalStorage(STORAGE_KEYS.clients, initialClients)),
  )
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>(() => loadLocalStorage(STORAGE_KEYS.dailyUpdates, initialDailyUpdates))
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(() => loadLocalStorage(STORAGE_KEYS.weightHistory, initialWeightHistory))
  const [weightTableData, setWeightTableData] = useState<WeightTableEntry[]>(() => loadLocalStorage(STORAGE_KEYS.weightTable, initialWeightTable))
  const [notifications, setNotifications] = useState<Notification[]>(() => loadLocalStorage(STORAGE_KEYS.notifications, initialNotifications))
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadLocalStorage(STORAGE_KEYS.chatMessages, initialChatMessages))
  const [dismissedSignals, setDismissedSignals] = useState<string[]>(() =>
    loadLocalStorage<string[]>(STORAGE_KEYS.actionCenter, []),
  )
  // Offline fallback: deterministic history over the locally held members.
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() =>
    buildSampleLogs(60, loadLocalStorage(STORAGE_KEYS.clients, initialClients)),
  )
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([
    { id: 1, name: 'Full Body Blast', focus: 'Full Body', exercises: ['Push-ups 3×15','Squats 3×20','Pull-ups 3×10','Plank 3×1min'], duration: '45 min', intensity: 'High' },
    { id: 2, name: 'Core Crusher', focus: 'Core', exercises: ['Crunches 4×20','Russian Twists 3×20','Leg Raises 4×15','Plank 4×1min'], duration: '30 min', intensity: 'Medium' },
    { id: 3, name: 'HIIT Cardio', focus: 'Cardio', exercises: ['Jump Rope 5min','Burpees 3×15','Mountain Climbers 3×1min','Box Jumps 3×10'], duration: '35 min', intensity: 'Very High' },
  ])
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const [isHydrating, setIsHydrating] = useState(true)
  const nextWorkoutIdRef = { current: 4 }

  // Sync state changes to localStorage
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.clients, clients) }, [clients])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.dailyUpdates, dailyUpdates) }, [dailyUpdates])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.weightHistory, weightHistory) }, [weightHistory])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.weightTable, weightTableData) }, [weightTableData])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.notifications, notifications) }, [notifications])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.chatMessages, chatMessages) }, [chatMessages])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.actionCenter, dismissedSignals) }, [dismissedSignals])

  useEffect(() => {
    // Hydrate from backend when available (all calls go through the api service)
    const fetchData = async () => {
      setIsHydrating(true)
      try {
        const [remoteClients, remoteUpdates, remoteHist, remoteTable, remoteNotifs, msgs, remoteAttendance, dismissed] =
          await Promise.all([
            api.getClients(),
            api.getDailyUpdates(),
            api.getWeightHistory(),
            api.getWeightTable(),
            api.getNotifications(),
            api.getChatMessages(),
            api.getAttendance(),
            api.getDismissedSignals(),
          ])

        if (remoteClients && remoteClients.length > 0) {
          setClients(normalizeClients(remoteClients))
          setIsBackendConnected(true)
        } else if (remoteClients) {
          setClients([])
          setIsBackendConnected(true)
        } else {
          console.warn('Backend unavailable, using local state / offline fallback')
          setIsBackendConnected(false)
        }
        // A successful response replaces the local copy even when empty —
        // otherwise a member session would keep a stale full-roster cache.
        if (remoteUpdates) setDailyUpdates(remoteUpdates)
        if (remoteHist) setWeightHistory(remoteHist)
        if (remoteTable) setWeightTableData(remoteTable)
        if (remoteNotifs) setNotifications(remoteNotifs)
        if (msgs) setChatMessages(msgs)
        // Attendance: prefer real records; keep the deterministic fallback otherwise.
        if (remoteAttendance && remoteAttendance.length > 0) setAttendanceLogs(remoteAttendance)
        if (dismissed) setDismissedSignals((prev) => [...new Set([...prev, ...dismissed])])
      } catch (err) {
        console.error('Initial hydration failed, continuing with local data', err)
      } finally {
        setIsHydrating(false)
      }
    }
    fetchData()
    // Re-runs when the session changes: the very first attempt happens before
    // anyone has signed in (and is therefore rejected), so the workspace must
    // re-read everything once a token exists — and drop server data on logout.
  }, [user])
  
  const addClient = async (data: Omit<Client, 'id' | 'avatar' | 'avatarColor'>) => {
    const avatar = getInitials(data.name)
    const avatarColor = randomAvatarColor()
    const newTempId = generateTempId()
    // Derive status/days-left from the dates the form supplied.
    const clientToAdd = normalizeClient({ ...data, id: newTempId, avatar, avatarColor })

    // Optimistic update
    setClients(prev => [...prev, clientToAdd])
    addNotification(`New client "${data.name}" has been added`, 'success')

    const savedClient = await api.createClient({ ...data, avatar, avatarColor })
    if (savedClient) {
      setClients(prev => prev.map(c => c.id === newTempId ? normalizeClient(savedClient) : c))
    }
  }

  const updateClient = async (id: number, data: Partial<Client>) => {
    // Optimistic update — merge then re-derive the stored membership fields.
    setClients(prev => prev.map(c => c.id === id ? normalizeClient({ ...c, ...data }) : c))

    const updated = await api.updateClient(id, data)
    if (updated) {
      setClients(prev => prev.map(c => c.id === id ? normalizeClient(updated) : c))
    }
  }

  const deleteClient = async (id: number) => {
    const client = clients.find(c => c.id === id)
    // Optimistic delete
    setClients(prev => prev.filter(c => c.id !== id))
    if (client) addNotification(`Client "${client.name}" has been removed`, 'warning')

    await api.deleteClient(id)
  }

  const addDailyUpdate = async (update: DailyUpdate) => {
    setDailyUpdates(prev => [update, ...prev])
    const newUpdate = await api.createDailyUpdate(update)
    if (newUpdate) {
      setDailyUpdates(prev => [newUpdate, ...prev.slice(1)])
    }
  }

  const addWeightEntry = async (entry: WeightEntry) => {
    // Stamp ownership so the API can scope the log to one member.
    const owned: WeightEntry = { ...entry, clientId: entry.clientId ?? user?.clientId ?? null }
    setWeightHistory(prev => [...prev, owned])
    const newEntry = await api.createWeightEntry(owned)
    if (newEntry) {
      setWeightHistory(prev => [...prev.slice(0, -1), newEntry])
    }
  }

  const addWeightTableEntry = async (entry: WeightTableEntry) => {
    const owned: WeightTableEntry = { ...entry, clientId: entry.clientId ?? user?.clientId ?? null }
    setWeightTableData(prev => [owned, ...prev])
    const newEntry = await api.createWeightTableEntry(owned)
    if (newEntry) {
      setWeightTableData(prev => [newEntry, ...prev.slice(1)])
    }
  }

  const addNotification = async (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const time = timeNow()
    const tempId = generateTempId()
    const newNotif: Notification = { id: tempId, message, time, read: false, type }

    setNotifications(prev => [newNotif, ...prev])

    const savedNotif = await api.createNotification({ message, time, type })
    if (savedNotif) {
      setNotifications(prev => prev.map(n => n.id === tempId ? savedNotif : n))
    }
  }

  const markNotificationRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await api.markNotificationRead(id)
  }

  const clearNotifications = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await api.markAllNotificationsRead()
  }

  const addChatMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp' | 'time'>) => {
    const time = timeNow()
    const timestamp = new Date().toISOString()
    const tempId = generateTempId()
    const newMsg: ChatMessage = { ...msg, id: tempId, timestamp, time }

    setChatMessages(prev => [...prev, newMsg])

    const savedMsg = await api.createChatMessage({ ...msg, time, timestamp })
    if (savedMsg) {
      setChatMessages(prev => prev.map(m => m.id === tempId ? savedMsg : m))
    }
  }

  /**
   * Record a check-in. Writes through to the API and only reports success
   * when the server actually accepted it — callers must not assume success.
   */
  const addAttendanceLog = async (log: Omit<AttendanceLog, 'id'>): Promise<boolean> => {
    const tempId = generateTempId()
    setAttendanceLogs(prev => [...prev.filter(l => !(l.clientId === log.clientId && l.date === log.date)), { ...log, id: tempId }])

    const result = await api.createAttendance(log)
    if (result.ok && result.data) {
      setAttendanceLogs(prev => prev.map(l => (l.id === tempId ? result.data! : l)))
      return true
    }

    if (result.reachable) {
      // The server refused — roll the optimistic row back so we don't
      // present a check-in that was never stored.
      setAttendanceLogs(prev => prev.filter(l => l.id !== tempId))
      return false
    }
    // Offline: keep the local record so the operator can see what they did.
    return true
  }

  const removeAttendanceLog = async (id: number): Promise<boolean> => {
    const snapshot = attendanceLogs
    setAttendanceLogs(prev => prev.filter(l => l.id !== id))
    const result = await api.deleteAttendance(id)
    if (!result.ok && result.reachable) {
      setAttendanceLogs(snapshot)
      return false
    }
    return true
  }

  const dismissSignal = (signalId: string) => {
    setDismissedSignals(prev => (prev.includes(signalId) ? prev : [...prev, signalId]))
    void api.dismissSignal(signalId, user?.email)
  }

  const restoreSignal = (signalId: string) => {
    setDismissedSignals(prev => prev.filter(s => s !== signalId))
    void api.restoreSignal(signalId)
  }

  const addSavedWorkout = (workout: Omit<SavedWorkout, 'id'>) => {
    const id = nextWorkoutIdRef.current++
    setSavedWorkouts(prev => [...prev, { ...workout, id }])
  }

  const deleteSavedWorkout = (id: number) => {
    setSavedWorkouts(prev => prev.filter(w => w.id !== id))
  }

  return (
    <DataContext.Provider value={{
      clients, addClient, updateClient, deleteClient,
      dailyUpdates, addDailyUpdate,
      weightHistory, addWeightEntry,
      weightTableData, addWeightTableEntry,
      notifications, addNotification, markNotificationRead, clearNotifications,
      chatMessages, addChatMessage,
      attendanceLogs, addAttendanceLog, removeAttendanceLog,
      dismissedSignals, dismissSignal, restoreSignal,
      savedWorkouts, addSavedWorkout, deleteSavedWorkout,
      isBackendConnected, isHydrating
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
