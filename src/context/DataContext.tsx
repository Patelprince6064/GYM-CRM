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
import { getInitials, randomAvatarColor, timeNow } from '../utils'

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
  addAttendanceLog: (log: Omit<AttendanceLog, 'id'>) => void
  savedWorkouts: SavedWorkout[]
  addSavedWorkout: (workout: Omit<SavedWorkout, 'id'>) => void
  deleteSavedWorkout: (id: number) => void
  isBackendConnected: boolean
}

const DataContext = createContext<DataContextType | null>(null)

function generateMockAttendanceLogs(): AttendanceLog[] {
  const clientIds = [1,2,3,4,5,6,7,8]
  const logs: AttendanceLog[] = []
  let id = 1
  const checkInTimes = ['06:15 AM','06:45 AM','07:00 AM','07:30 AM','08:00 AM','08:15 AM','08:45 AM','09:00 AM','09:30 AM','10:00 AM']
  const checkOutTimes = ['07:15 AM','07:45 AM','08:15 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM']
  for (const clientId of clientIds) {
    for (let d = 0; d < 30; d++) {
      const date = new Date()
      date.setDate(date.getDate() - d)
      const dow = date.getDay()
      const isWeekend = dow === 0 || dow === 6
      const present = !isWeekend && Math.random() > 0.25
      const ciIdx = Math.floor(Math.random() * checkInTimes.length)
      logs.push({
        id: id++,
        clientId,
        date: date.toISOString().split('T')[0],
        checkInTime: present ? checkInTimes[ciIdx] : '',
        checkOutTime: present ? checkOutTimes[ciIdx] : undefined,
        present,
      })
    }
  }
  return logs
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
  const [clients, setClients] = useState<Client[]>(() => loadLocalStorage(STORAGE_KEYS.clients, initialClients))
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>(() => loadLocalStorage(STORAGE_KEYS.dailyUpdates, initialDailyUpdates))
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>(() => loadLocalStorage(STORAGE_KEYS.weightHistory, initialWeightHistory))
  const [weightTableData, setWeightTableData] = useState<WeightTableEntry[]>(() => loadLocalStorage(STORAGE_KEYS.weightTable, initialWeightTable))
  const [notifications, setNotifications] = useState<Notification[]>(() => loadLocalStorage(STORAGE_KEYS.notifications, initialNotifications))
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadLocalStorage(STORAGE_KEYS.chatMessages, initialChatMessages))
  const [attendanceLogs] = useState<AttendanceLog[]>(generateMockAttendanceLogs)
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([
    { id: 1, name: 'Full Body Blast', focus: 'Full Body', exercises: ['Push-ups 3×15','Squats 3×20','Pull-ups 3×10','Plank 3×1min'], duration: '45 min', intensity: 'High' },
    { id: 2, name: 'Core Crusher', focus: 'Core', exercises: ['Crunches 4×20','Russian Twists 3×20','Leg Raises 4×15','Plank 4×1min'], duration: '30 min', intensity: 'Medium' },
    { id: 3, name: 'HIIT Cardio', focus: 'Cardio', exercises: ['Jump Rope 5min','Burpees 3×15','Mountain Climbers 3×1min','Box Jumps 3×10'], duration: '35 min', intensity: 'Very High' },
  ])
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const nextWorkoutIdRef = { current: 4 }

  // Sync state changes to localStorage
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.clients, clients) }, [clients])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.dailyUpdates, dailyUpdates) }, [dailyUpdates])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.weightHistory, weightHistory) }, [weightHistory])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.weightTable, weightTableData) }, [weightTableData])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.notifications, notifications) }, [notifications])
  useEffect(() => { saveLocalStorage(STORAGE_KEYS.chatMessages, chatMessages) }, [chatMessages])

  useEffect(() => {
    // Hydrate from backend when available (all calls go through the api service)
    const fetchData = async () => {
      const [remoteClients, remoteUpdates, remoteHist, remoteTable, remoteNotifs, msgs] = await Promise.all([
        api.getClients(),
        api.getDailyUpdates(),
        api.getWeightHistory(),
        api.getWeightTable(),
        api.getNotifications(),
        api.getChatMessages(),
      ])

      if (remoteClients && remoteClients.length > 0) {
        setClients(remoteClients)
        setIsBackendConnected(true)
      } else if (remoteClients) {
        setIsBackendConnected(true)
      } else {
        console.warn('Backend unavailable, using local state / offline fallback')
        setIsBackendConnected(false)
      }
      if (remoteUpdates && remoteUpdates.length > 0) setDailyUpdates(remoteUpdates)
      if (remoteHist && remoteHist.length > 0) setWeightHistory(remoteHist)
      if (remoteTable && remoteTable.length > 0) setWeightTableData(remoteTable)
      if (remoteNotifs && remoteNotifs.length > 0) setNotifications(remoteNotifs)
      if (msgs && msgs.length > 0) setChatMessages(msgs)
    }
    fetchData()
  }, [])
  
  const addClient = async (data: Omit<Client, 'id' | 'avatar' | 'avatarColor'>) => {
    const avatar = getInitials(data.name)
    const avatarColor = randomAvatarColor()
    const newTempId = generateTempId()
    const clientToAdd: Client = { ...data, id: newTempId, avatar, avatarColor }

    // Optimistic update
    setClients(prev => [...prev, clientToAdd])
    addNotification(`New client "${data.name}" has been added`, 'success')

    const savedClient = await api.createClient({ ...data, avatar, avatarColor })
    if (savedClient) {
      setClients(prev => prev.map(c => c.id === newTempId ? savedClient : c))
    }
  }

  const updateClient = async (id: number, data: Partial<Client>) => {
    // Optimistic update
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))

    const updated = await api.updateClient(id, data)
    if (updated) {
      setClients(prev => prev.map(c => c.id === id ? updated : c))
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
    setWeightHistory(prev => [...prev, entry])
    const newEntry = await api.createWeightEntry(entry)
    if (newEntry) {
      setWeightHistory(prev => [...prev.slice(0, -1), newEntry])
    }
  }

  const addWeightTableEntry = async (entry: WeightTableEntry) => {
    setWeightTableData(prev => [entry, ...prev])
    const newEntry = await api.createWeightTableEntry(entry)
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

  const addAttendanceLog = (log: Omit<AttendanceLog, 'id'>) => {
    console.log('Attendance log added (mock):', log)
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
      attendanceLogs, addAttendanceLog,
      savedWorkouts, addSavedWorkout, deleteSavedWorkout,
      isBackendConnected
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
